# 🔄 Enterprise MLOps Platform (End-to-End ML Lifecycle)

[![Platform State](https://img.shields.io/badge/MLOps_Platform-ONLINE-emerald?style=for-the-badge&logo=kubernetes&logoColor=white)](http://localhost:3000)
[![Target Sector](https://img.shields.io/badge/Industry-Fintech_/_Banking-blueviolet?style=for-the-badge&logo=accenture&logoColor=white)](#business-scenario)

**Compute & Orchestration**
[![Kubeflow](https://img.shields.io/badge/Kubeflow-Orchestration-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://www.kubeflow.org)
[![AWS EKS](https://img.shields.io/badge/AWS_EKS-Managed_Kubernetes-FF9900?style=for-the-badge&logo=amazonwebservices&logoColor=white)](https://aws.amazon.com/eks/)

**Experiment tracking & Versioning**
[![MLflow](https://img.shields.io/badge/MLflow-Model%20Registry-blue?style=for-the-badge&logo=mlflow&logoColor=white)](https://mlflow.org)
[![Feast](https://img.shields.io/badge/Feast-Feature%20Store-00bfff?style=for-the-badge&logo=redis&logoColor=white)](https://feast.dev)
[![DVC](https://img.shields.io/badge/DVC-Data%20Versioning-9cf?style=for-the-badge&logo=git&logoColor=white)](https://dvc.org)

**Inference Serving & Observability**
[![Triton](https://img.shields.io/badge/Triton-Inference%20Server-76B900?style=for-the-badge&logo=nvidia&logoColor=white)](https://developer.nvidia.com/triton-inference-server)
[![Evidently AI](https://img.shields.io/badge/Evidently_AI-Drift%20Monitor-orange?style=for-the-badge&logo=prometheus&logoColor=white)](https://www.evidentlyai.com)

Welcome to the **Enterprise MLOps Platform**, a production-grade machine learning operations console and control plane designed to automate the training, versioning, audit trail tracking, serving, and continuous statistical monitoring of credit risk scoring classifiers.

This platform simulates and exposes a dual-store feature engine, Kubeflow pipeline orchestrations, MLflow registered metadata lineage, Triton Inference Server dynamic batching benchmarks, and Evidently AI distribution shift analysis.

---

## 📋 Business Scenario & Objective

In commercial banking, deploying machine learning models for credit risk scoring is highly regulated (e.g., under SR 11-7 and Basel regulations). Models cannot be "black boxes" or silent operators. To satisfy strict financial audits:
1. **Verifiable Reproducibility**: Every prediction must be lineage-tracked back to the exact code commit (Git) and training data state (DVC).
2. **Approval Audit Trail**: Promotions to production require explicit human sign-off with verifiable signatures.
3. **Low-Latency serving**: Online applications require inference responses under **sub-100ms** latency constraints under high concurrency.
4. **Data Drift Defense**: To prevent silent performance degradation, model inputs must be continuously monitored for statistical distribution shifts, triggering self-healing retraining cycles automatically.

This project delivers an interactive console simulating this end-to-end lifecycle, demonstrating production-ready cloud-native architecture.

---

## ⚡ Key Architectural Features

* **Dual-Store Feature Serving**: Incorporates a unified feature management flow. Fetches offline historical datasets (simulated S3 Parquet files) for training cycles, and leverages a low-latency Redis online store cache for real-time risk predictions (latency < 5ms).
* **Lineage & Reproducibility**: Cryptographically binds model registry versions in MLflow with their parent Git Commit Hash, S3 DVC Pointer file hash, and Kubeflow Pipeline Run ID.
* **High-Throughput Triton serving**: Configures Triton Inference Server with **Dynamic Batching** to group concurrent requests arriving within a 5ms window, maximizing GPU utilization and throughput.
* **Auto-Retraining Self-Healing Loop**: Installs an Evidently AI sidecar monitoring statistical drift (Wasserstein Distance) on production requests. If drift exceeds the threshold, the system triggers the Kubeflow pipeline automatically to rebuild and deploy an aligned model version.

---

## 📸 Platform Console Tour

The control console integrates the entire ML lifecycle under a responsive, sleek HSL cyber dark-themed UI:

```carousel
![Feast Console](assets/FeastFeatureStore.png)
<!-- slide -->
![Kubeflow DAG](assets/KubeflowOrchestration.png)
<!-- slide -->
![MLflow Lineage](assets/MLflowRegistry.png)
<!-- slide -->
![Triton Serving Playground](assets/TritonServing.png)
<!-- slide -->
![Drift Observatory](assets/DriftObservatory.png)
```

1. **Feast Panel**: Ingest borrower records or query features from Redis Online Cache (sub-5ms) vs S3 Offline Store (~80ms).
2. **Kubeflow DAG Visualizer**: Run model retraining pipelines and inspect live STDOUT stdout streams for preprocess, train, evaluate, and registration steps.
3. **MLflow Registry**: Inspect model versions, verify Git/DVC lineage hashes, and approve state changes with signatures to complete audit trails.
4. **Triton Playground**: Assess credit risk on manual profiles. Adjust client concurrency (1 to 32 threads) to visualize throughput scaling, batch groupings, queue delays, and GPU utilization.
5. **Drift Monitor**: Inspect Wasserstein Distance drift indexes and feature distribution histograms. Inject shifted client data to trigger warning indicators and watch the autopilot retrain loop kick off automatically.

---

## 🏗️ Production Architecture Topology

```text
  [Git Repository] ──(Webhook)──► [GitHub Actions]
          │                               │
    (Code & DVC pointers)          (Triggers Pipeline)
          ▼                               ▼
    [Feast Feature Store] ◄───► [Kubeflow Pipelines (EKS)] ──► [MLflow Registry]
    (Offline / Online data)    (Preprocessing -> Train -> Test)         │
                                                                 (Registers Model)
                                                                        ▼
[Evidently AI + Prometheus] ◄─── [Triton Inference Server] ◄────────────┘
 (Drift Metrics & Alerts)        (Serves Low-Latency API)
```

---

## 📂 Repository Layout

```text
11-enterprise-mlops-platform/
├── Dockerfile.frontend        # Multi-stage Next.js/React & Nginx builder
├── Dockerfile.backend         # Multi-stage Python & FastAPI server
├── docker-compose.yml         # Dev cluster configuration
├── README.md                  # This presentation guide
├── start.sh                   # Autoprovisioning wrapper script
├── stop.sh                    # Teardown wrapper script
│
├── terraform/                 # Infrastructure-as-code
│   ├── main.tf                # VPC, EKS Cluster, node pools, Redis config
│   └── variables.tf
│
├── feature_store/             # Feast definitions
│   ├── feature_store.yaml     # Store configuration
│   └── definitions.py         # Entity and feature view declarations
│
├── pipelines/                 # Kubeflow training pipeline code
│   ├── preprocess.py          # Data scaling/split operations
│   ├── train.py               # XGBoost execution & MLflow registry logging
│   └── pipeline.py            # SDK workflow compiler
│
├── serving/                   # Triton Inference Server configuration
│   └── config.pbtxt           # Input/Output tensors & dynamic batching configurations
│
└── monitoring/
    ├── drift_service.py       # FastAPI backend, math, and telemetry server
    └── dashboards/            # React Client Source Code (Vite setup)
```

---

## 🧠 What You Master (Recruiter Talking Points)

- **MLOps Automation**: Implementing continuous integration, continuous delivery, and continuous training (CI/CD/CT) pipelines.
- **Inference Optimization**: Configuring performance tunings like dynamic batching and execution instances to optimize throughput.
- **Data Engineering & Feature Caching**: Utilizing Feast for feature views, syncing offline analytical stores with low-latency KV online cache stores.
- **Statistical Drift & Observability**: Applying statistical algorithms (like Wasserstein Distance) to compute and alert on data distribution shifts.
- **Governance & Compliance**: Setting up strict model registry lineage, cryptographic reproducibility pointers, and sign-off audits.

---

## 🚀 Step-by-Step Simulation Scenarios

Once the platform is running, you can demonstrate the following scenarios to recruiters or stakeholders:

### Scenario 1: Feast Store Caching Benchmark
- Go to the **Feast Feature Store** tab.
- Enter borrower ID `1001` and retrieve features from the **S3 Offline Parquet** store. Note the latency (~80ms).
- Retrieve features for the same ID from the **Redis Online Cache**. Note the sub-5ms latency, highlighting online query optimizations.

### Scenario 2: Dynamic Batching Scalability
- Navigate to the **Triton Inference** tab.
- Submit a prediction query with a concurrency of `1`. Note the round-trip latency (~5.2ms).
- Slide the concurrency load up to `24` threads. Submit requests. Observe the **Triton Dynamic Batching** visualization: requests are queued and processed together. The throughput increases significantly while the P99 latency remains sub-10ms, verifying server efficiency.

### Scenario 3: Silent Drift Alert & Autopilot Recovery
- Open the **Drift Observatory** tab and note the normal feature distributions.
- Click **Inject Drifted Data** (simulates incoming applicant credit profile drops).
- Watch the dashboard:
  1. The **Data Drift warning** flashes red as Wasserstein distance crosses 0.15.
  2. The production distribution curve shifts left relative to reference baseline.
  3. The **Autopilot Retrain Loop** is kicked off automatically.
- Open the **Kubeflow Pipelines** tab to inspect the logs showing data prep, XGBoost retraining, and model registration.
- Verify the **MLflow Model Registry** has registered and promoted `Version 2`. The drift warning resets back to normal.

---

## ⚡ Local Quickstart

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed and running.
- [Curl](https://curl.se/) installed.

### Step 1: Bootstrapping the Platform
Run the bootstrap shell script from the repository root to build and execute the service containers:
```bash
chmod +x start.sh stop.sh
./start.sh
```

### Step 2: Accessing the Consoles
Once the backend reports ready, load the interfaces:
- **MLOps Control Panel**: [http://localhost:3000](http://localhost:3000)
- **FastAPI API Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **FastAPI Health Status**: [http://localhost:8000/health](http://localhost:8000/health)

### Step 3: Teardown
To stop services and delete the bridge network:
```bash
./stop.sh
```
