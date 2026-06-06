<div align="center">

# 🔄 Enterprise MLOps Platform

### Production-Grade Credit Risk Scoring Lifecycle — End-to-End ML Automation

[![Platform](https://img.shields.io/badge/MLOps_Platform-ONLINE-10b981?style=for-the-badge&logo=kubernetes&logoColor=white)](#quickstart)
[![Industry](https://img.shields.io/badge/Industry-Fintech_/_Banking-8b5cf6?style=for-the-badge&logo=stripe&logoColor=white)](#business-scenario)
[![Python](https://img.shields.io/badge/Python-3.10-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-00bfff?style=for-the-badge)](LICENSE)

---

**Orchestration & Compute**

[![Kubeflow](https://img.shields.io/badge/Kubeflow-Pipeline_Orchestration-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://www.kubeflow.org)
[![AWS EKS](https://img.shields.io/badge/AWS_EKS-Managed_Kubernetes-FF9900?style=for-the-badge&logo=amazonwebservices&logoColor=white)](https://aws.amazon.com/eks/)
[![Terraform](https://img.shields.io/badge/Terraform-Infrastructure_as_Code-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)](https://terraform.io)

**ML Tracking & Feature Engineering**

[![MLflow](https://img.shields.io/badge/MLflow-Model_Registry_%26_Lineage-0194E2?style=for-the-badge&logo=mlflow&logoColor=white)](https://mlflow.org)
[![Feast](https://img.shields.io/badge/Feast-Feature_Store-00bfff?style=for-the-badge&logo=redis&logoColor=white)](https://feast.dev)
[![DVC](https://img.shields.io/badge/DVC-Data_Version_Control-945DD6?style=for-the-badge&logo=git&logoColor=white)](https://dvc.org)

**Inference & Observability**

[![Triton](https://img.shields.io/badge/Triton-Inference_Server-76B900?style=for-the-badge&logo=nvidia&logoColor=white)](https://developer.nvidia.com/triton-inference-server)
[![Evidently](https://img.shields.io/badge/Evidently_AI-Drift_Monitor-f97316?style=for-the-badge&logo=prometheus&logoColor=white)](https://www.evidentlyai.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-REST_API-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-Control_Plane_UI-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)

</div>

---

## 📌 Overview

The **Enterprise MLOps Platform** is a production-grade, cloud-native machine learning operations console designed to automate the complete ML lifecycle for **credit risk scoring** in a regulated financial environment.

It demonstrates how leading banks and fintechs architect end-to-end ML systems — from feature engineering and automated retraining pipelines, to cryptographic audit trails, high-throughput inference, and statistical drift monitoring — all in a single, interactive control plane.

> **Tech stack**: Feast · MLflow · DVC · Kubeflow · XGBoost · Triton Inference Server · Evidently AI · FastAPI · React · AWS EKS · Terraform

---

## 📸 Platform Console — Live Screenshots

> The Enterprise MLOps Control Plane runs as a fully interactive React dashboard backed by a FastAPI telemetry server. All 5 operational domains are accessible via the navigation bar.

### 1️⃣ Feast Dual-Store Feature Engine

![Feast Feature Store Console](assets/FeastFeatureStore.png)

Fetch borrower feature vectors in real-time from Redis Online Cache (sub-5ms) or query the S3 Parquet offline store (~80ms). Ingest new borrower records directly into both stores simultaneously.

---

### 2️⃣ Kubeflow Pipeline Orchestration

![Kubeflow Pipeline DAG](assets/KubeflowOrchestration.png)

Visualize the 4-node training pipeline DAG (Ingest → Preprocess → XGBoost Fit → Evaluation). Trigger retraining runs and monitor live STDOUT log streams from the execution container.

---

### 3️⃣ MLflow Model Registry & Audit Lineage

![MLflow Model Registry](assets/MLflowRegistry.png)

Track all registered credit risk model versions with their AUC metrics, serving stage (Production/Staging/Archived), and full cryptographic compliance lineage — Git commit SHAs, DVC dataset hashes, Kubeflow Run IDs, and regulatory sign-off signatures.

---

### 4️⃣ Triton Inference Serving Engine

![Triton Serving Playground](assets/TritonServing.png)

Submit credit risk prediction requests against the XGBoost model via the Triton-powered API. Adjust concurrency (1–32 threads) to observe dynamic batching behavior, GPU utilization, P99 latency, and throughput scaling in real time.

---

### 5️⃣ Evidently AI Drift Observatory

![Data Drift Observatory](assets/DriftObservatory.png)

Monitor Wasserstein Distance distributions across all 5 feature parameters. Inject covariate drift to trigger the alarm and watch the autopilot self-healing retrain loop dispatch automatically.

---

## 🏗️ System Architecture

### High-Level Platform Topology

```mermaid
graph TB
    subgraph "👤 Data & Triggers"
        A[("📦 S3 Parquet\nOffline Store")]
        B[("⚡ Redis\nOnline Cache")]
        C[("🔀 Git Repository\n+ DVC Pointers")]
    end

    subgraph "🔧 CI/CD Automation Layer"
        D["🚦 GitHub Actions\nCI/CD Workflows"]
        E["🔍 Lint & Validate\nPipeline"]
        F["📤 ECR Image Push\n+ EKS Deploy"]
    end

    subgraph "🍽️ Feast Feature Store"
        G["📋 Feature Registry\n(Definitions)"]
        H["🔄 Offline→Online\nMaterialization Sync"]
        A -->|"Historical batch data"| G
        B -->|"Real-time cache"| G
        G --> H
    end

    subgraph "🎯 Kubeflow Pipelines — EKS"
        I["1️⃣ FEAST INGEST\nData Pull"]
        J["2️⃣ PREPROCESS\nScale + Split"]
        K["3️⃣ XGBOOST FIT\nHyperparameter Tune"]
        L["4️⃣ EVALUATION\nAUC / F1 / Accuracy"]
        I --> J --> K --> L
    end

    subgraph "📊 MLflow Registry"
        M["🗃️ Model Versioning\nv1 · v2 · v3"]
        N["🔐 Lineage Binding\nGit SHA + DVC Hash"]
        O["✅ Compliance Sign-off\nRegulatory Audit Trail"]
        M --> N --> O
    end

    subgraph "⚡ Triton Inference Server"
        P["🔄 Dynamic Batching\n5ms grouping window"]
        Q["🖥️ XGBoost Kernel\nGPU Execution"]
        P --> Q
    end

    subgraph "📡 Evidently AI Monitoring"
        R["📈 Wasserstein Distance\nDistribution Tracking"]
        S{"⚠️ Drift >\n0.15 Threshold?"}
        T["🔁 Autopilot Retrain\nKubeflow Trigger"]
        R --> S
        S -->|"YES"| T
        S -->|"NO"| R
    end

    C --> D --> E --> F
    H --> I
    L --> M
    O --> P
    Q -->|"Production traffic"| R
    T -->|"Re-trigger pipeline"| I
```

---

### ML Data Flow — Training Cycle

```mermaid
sequenceDiagram
    autonumber
    participant Dev as 👨‍💻 Developer
    participant GHA as 🚦 GitHub Actions
    participant Feast as 🍽️ Feast Store
    participant KF as 🎯 Kubeflow
    participant MLflow as 📊 MLflow
    participant Triton as ⚡ Triton Server

    Dev->>GHA: git push → pipelines/**
    GHA->>GHA: Lint Python + Validate DVC pointers
    GHA->>KF: Submit Pipeline Run via SDK

    KF->>Feast: Pull offline feature vectors (S3 Parquet)
    Feast-->>KF: Borrower feature matrix (100k rows)

    KF->>KF: Preprocess (Scale + Train/Test split)
    KF->>KF: XGBoost GridSearch (n_estimators, max_depth, lr)
    KF->>KF: Evaluate → AUC=0.94, F1=0.89, Acc=0.92

    KF->>MLflow: Register model with Git SHA + DVC Hash + Run ID
    MLflow-->>KF: Version confirmed (v3 → Staging)

    MLflow->>Triton: Deploy model artifact to serving cluster
    Triton-->>Dev: ✅ Endpoint live at /api/triton/predict
```

---

### Data Drift Auto-Healing Loop

```mermaid
flowchart LR
    A["📡 Production\nPrediction Requests"] --> B["📊 Evidently AI\nSidecar Monitor"]
    B --> C{"Wasserstein Distance\n> 0.15 threshold?"}

    C -->|"✅ STABLE"| D["📈 Normal\nDistribution\nMonitoring"]
    D --> A

    C -->|"🚨 DRIFT ALERT"| E["🔴 Alarm Triggered\nSlack/PagerDuty Alert"]
    E --> F["🔁 Autopilot:\nDispatch Kubeflow\nRetrain Run"]
    F --> G["🔧 Retrain on Fresh\nOffline Data (Feast S3)"]
    G --> H["📊 Re-register Model\nMLflow Registry"]
    H --> I["🚀 Rolling Deploy\nNew Model → Triton"]
    I --> J["🟢 Drift Reset\nBaseline Realigned"]
    J --> A
```

---

### Triton Inference Dynamic Batching

```mermaid
graph LR
    subgraph "🔀 Client Concurrency Layer"
        C1["req_001"]
        C2["req_002"]
        C3["req_003"]
        C4["req_004 ... req_N"]
    end

    subgraph "⏱️ 5ms Batching Window"
        B["🗂️ Request Queue\nBatch Collector"]
    end

    subgraph "🖥️ GPU Kernel Execution"
        G["⚡ XGBoost TensorRT\nParallel Batch Inference"]
    end

    subgraph "📤 Response Dispatch"
        R1["✅ APPROVED 94.2%"]
        R2["❌ DENIED 21.8%"]
        R3["✅ APPROVED 88.5%"]
    end

    C1 & C2 & C3 & C4 --> B
    B -->|"Batch n=16"| G
    G --> R1 & R2 & R3
```

---

### CI/CD Pipeline Workflow

```mermaid
flowchart TD
    A["🔀 Pull Request\nor Push to main"] --> B["🚦 GitHub Actions Triggered"]

    B --> C["🔍 Job: lint-and-validate"]
    C --> C1["actions/checkout@v4"]
    C1 --> C2["actions/setup-python@v5\n(Python 3.10 + pip cache)"]
    C2 --> C3["pip install -r requirements.txt"]
    C3 --> C4["flake8 pipelines/ —- syntax check"]
    C4 --> C5["dvc doctor — pointer validation"]

    C5 -->|"✅ Pass"| D["🏗️ Job: build-and-push"]
    C5 -->|"❌ Fail"| Z["🛑 Pipeline Blocked"]

    D --> D1["Validate serving/config.pbtxt"]
    D1 --> D2["docker build Dockerfile.backend"]
    D2 --> D3["Push image → AWS ECR"]

    D3 --> E["🚀 Job: k8s-deploy"]
    E --> E1["kubectl set image\ntriton-serving-deployment"]
    E1 --> E2["kubectl rollout status"]
    E2 --> F["🟢 Deployment\nComplete"]
```

---

## ⚡ Key Architectural Features

| Feature | Technology | Detail |
|---|---|---|
| **Dual-Store Feature Serving** | Feast + Redis + S3 | Sub-5ms online cache vs 80ms offline Parquet queries |
| **Cryptographic Lineage** | MLflow + DVC + Git | Every model version linked to Git SHA, DVC hash, and Kubeflow Run ID |
| **Dynamic Batching** | Triton Inference Server | Groups requests in 5ms window → maximizes GPU throughput |
| **Auto-Healing Loop** | Evidently AI + Kubeflow | Wasserstein drift > 0.15 triggers automatic retraining pipeline |
| **Regulatory Audit Trail** | MLflow + Sign-off API | Human compliance approval required before Production promotion |
| **Infrastructure as Code** | Terraform | VPC, EKS cluster, node pools, Redis all provisioned declaratively |

---

## 📂 Repository Structure

```
11-enterprise-mlops-platform/
│
├── 📄 README.md                    # This guide
├── 🐳 Dockerfile.backend           # FastAPI + MLOps Python server
├── 🐳 Dockerfile.frontend          # React + Nginx static bundle
├── 🐳 docker-compose.yml           # Local development cluster
├── 📋 requirements.txt             # Python dependencies (CI/CD + Docker)
├── 🚀 start.sh                     # Bootstrap all platform services
├── 🛑 stop.sh                      # Teardown all containers + networks
│
├── 📁 .github/
│   └── workflows/
│       ├── train_pipeline.yml      # CI: Lint → DVC validate → Kubeflow trigger
│       └── deploy_serving.yml      # CD: Triton config validate → ECR → EKS deploy
│
├── 📁 terraform/
│   ├── main.tf                     # VPC, EKS cluster, Redis ElastiCache, node pools
│   └── variables.tf                # Parameterized environment variables
│
├── 📁 feature_store/
│   ├── feature_store.yaml          # Feast provider + offline/online store config
│   └── definitions.py              # Entity, FeatureView, and feature definitions
│
├── 📁 pipelines/
│   ├── preprocess.py               # Data scaling, normalization, train/test split
│   ├── train.py                    # XGBoost GridSearch + MLflow autologging
│   └── pipeline.py                 # Kubeflow SDK pipeline compiler & DAG wiring
│
├── 📁 serving/
│   └── config.pbtxt                # Triton model config: inputs, outputs, dynamic batching
│
├── 📁 assets/
│   ├── FeastFeatureStore.png       # Console screenshots
│   ├── KubeflowOrchestration.png
│   ├── MLflowRegistry.png
│   ├── TritonServing.png
│   └── DriftObservatory.png
│
└── 📁 monitoring/
    ├── drift_service.py            # FastAPI backend: telemetry, drift math, API routes
    └── dashboards/                 # React control plane UI (Vite + Lucide + SVG charts)
        ├── src/
        │   ├── App.jsx             # 5-tab MLOps dashboard: Feature→Pipeline→Registry→Triton→Drift
        │   └── index.css           # Cyber-dark HUD glassmorphism design system
        └── package.json
```

---

## 📋 Business Scenario

In commercial banking, deploying ML models for credit risk scoring is **highly regulated** (SR 11-7, Basel III, ECOA). Models cannot be silent black boxes.

To satisfy strict financial audits, this platform enforces:

```mermaid
mindmap
  root((🏦 Regulated\nCredit Risk ML))
    Reproducibility
      Git commit SHA binding
      DVC dataset hash tracking
      Kubeflow Run ID linkage
    Governance
      Human approval sign-off
      Audit trail per version
      Staging → Production gating
    Performance
      Sub-100ms inference SLA
      Dynamic batching queues
      GPU utilization monitoring
    Data Quality
      Wasserstein Distance tracking
      Covariate drift detection
      Autopilot self-healing loop
```

---

## 🚀 Local Quickstart

### Prerequisites

- [Docker Desktop](https://docs.docker.com/get-docker/) (with Compose)
- Port `3000` and `8000` must be free

### Step 1 — Bootstrap the Platform

```bash
# Clone the repository
git clone https://github.com/humeshdeshmukh/enterprise-mlops-platform.git
cd enterprise-mlops-platform

# Bootstrap all Docker services (builds backend + frontend containers)
chmod +x start.sh stop.sh
./start.sh
```

The bootstrap script will:
1. Create the `mlops-net` Docker bridge network
2. Build and start the **FastAPI MLOps backend** (port `8000`)
3. Build and deploy the **React Control Plane** via Nginx (port `3000`)
4. Health-check the backend before reporting success

### Step 2 — Access the Control Plane

| Interface | URL | Description |
|---|---|---|
| 🖥️ **React Dashboard** | http://localhost:3000 | Interactive MLOps control plane |
| 📜 **API Swagger Docs** | http://localhost:8000/docs | FastAPI auto-generated REST docs |
| 🩺 **Health Check** | http://localhost:8000/health | Backend liveness status |

### Step 3 — Teardown

```bash
./stop.sh
```

---

## 🎯 Simulation Scenarios (Recruiter Demo Guide)

### Scenario 1 — Feast Caching Benchmark

```
Tab: Feast Feature Store
1. Enter Borrower ID: 1001
2. Select: S3 Offline Parquet  → fetch → note latency ~80ms
3. Select: Redis Online Cache  → fetch → note latency <5ms
   ✅ Demonstrates: Low-latency online feature serving for real-time credit decisions
```

### Scenario 2 — Triton Throughput Scaling

```
Tab: Triton Inference
1. Set concurrency slider to 1 → Submit → note P99 ~5.2ms
2. Set concurrency slider to 24 → Submit
   → Watch: Batch Queue fills up with req_200 to req_224
   → Batch Group (n=16) processes together in one GPU kernel
   → Throughput increases, P99 stays sub-10ms
   ✅ Demonstrates: Dynamic batching efficiency under high concurrency
```

### Scenario 3 — Silent Drift → Autopilot Recovery

```
Tab: Drift Observatory
1. Note stable Wasserstein distances for all 5 features
2. Click: [Inject Drifted Data]
   → Alert banner fires: "SILENT DATA COVARIATE DRIFT ALARM"
   → Production distribution shifts left vs baseline reference curve
   → Wasserstein distance crosses 0.15 threshold (highlighted red)
   → "Autopilot Retrain Loop Active" badge activates

Tab: Kubeflow Pipelines
3. See retrain logs streaming: FEAST INGEST → PREPROCESS → XGBOOST FIT → EVALUATION

Tab: MLflow Registry
4. New model version registered + promoted to Production
   → Drift resets, self-healing loop complete
   ✅ Demonstrates: End-to-end auto-recovery from data drift
```

### Scenario 4 — Compliance Audit Sign-off

```
Tab: MLflow Registry
1. Click on a model version to inspect its lineage
   → Git Commit SHA, DVC Cryptographic Hash, Kubeflow Run ID all visible
2. Select a version from the Regulatory Sign-off form
3. Enter target status: Production
4. Enter approver name: Dr. Sarah Connor
5. Click: [Publish Approval Audit]
   ✅ Demonstrates: Regulated model governance with human-in-the-loop sign-off
```

---

## 🧠 Skills Demonstrated

| Domain | Skill |
|---|---|
| **MLOps Engineering** | End-to-end CI/CD/CT pipeline design (GitHub Actions → Kubeflow → MLflow) |
| **Feature Engineering** | Feast dual-store architecture: offline batch + online low-latency cache |
| **ML Governance** | Cryptographic lineage, audit trails, regulatory compliance sign-off workflows |
| **Inference Optimization** | Triton dynamic batching, GPU concurrency, P99 latency benchmarking |
| **Data Observability** | Statistical drift detection (Wasserstein Distance), alert systems, auto-recovery |
| **Infrastructure as Code** | Terraform for VPC, EKS cluster, Redis, and node pool provisioning |
| **Backend Engineering** | FastAPI REST API design, async telemetry server, structured data simulation |
| **Frontend Engineering** | React + Vite control plane with real-time SVG charts and glassmorphic UI |

---

## 🔗 Related Resources

- [Feast Feature Store Documentation](https://docs.feast.dev)
- [MLflow Model Registry Guide](https://mlflow.org/docs/latest/model-registry.html)
- [Kubeflow Pipelines SDK](https://www.kubeflow.org/docs/components/pipelines/)
- [Triton Inference Server Docs](https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/)
- [Evidently AI Drift Reports](https://docs.evidentlyai.com)
- [AWS EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)

---

<div align="center">

**Built for production-grade MLOps demonstration**

⭐ Star this repository if it helped you learn enterprise ML engineering patterns!

</div>
