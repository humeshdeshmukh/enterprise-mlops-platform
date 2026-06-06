# ==============================================================================
# Feast Feature Definitions for Credit Risk Scoring
# ==============================================================================

from datetime import timedelta
from feast import (
    Entity,
    FeatureView,
    Field,
    FileSource,
)
from feast.types import Float32, Int64

# Define the primary borrower entity
borrower = Entity(
    name="borrower_id",
    description="Unique identifier of the loan applicant",
)

# Offline File Source (Parquet on S3 / local filesystem backup)
credit_history_source = FileSource(
    path="data/borrower_credit_features.parquet",
    timestamp_field="event_timestamp",
    created_timestamp_column="created_timestamp",
)

# Feature View grouping financial behavior parameters
credit_risk_features_view = FeatureView(
    name="borrower_credit_features",
    entities=[borrower],
    ttl=timedelta(days=90),
    schema=[
        Field(name="credit_score", dtype=Int64),
        Field(name="debt_to_income_ratio", dtype=Float32),
        Field(name="annual_income", dtype=Float32),
        Field(name="active_loans_count", dtype=Int64),
        Field(name="repayment_history_score", dtype=Float32),
    ],
    online=True,
    source=credit_history_source,
    tags={"team": "credit_risk_science"},
)
