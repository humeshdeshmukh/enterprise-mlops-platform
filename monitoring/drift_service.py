# ==============================================================================
# Enterprise MLOps Platform - FastAPI Control Plane & Drift Service
# ==============================================================================

import time
import random
import threading
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="Enterprise MLOps Control API",
    description="Simulated backend for Feast, MLflow, Kubeflow, Triton and data drift monitoring",
    version="1.0.0"
)

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# SHARED STATE & SIMULATION DATABASE
# ------------------------------------------------------------------------------
db_lock = threading.Lock()

# Feast Online Cache (Redis mock) and Offline Store
feast_db = {
    "online_cache": {
        1001: {"credit_score": 750, "debt_to_income_ratio": 0.22, "annual_income": 95000.0, "active_loans_count": 1, "repayment_history_score": 0.95},
        1002: {"credit_score": 680, "debt_to_income_ratio": 0.38, "annual_income": 62000.0, "active_loans_count": 3, "repayment_history_score": 0.82},
        1003: {"credit_score": 590, "debt_to_income_ratio": 0.52, "annual_income": 45000.0, "active_loans_count": 5, "repayment_history_score": 0.61},
        1004: {"credit_score": 810, "debt_to_income_ratio": 0.12, "annual_income": 140000.0, "active_loans_count": 0, "repayment_history_score": 0.99},
        1005: {"credit_score": 620, "debt_to_income_ratio": 0.45, "annual_income": 58000.0, "active_loans_count": 2, "repayment_history_score": 0.74},
    },
    "offline_store": [
        {"borrower_id": 1001, "credit_score": 750, "debt_to_income_ratio": 0.22, "annual_income": 95000.0, "active_loans_count": 1, "repayment_history_score": 0.95, "timestamp": "2026-06-05T10:00:00Z"},
        {"borrower_id": 1002, "credit_score": 680, "debt_to_income_ratio": 0.38, "annual_income": 62000.0, "active_loans_count": 3, "repayment_history_score": 0.82, "timestamp": "2026-06-05T11:00:00Z"},
        {"borrower_id": 1003, "credit_score": 590, "debt_to_income_ratio": 0.52, "annual_income": 45000.0, "active_loans_count": 5, "repayment_history_score": 0.61, "timestamp": "2026-06-05T12:00:00Z"},
        {"borrower_id": 1004, "credit_score": 810, "debt_to_income_ratio": 0.12, "annual_income": 140000.0, "active_loans_count": 0, "repayment_history_score": 0.99, "timestamp": "2026-06-05T13:00:00Z"},
        {"borrower_id": 1005, "credit_score": 620, "debt_to_income_ratio": 0.45, "annual_income": 58000.0, "active_loans_count": 2, "repayment_history_score": 0.74, "timestamp": "2026-06-05T14:00:00Z"},
    ]
}

# Kubeflow Pipeline Runs
pipeline_runs = [
    {
        "run_id": "kfp-run-912a3d4",
        "name": "credit-risk-retrain-base",
        "started_at": (datetime.now() - timedelta(days=2)).isoformat(),
        "finished_at": (datetime.now() - timedelta(days=2, minutes=4)).isoformat(),
        "status": "SUCCEEDED",
        "metrics": {"accuracy": 0.884, "auc": 0.912, "f1_score": 0.871},
        "logs": [
            "[INFO] Fetching historical credit scoring features from Feast store...",
            "[INFO] Retrospective window size set to 90 days. Extracted 12,400 entities.",
            "[INFO] Splitting dataset: 80% train, 20% validation.",
            "[INFO] Starting XGBoost hyperparameter search (5 folds cross-validation)...",
            "[INFO] Hyperparameter Search completed: learning_rate=0.05, n_estimators=150, max_depth=4.",
            "[INFO] Evaluation results: Accuracy=0.884, ROC-AUC=0.912, F1=0.871.",
            "[INFO] serializing model weights and generating S3 metadata pointers...",
            "[INFO] Registering model CreditRiskScoringModel in MLflow Model Registry as v1."
        ]
    }
]
current_pipeline_run = None

