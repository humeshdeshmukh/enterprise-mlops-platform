# ==============================================================================
# Kubeflow Pipeline Step: Data Ingestion & Preprocessing
# ==============================================================================

import argparse
import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

def preprocess_features(data_path, output_dir):
    print(f"Reading raw data from {data_path}...")
    df = pd.read_parquet(data_path) if data_path.endswith('.parquet') else pd.read_csv(data_path)
    
    # Simple cleaning
    df = df.dropna()
    
    # Feature columns
    feature_cols = ['credit_score', 'debt_to_income_ratio', 'annual_income', 'active_loans_count', 'repayment_history_score']
    target_col = 'risk_label' # 1: Default risk, 0: Healthy borrower
    
    X = df[feature_cols]
    y = df[target_col]
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Save back
    os.makedirs(output_dir, exist_ok=True)
    pd.DataFrame(X_train_scaled, columns=feature_cols).to_csv(os.path.join(output_dir, "X_train.csv"), index=False)
    pd.DataFrame(X_test_scaled, columns=feature_cols).to_csv(os.path.join(output_dir, "X_test.csv"), index=False)
    y_train.to_csv(os.path.join(output_dir, "y_train.csv"), index=False)
    y_test.to_csv(os.path.join(output_dir, "y_test.csv"), index=False)
    
    print(f"Preprocessing completed. Datasets saved to: {output_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-path", type=str, required=True, help="Path to input data")
    parser.add_argument("--output-dir", type=str, required=True, help="Directory to save preprocessed matrices")
    args = parser.parse_args()
    
    preprocess_features(args.data_path, args.output_dir)
