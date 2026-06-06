# ==============================================================================
# Enterprise MLOps Platform - Terraform Variables
# ==============================================================================

variable "aws_region" {
  type        = string
  description = "Target AWS Region for deployment"
  default     = "us-east-1"
}

variable "environment" {
  type        = string
  description = "Target Environment name"
  default     = "production"
}