# MLflow Model Registry
mlflow_registry = {
    "models": [
        {
            "version": 1,
            "name": "CreditRiskScoringModel",
            "run_id": "kfp-run-912a3d4",
            "git_commit": "3c984f1",
            "dvc_hash": "dvc:s3://bank-mlops-artifacts-store-production/v1.tar.gz.dvc (sha256: 4fbc8a2d)",
            "accuracy": 0.884,
            "auc": 0.912,
            "f1_score": 0.871,
            "status": "Production", # Production, Staging, Archived
            "registered_at": (datetime.now() - timedelta(days=2)).isoformat(),
            "approved_by": "Dr. Sarah Connor (Head of ML Risk)",
            "signature": "SHA256:7f81c9a0...3b49c71",
            "history": [
                {"timestamp": (datetime.now() - timedelta(days=2)).isoformat(), "action": "Registered as Version 1", "user": "kfp-runner-agent"},
                {"timestamp": (datetime.now() - timedelta(days=1, hours=23)).isoformat(), "action": "Promoted to Staging", "user": "sarah.connor"},
                {"timestamp": (datetime.now() - timedelta(days=1, hours=22)).isoformat(), "action": "Promoted to Production", "user": "sarah.connor"}
            ]
        }
    ]
}

# Triton Model Serving Stats & History
triton_metrics = {
    "throughput": 124.5, # requests per sec
    "p99_latency_ms": 7.8,
    "queue_latency_ms": 1.2,
    "gpu_utilization": 24.3,
    "dynamic_batch_size": 16,
    "payload_log": [
        {"timestamp": datetime.now().isoformat(), "borrower_id": 1001, "credit_score": 750, "decision": "APPROVED", "probability": 0.92, "latency_ms": 7.4},
        {"timestamp": (datetime.now() - timedelta(seconds=15)).isoformat(), "borrower_id": 1002, "credit_score": 680, "decision": "APPROVED", "probability": 0.78, "latency_ms": 8.1},
        {"timestamp": (datetime.now() - timedelta(seconds=30)).isoformat(), "borrower_id": 1003, "credit_score": 590, "decision": "DENIED", "probability": 0.24, "latency_ms": 7.9}
    ]
}

# Evidently AI Drift Service Data
drift_data = {
    "is_drift_injected": False,
    "drift_threshold": 0.15,
    "retrain_triggered": False,
    "drift_history": [
        # Wasserstein distance metrics logs for past 7 hours
        {"timestamp": (datetime.now() - timedelta(hours=6)).isoformat(), "wasserstein_distance": 0.024, "alert": False},
        {"timestamp": (datetime.now() - timedelta(hours=5)).isoformat(), "wasserstein_distance": 0.021, "alert": False},
        {"timestamp": (datetime.now() - timedelta(hours=4)).isoformat(), "wasserstein_distance": 0.028, "alert": False},
        {"timestamp": (datetime.now() - timedelta(hours=3)).isoformat(), "wasserstein_distance": 0.023, "alert": False},
        {"timestamp": (datetime.now() - timedelta(hours=2)).isoformat(), "wasserstein_distance": 0.025, "alert": False},
        {"timestamp": (datetime.now() - timedelta(hours=1)).isoformat(), "wasserstein_distance": 0.027, "alert": False},
    ],
    "features": {
        "credit_score": {
            "ref_mean": 700.0,
            "ref_std": 50.0,
            "prod_mean": 698.5,
            "prod_std": 51.2,
            "wasserstein": 0.027
        },
        "debt_to_income_ratio": {
            "ref_mean": 0.35,
            "ref_std": 0.10,
            "prod_mean": 0.352,
            "prod_std": 0.098,
            "wasserstein": 0.015
        }
    }
}

# Reference distributions for graph renderings
REFERENCE_CREDIT_SCORES = [int(random.normalvariate(700, 50)) for _ in range(200)]
REFERENCE_DTIS = [round(random.normalvariate(0.35, 0.10), 3) for _ in range(200)]

production_credit_scores = [int(random.normalvariate(698, 51)) for _ in range(200)]
production_dtis = [round(random.normalvariate(0.352, 0.098), 3) for _ in range(200)]

# ------------------------------------------------------------------------------
# MODEL SCHEMAS
# ------------------------------------------------------------------------------
class BorrowerInference(BaseModel):
    credit_score: float
    debt_to_income_ratio: float
    annual_income: float
    active_loans_count: int
    repayment_history_score: float

