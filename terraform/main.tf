# ==============================================================================
# Enterprise MLOps Platform - Terraform Core Infrastructure Config
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# 1. Dedicated VPC for MLOps Pipeline & serving
resource "aws_vpc" "mlops_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "mlops-enterprise-vpc"
    Environment = var.environment
    Platform    = "MLOps"
  }
}

# Subnets & Networking
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.mlops_vpc.id
  cidr_block              = "10.0.${count.index}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "mlops-public-subnet-${count.index}"
  }
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.mlops_vpc.id
  tags   = { Name = "mlops-gw" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.mlops_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

data "aws_availability_zones" "available" {
  state = "available"
}

# 2. S3 Bucket for DVC Data Versioning and MLflow Artifact Store
resource "aws_s3_bucket" "ml_artifacts" {
  bucket        = "bank-mlops-artifacts-store-${var.environment}"
  force_destroy = true

  tags = {
    Name        = "bank-mlops-artifacts-store"
    Description = "Storage for DVC datasets, models, and MLflow runs"
  }
}

resource "aws_s3_bucket_versioning" "artifacts_versioning" {
  bucket = aws_s3_bucket.ml_artifacts.id
  versioning_configuration {
    status = "Enabled"
  }
}

# 3. Redis Cache (ElastiCache) for Feast Online Feature Store
resource "aws_elasticache_cluster" "feast_online_redis" {
  cluster_id           = "feast-online-store"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  security_group_ids   = [aws_security_group.redis_sg.id]
  subnet_group_name    = aws_elasticache_subnet_group.redis_subnet_group.name
}

resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name       = "feast-redis-subnet-group"
  subnet_ids = aws_subnet.public[*].id
}

# 4. Amazon EKS Cluster for Kubeflow and Triton serving
resource "aws_eks_cluster" "mlops_cluster" {
  name     = "mlops-eks-${var.environment}"
  role_arn = aws_iam_role.eks_role.arn

  vpc_config {
    subnet_ids = aws_subnet.public[*].id
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy
  ]
}

# Node Groups (GPU-enabled for Triton Serving & CPU/Memory for Kubeflow)
resource "aws_eks_node_group" "cpu_workers" {
  cluster_name    = aws_eks_cluster.mlops_cluster.name
  node_group_name = "cpu-node-group"
  node_role_arn   = aws_iam_role.node_role.arn
  subnet_ids      = aws_subnet.public[*].id

  scaling_config {
    desired_size = 2
    max_size     = 4
    min_size     = 1
  }

  instance_types = ["m5.large"]
}

resource "aws_eks_node_group" "gpu_workers" {
  cluster_name    = aws_eks_cluster.mlops_cluster.name
  node_group_name = "gpu-node-group-triton"
  node_role_arn   = aws_iam_role.node_role.arn
  subnet_ids      = aws_subnet.public[*].id

  scaling_config {
    desired_size = 1
    max_size     = 2
    min_size     = 0
  }

  instance_types = ["g4dn.xlarge"] # GPU instance for Triton Inference Server
}

# Security Groups and Roles (Omitted details for brevity, standard IAM definitions)
resource "aws_security_group" "redis_sg" {
  name   = "feast-redis-sg"
  vpc_id = aws_vpc.mlops_vpc.id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
}

resource "aws_iam_role" "eks_role" {
  name = "mlops-eks-cluster-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "eks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role_arn   = aws_iam_role.eks_role.name
}

resource "aws_iam_role" "node_role" {
  name = "mlops-eks-node-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "node_worker" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role_arn   = aws_iam_role.node_role.name
}

resource "aws_iam_role_policy_attachment" "node_cni" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role_arn   = aws_iam_role.node_role.name
}

resource "aws_iam_role_policy_attachment" "node_registry" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role_arn   = aws_iam_role.node_role.name
}
