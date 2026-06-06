# ==============================================================================
# Kubeflow Pipeline Definition - Credit Risk End-to-End Orchestrator
# ==============================================================================

from kfp import dsl
from kfp import compiler

@dsl.component(
    base_image="python:3.10",
    packages_to_install=["pandas", "scikit-learn", "pyarrow", "fastparquet"]
)
def preprocess_op(data_path: str, output_dir: str):
    # Embedded execution helper to match compiled SDK outputs
    import sys
    sys.path.append("/app/pipelines")
    from preprocess import preprocess_features
    preprocess_features(data_path, output_dir)

@dsl.component(
    base_image="python:3.10",
    packages_to_install=["pandas", "scikit-learn", "mlflow", "numpy"]
)
def train_op(
    data_dir: str,
    model_dir: str,
    learning_rate: float,
    n_estimators: int,
    max_depth: int
):
    import sys
    sys.path.append("/app/pipelines")
    from train import train_model
    train_model(data_dir, model_dir, learning_rate, n_estimators, max_depth)

@dsl.pipeline(
    name="Credit Risk Assessment training Loop",
    description="Fetches features from store, processes data, trains and registers model."
)
def credit_risk_pipeline(
    data_path: str = "data/borrower_credit_features.parquet",
    output_dir: str = "/tmp/preprocessed",
    model_dir: str = "/tmp/model_output",
    learning_rate: float = 0.05,
    n_estimators: int = 150,
    max_depth: int = 4
):
    preprocess_step = preprocess_op(data_path=data_path, output_dir=output_dir)
    train_step = train_op(
        data_dir=output_dir,
        model_dir=model_dir,
        learning_rate=learning_rate,
        n_estimators=n_estimators,
        max_depth=max_depth
    )
    train_step.after(preprocess_step)

if __name__ == "__main__":
    # Compile pipeline definition into YAML bundle
    compiler.Compiler().compile(
        pipeline_func=credit_risk_pipeline,
        package_path="credit_risk_pipeline.yaml"
    )
    print("Pipeline compilation successful. Compiled package saved to: credit_risk_pipeline.yaml")