class IngestionRequest(BaseModel):
    borrower_id: int
    credit_score: int
    debt_to_income_ratio: float
    annual_income: float
    active_loans_count: int
    repayment_history_score: float

class StatusChangeRequest(BaseModel):
    version: int
    status: str
    approver: str

# ------------------------------------------------------------------------------
# BACKGROUND AUTOMATIC RETRAINING PIPELINE
# ------------------------------------------------------------------------------
def run_simulated_pipeline(lr=0.05, n_estimators=150, max_depth=4):
    global current_pipeline_run, pipeline_runs, mlflow_registry
    
    steps = [
        ("PREPROCESSING", "Fetching historical credit scoring features from Feast store...", 2.0),
        ("PREPROCESSING", "Retrospective window size set to 90 days. Extracted 14,800 entities.", 1.5),
        ("PREPROCESSING", "Splitting dataset: 80% train, 20% validation.", 1.0),
        ("TRAINING", "Starting XGBoost hyperparameter search (5 folds cross-validation)...", 3.0),
        ("TRAINING", f"Hyperparameter Search completed: learning_rate={lr}, n_estimators={n_estimators}, max_depth={max_depth}.", 1.5),
        ("EVALUATION", "Evaluation results: Accuracy=0.897, ROC-AUC=0.925, F1=0.889.", 2.0),
        ("DVC_EXPORT", "serializing model weights and generating S3 metadata pointers...", 1.5),
        ("REGISTRATION", "Registering model CreditRiskScoringModel in MLflow Model Registry as Version...", 1.5)
    ]
    
    with db_lock:
        run_id = f"kfp-run-{random.randint(100000, 999999):x}"
        current_pipeline_run = {
            "run_id": run_id,
            "name": f"credit-risk-retrain-{random.randint(100, 999)}",
            "started_at": datetime.now().isoformat(),
            "finished_at": None,
            "status": "RUNNING",
            "metrics": {},
            "logs": ["[INFO] Initializing Kubeflow Pipeline Execution Context..."]
        }
        pipeline_runs.append(current_pipeline_run)
    
    for stage, log, duration in steps:
        time.sleep(duration)
        with db_lock:
            current_pipeline_run["logs"].append(f"[{stage}] {log}")
            if "Version" in log:
                # Add version number dynamically
                next_version = len(mlflow_registry["models"]) + 1
                current_pipeline_run["logs"][-1] += f" {next_version}"
    
    # Complete run
    with db_lock:
        current_pipeline_run["status"] = "SUCCEEDED"
        current_pipeline_run["finished_at"] = datetime.now().isoformat()
        current_pipeline_run["metrics"] = {"accuracy": 0.897, "auc": 0.925, "f1_score": 0.889}
        
        # Add new model version to MLflow
        next_ver = len(mlflow_registry["models"]) + 1
        new_model = {
            "version": next_ver,
            "name": "CreditRiskScoringModel",
            "run_id": run_id,
            "git_commit": f"{random.randint(100000, 999999):x}",
            "dvc_hash": f"dvc:s3://bank-mlops-artifacts-store-production/v{next_ver}.tar.gz.dvc (sha256: {random.randint(10000000, 99999999):x})",
            "accuracy": 0.897,
            "auc": 0.925,
            "f1_score": 0.889,
            "status": "Staging", # Starts in staging
            "registered_at": datetime.now().isoformat(),
            "approved_by": None,
            "signature": None,
            "history": [
                {"timestamp": datetime.now().isoformat(), "action": f"Registered as Version {next_ver}", "user": "kfp-runner-agent"}
            ]
        }
        mlflow_registry["models"].append(new_model)
        
        # Reset drift loop
        drift_data["retrain_triggered"] = False
        drift_data["is_drift_injected"] = False
        
        # Reset production statistics back to normal since model is retrained on new distribution!
        global production_credit_scores, production_dtis
        production_credit_scores = [int(random.normalvariate(700, 50)) for _ in range(200)]
        production_dtis = [round(random.normalvariate(0.35, 0.10), 3) for _ in range(200)]
        
        drift_data["features"]["credit_score"] = {
            "ref_mean": 700.0, "ref_std": 50.0,
            "prod_mean": 701.2, "prod_std": 49.8,
            "wasserstein": 0.018
        }
        drift_data["features"]["debt_to_income_ratio"] = {
            "ref_mean": 0.35, "ref_std": 0.10,
            "prod_mean": 0.348, "prod_std": 0.101,
            "wasserstein": 0.012
        }
        
        # Record normal drift metric
        drift_data["drift_history"].append({
            "timestamp": datetime.now().isoformat(),
            "wasserstein_distance": 0.015,
            "alert": False
        })
        
        # Auto-promote new model to Production after retraining finishes
        for m in mlflow_registry["models"]:
            if m["version"] == next_ver:
                m["status"] = "Production"
                m["approved_by"] = "Auto-Pilot Retrain Loop"
                m["signature"] = f"SHA256:auto{random.randint(1000,9999)}...{random.randint(1000,9999)}"
                m["history"].append({
                    "timestamp": datetime.now().isoformat(),
                    "action": "Promoted to Production",
                    "user": "auto-retrain-loop"
                })
            elif m["status"] == "Production":
                m["status"] = "Archived"
                m["history"].append({
                    "timestamp": datetime.now().isoformat(),
                    "action": "Demoted to Archived",
                    "user": "auto-retrain-loop"
                })
        
        current_pipeline_run = None

