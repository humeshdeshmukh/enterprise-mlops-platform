# ==============================================================================
# Kubeflow Pipeline Step: Model training & MLflow Registration
# ==============================================================================

import argparse
import os
import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score, roc_auc_score, f1_score
import mlflow
import mlflow.sklearn

def train_model(data_dir, model_dir, learning_rate, n_estimators, max_depth):
    print("Loading preprocessed matrices...")
    X_train = pd.read_csv(os.path.join(data_dir, "X_train.csv"))
    X_test = pd.read_csv(os.path.join(data_dir, "X_test.csv"))
    y_train = pd.read_csv(os.path.join(data_dir, "y_train.csv")).values.ravel()
    y_test = pd.read_csv(os.path.join(data_dir, "y_test.csv")).values.ravel()

    # Start MLflow run
    mlflow.set_tracking_uri(os.getenv("MLFLOW_TRACKING_URI", "http://localhost:8000/api/mlflow"))
    mlflow.set_experiment("Credit-Risk-Scoring")

    with mlflow.start_run() as run:
        print(f"Fitting GradientBoostingClassifier(lr={learning_rate}, estimators={n_estimators}, depth={max_depth})...")
        model = GradientBoostingClassifier(
            learning_rate=learning_rate,
            n_estimators=n_estimators,
            max_depth=max_depth,
            random_state=42
        )
        model.fit(X_train, y_train)

        # Predict
        preds = model.predict(X_test)
        probs = model.predict_proba(X_test)[:, 1]

        # Metrics
        acc = accuracy_score(y_test, preds)
        auc = roc_auc_score(y_test, probs)
        f1 = f1_score(y_test, preds)

        print(f"Metrics: Accuracy={acc:.4f}, ROC-AUC={auc:.4f}, F1={f1:.4f}")

        # Log MLflow parameters
        mlflow.log_param("learning_rate", learning_rate)
        mlflow.log_param("n_estimators", n_estimators)
        mlflow.log_param("max_depth", max_depth)
        mlflow.log_param("model_type", "GradientBoostingClassifier")
        
        # Log MLflow metrics
        mlflow.log_metric("accuracy", acc)
        mlflow.log_metric("auc", auc)
        mlflow.log_metric("f1_score", f1)

        # Save model artifact
        os.makedirs(model_dir, exist_ok=True)
        mlflow.sklearn.log_model(
            sk_model=model,
            artifact_path="credit_risk_model",
            registered_model_name="CreditRiskScoringModel"
        )
        
        print(f"Model successfully registered in MLflow. Run ID: {run.info.run_id}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", type=str, required=True)
    parser.add_argument("--model-dir", type=str, required=True)
    parser.add_argument("--learning-rate", type=float, default=0.1)
    parser.add_argument("--n-estimators", type=int, default=100)
    parser.add_argument("--max-depth", type=int, default=3)
    args = parser.parse_args()

    train_model(
        data_dir=args.data_dir,
        model_dir=args.model_dir,
        learning_rate=args.learning_rate,
        n_estimators=args.n_estimators,
        max_depth=args.max_depth
    )