# Helper functions for calculations
def calculate_wasserstein(dist1, dist2):
    """Simple 1D Wasserstein distance (earth mover's distance) calculated using sorting of quantiles."""
    s1 = sorted(dist1)
    s2 = sorted(dist2)
    
    # Quantiles integration
    n = min(len(s1), len(s2))
    val = 0.0
    for i in range(n):
        idx1 = int(i * len(s1) / n)
        idx2 = int(i * len(s2) / n)
        val += abs(s1[idx1] - s2[idx2])
    
    # Scale appropriately
    return (val / n)

# ------------------------------------------------------------------------------
# API ROUTING
# ------------------------------------------------------------------------------
@app.get("/health")
def health_check():
    return {"status": "ONLINE", "timestamp": datetime.now().isoformat()}

# --- FEAST ENDPOINTS ---
@app.get("/api/feature-store/entities")
def get_entities():
    return {
        "entity_name": "borrower_id",
        "type": "INT64",
        "description": "Unique identifier of the loan applicant",
        "features": [
            {"name": "credit_score", "type": "Int64", "description": "Credit Score ranging from 300 to 850"},
            {"name": "debt_to_income_ratio", "type": "Float32", "description": "Total monthly debt payments divided by gross monthly income"},
            {"name": "annual_income", "type": "Float32", "description": "Self-reported annual gross income"},
            {"name": "active_loans_count", "type": "Int64", "description": "Number of open credit accounts"},
            {"name": "repayment_history_score", "type": "Float32", "description": "Ratio of on-time payments to total periods"}
        ]
    }

@app.get("/api/feature-store/fetch/{borrower_id}")
def fetch_features(borrower_id: int, store_type: str = "online"):
    # Simulated access latencies
    latency = random.uniform(1.2, 3.4) if store_type == "online" else random.uniform(45.0, 95.0)
    time.sleep(latency / 1000.0) # sleep to represent actual fetch
    
    if borrower_id in feast_db["online_cache"]:
        return {
            "borrower_id": borrower_id,
            "store": store_type,
            "latency_ms": round(latency, 2),
            "features": feast_db["online_cache"][borrower_id]
        }
    
    # Default fallback generation if borrower ID is new
    fallback = {
        "credit_score": random.randint(580, 820),
        "debt_to_income_ratio": round(random.uniform(0.1, 0.6), 2),
        "annual_income": float(random.randint(40000, 150000)),
        "active_loans_count": random.randint(0, 6),
        "repayment_history_score": round(random.uniform(0.7, 1.0), 2)
    }
    return {
        "borrower_id": borrower_id,
        "store": store_type,
        "latency_ms": round(latency, 2),
        "features": fallback
    }

@app.post("/api/feature-store/ingest")
def ingest_features(req: IngestionRequest):
    with db_lock:
        features = {
            "credit_score": req.credit_score,
            "debt_to_income_ratio": req.debt_to_income_ratio,
            "annual_income": req.annual_income,
            "active_loans_count": req.active_loans_count,
            "repayment_history_score": req.repayment_history_score
        }
        # Save to simulated Redis cache and S3 Parquet
        feast_db["online_cache"][req.borrower_id] = features
        feast_db["offline_store"].append({
            "borrower_id": req.borrower_id,
            **features,
            "timestamp": datetime.now().isoformat()
        })
    return {"status": "SUCCESS", "message": f"Features ingested for borrower {req.borrower_id}."}

# --- KUBEFLOW ENDPOINTS ---
@app.get("/api/pipelines/runs")
def get_pipeline_runs():
    return {"runs": pipeline_runs, "current_run": current_pipeline_run}

@app.post("/api/pipelines/trigger")
def trigger_pipeline(background_tasks: BackgroundTasks, lr: float = 0.05, n_estimators: int = 150, max_depth: int = 4):
    global current_pipeline_run
    if current_pipeline_run and current_pipeline_run["status"] == "RUNNING":
        raise HTTPException(status_code=400, detail="A training pipeline run is already in progress.")
    
    background_tasks.add_task(run_simulated_pipeline, lr, n_estimators, max_depth)
    return {"status": "TRIGGERED", "message": "Model retraining pipeline started in Kubeflow."}

# --- MLFLOW REGISTRY ENDPOINTS ---
@app.get("/api/mlflow/registry")
def get_mlflow_registry():
    return mlflow_registry

@app.post("/api/mlflow/status-update")
def update_model_status(req: StatusChangeRequest):
    with db_lock:
        target_model = None
        for m in mlflow_registry["models"]:
            if m["version"] == req.version:
                target_model = m
                break
        
        if not target_model:
            raise HTTPException(status_code=404, detail="Model version not found.")
        
        # Demote current Production model to Archived if promoting this one to Production
        if req.status == "Production":
            for m in mlflow_registry["models"]:
                if m["status"] == "Production" and m["version"] != req.version:
                    m["status"] = "Archived"
                    m["history"].append({
                        "timestamp": datetime.now().isoformat(),
                        "action": "Demoted to Archived",
                        "user": req.approver
                    })
        
        target_model["status"] = req.status
        target_model["approved_by"] = req.approver
        target_model["signature"] = f"SHA256:sig{random.randint(1000, 9999):04x}..{random.randint(1000, 9999):04x}"
        target_model["history"].append({
            "timestamp": datetime.now().isoformat(),
            "action": f"Promoted to {req.status}",
            "user": req.approver
        })
        
    return {"status": "UPDATED", "model": target_model}

# --- TRITON INFERENCE ENDPOINTS ---
@app.post("/api/triton/predict")
def predict_credit_risk(payload: BorrowerInference, concurrency: int = 1):
    # Simulate Triton Dynamic Batching Stats based on concurrency
    # Higher concurrency groups items and causes slightly higher queue delays but better server throughput.
    base_latency = 5.2 # ms
    queue_delay = max(0.2, (concurrency - 1) * 0.8) # ms
    gpu_load = min(98.0, 10.0 + (concurrency * 2.5))
    throughput = concurrency * (1000 / (base_latency + queue_delay))
    
    # Calculate inference score
    # Simple mathematical scoring: low debt, high credit score, high repayment history score = low default risk
    risk_score = 1.0 - (
        (payload.credit_score - 300) / 550 * 0.45 +
        (1.0 - payload.debt_to_income_ratio) * 0.25 +
        (payload.repayment_history_score) * 0.20 +
        (payload.annual_income / 200000) * 0.10
    )
    
    # active loans increases risk slightly
    risk_score += (payload.active_loans_count * 0.03)
    risk_score = max(0.01, min(0.99, risk_score))
    
    decision = "DENIED" if risk_score > 0.42 else "APPROVED"
    
    resp_latency = base_latency + queue_delay + random.uniform(-0.8, 0.8)
    
    # Log prediction payload
    new_log = {
        "timestamp": datetime.now().isoformat(),
        "borrower_id": random.randint(10000, 99999),
        "credit_score": int(payload.credit_score),
        "decision": decision,
        "probability": round(1.0 - risk_score, 2),
        "latency_ms": round(resp_latency, 2)
    }
    
    with db_lock:
        triton_metrics["throughput"] = round(throughput, 1)
        triton_metrics["p99_latency_ms"] = round(base_latency + queue_delay + 2.1, 2)
        triton_metrics["queue_latency_ms"] = round(queue_delay, 2)
        triton_metrics["gpu_utilization"] = round(gpu_load, 1)
        triton_metrics["dynamic_batch_size"] = min(64, max(1, concurrency))
        triton_metrics["payload_log"].insert(0, new_log)
        if len(triton_metrics["payload_log"]) > 10:
            triton_metrics["payload_log"].pop()
            
        # Collect new metrics for drift calculations
        global production_credit_scores, production_dtis
        production_credit_scores.append(int(payload.credit_score))
        production_dtis.append(payload.debt_to_income_ratio)
        if len(production_credit_scores) > 200:
            production_credit_scores.pop(0)
            production_dtis.pop(0)
            
    return {
        "decision": decision,
        "approval_probability": round(1.0 - risk_score, 4),
        "inference_latency_ms": round(resp_latency, 2),
        "dynamic_batching": {
            "batch_size": triton_metrics["dynamic_batch_size"],
            "queue_delay_ms": triton_metrics["queue_latency_ms"],
            "throughput_req_sec": triton_metrics["throughput"]
        }
    }

@app.get("/api/triton/metrics")
def get_triton_metrics():
    return triton_metrics

# --- DRIFT MONITORING ENDPOINTS ---
@app.get("/api/drift/metrics")
def get_drift_metrics():
    return {
        "drift_threshold": drift_data["drift_threshold"],
        "retrain_triggered": drift_data["retrain_triggered"],
        "is_drift_injected": drift_data["is_drift_injected"],
        "features": drift_data["features"],
        "drift_history": drift_data["drift_history"],
        "reference_data": {
            "credit_score": REFERENCE_CREDIT_SCORES,
            "debt_to_income_ratio": REFERENCE_DTIS
        },
        "production_data": {
            "credit_score": production_credit_scores,
            "debt_to_income_ratio": production_dtis
        }
    }

@app.post("/api/drift/inject")
def inject_drift_data(background_tasks: BackgroundTasks):
    global production_credit_scores, production_dtis, drift_data
    with db_lock:
        drift_data["is_drift_injected"] = True
        
        # Shift production distribution metrics
        # credit score falls (mean drops from 700 to 605)
        production_credit_scores = [int(random.normalvariate(605, 55)) for _ in range(200)]
        # debt to income ratio spikes (mean rises from 0.35 to 0.53)
        production_dtis = [round(random.normalvariate(0.53, 0.11), 3) for _ in range(200)]
        
        # Calculate new Wasserstein distances
        w_cs = calculate_wasserstein(REFERENCE_CREDIT_SCORES, production_credit_scores)
        w_dti = calculate_wasserstein(REFERENCE_DTIS, production_dtis)
        
        # Normalize/Scale Wasserstein metrics to fit expectations
        w_cs_norm = round(w_cs / 400.0, 3) # normalized
        w_dti_norm = round(w_dti, 3)
        
        # Drift score is the max Wasserstein shift
        drift_score = max(w_cs_norm, w_dti_norm)
        
        drift_data["features"]["credit_score"] = {
            "ref_mean": 700.0, "ref_std": 50.0,
            "prod_mean": 605.4, "prod_std": 54.8,
            "wasserstein": w_cs_norm
        }
        drift_data["features"]["debt_to_income_ratio"] = {
            "ref_mean": 0.35, "ref_std": 0.10,
            "prod_mean": 0.528, "prod_std": 0.112,
            "wasserstein": w_dti_norm
        }
        
        # Record history
        drift_data["drift_history"].append({
            "timestamp": datetime.now().isoformat(),
            "wasserstein_distance": drift_score,
            "alert": drift_score > drift_data["drift_threshold"]
        })
        
        # Trigger Retrain Loop automatically if above threshold
        if drift_score > drift_data["drift_threshold"] and not drift_data["retrain_triggered"]:
            drift_data["retrain_triggered"] = True
            background_tasks.add_task(run_simulated_pipeline)
            
    return {"status": "DRIFT_INJECTED", "drift_score": drift_score, "auto_retrain_triggered": True}

# Run execution block
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
