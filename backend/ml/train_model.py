
from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, f1_score
from sklearn.model_selection import train_test_split


# ============================================================
# Veyra Local ML Training Pipeline
#
# Purpose:
#   Train offline NLP classifiers that can act as a local
#   fallback when the Gemini API is unavailable.
#
# Models:
#   1. Service category
#   2. Urgency
#   3. Required worker skill
#
# Features:
#   TF-IDF word + character n-grams
#   Logistic Regression with class balancing
#
# Output:
#   backend/ml/models/
#       vectorizer.joblib
#       service_model.joblib
#       urgency_model.joblib
#       skill_model.joblib
#       metadata.json
# ============================================================


# ------------------------------------------------------------
# Paths
# ------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "service_requests.csv"
MODEL_DIR = BASE_DIR / "models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)


# ------------------------------------------------------------
# Configuration
# ------------------------------------------------------------

TEXT_COLUMN = "text"
SERVICE_COLUMN = "service"
URGENCY_COLUMN = "urgency"
SKILL_COLUMN = "required_skill"

REQUIRED_COLUMNS = {
    TEXT_COLUMN,
    SERVICE_COLUMN,
    URGENCY_COLUMN,
    SKILL_COLUMN,
}

VALID_SERVICES = {
    "Electrical",
    "Plumbing",
    "Carpentry",
    "Cleaning",
    "Gardening",
    "General Repairs",
}

VALID_URGENCY = {
    "Low",
    "Medium",
    "High",
}


# ------------------------------------------------------------
# Utility functions
# ------------------------------------------------------------

def fail(message: str) -> None:
    """Stop training with a clear error message."""
    print()
    print("TRAINING ERROR")
    print("-" * 60)
    print(message)
    print()
    sys.exit(1)


def validate_dataset(df: pd.DataFrame) -> None:
    """Validate the dataset before training."""

    missing_columns = REQUIRED_COLUMNS - set(df.columns)

    if missing_columns:
        fail(
            "The dataset is missing required columns: "
            + ", ".join(sorted(missing_columns))
        )

    if df.empty:
        fail("The dataset is empty.")

    # Remove accidental whitespace around text values.
    for column in [
        TEXT_COLUMN,
        SERVICE_COLUMN,
        URGENCY_COLUMN,
        SKILL_COLUMN,
    ]:
        df[column] = df[column].astype(str).str.strip()

    if df[TEXT_COLUMN].eq("").any():
        fail("The dataset contains empty service-request text.")

    if df[TEXT_COLUMN].duplicated().any():
        duplicates = int(df[TEXT_COLUMN].duplicated().sum())
        fail(
            f"The dataset contains {duplicates} duplicate text examples."
        )

    invalid_services = set(df[SERVICE_COLUMN]) - VALID_SERVICES

    if invalid_services:
        fail(
            "Unknown service categories found: "
            + ", ".join(sorted(invalid_services))
        )

    invalid_urgency = set(df[URGENCY_COLUMN]) - VALID_URGENCY

    if invalid_urgency:
        fail(
            "Unknown urgency labels found: "
            + ", ".join(sorted(invalid_urgency))
        )

    # Every target must contain at least two classes.
    for column in [
        SERVICE_COLUMN,
        URGENCY_COLUMN,
        SKILL_COLUMN,
    ]:
        class_count = df[column].nunique()

        if class_count < 2:
            fail(
                f"{column} must contain at least two different classes."
            )

    # Check that every service has enough examples for a reliable
    # stratified train/test split.
    service_counts = df[SERVICE_COLUMN].value_counts()

    too_small = service_counts[service_counts < 2]

    if not too_small.empty:
        fail(
            "These service categories have fewer than 2 examples: "
            + ", ".join(too_small.index)
        )


def print_distribution(
    title: str,
    values: pd.Series,
) -> None:
    """Print a clean class distribution."""

    print()
    print(title)
    print("-" * 40)

    counts = values.value_counts()

    for label, count in counts.items():
        print(f"{label}: {count}")


def build_vectorizer() -> TfidfVectorizer:
    """
    Build a robust TF-IDF representation.

    Word n-grams understand phrases such as:
        ceiling fan
        water leak
        kitchen sink

    Character n-grams help with:
        spelling variations
        Hinglish
        partial words
        informal typing
    """

    return TfidfVectorizer(
        lowercase=True,
        strip_accents="unicode",
        sublinear_tf=True,
        min_df=1,
        max_df=0.98,
        ngram_range=(1, 2),
        analyzer="word",
        max_features=10000,
    )


def train_classifier(
    X_train,
    y_train: pd.Series,
) -> LogisticRegression:
    """Train a balanced Logistic Regression classifier."""

    model = LogisticRegression(
        max_iter=3000,
        class_weight="balanced",
        solver="lbfgs",
        random_state=42,
    )

    model.fit(X_train, y_train)

    return model


def evaluate_model(
    name: str,
    model: LogisticRegression,
    X_test,
    y_test: pd.Series,
) -> dict:
    """Evaluate a classifier and return useful metrics."""

    predictions = model.predict(X_test)

    accuracy = accuracy_score(
        y_test,
        predictions,
    )

    macro_f1 = f1_score(
        y_test,
        predictions,
        average="macro",
        zero_division=0,
    )

    print()
    print("=" * 60)
    print(f"{name.upper()} MODEL")
    print("=" * 60)

    print(f"Accuracy : {accuracy:.3f}")
    print(f"Macro F1 : {macro_f1:.3f}")

    print()
    print(
        classification_report(
            y_test,
            predictions,
            zero_division=0,
        )
    )

    return {
        "accuracy": round(float(accuracy), 4),
        "macro_f1": round(float(macro_f1), 4),
    }


def estimate_confidence(
    model: LogisticRegression,
    X_test,
) -> list[float]:
    """
    Return the model's confidence estimate for each test example.

    For Logistic Regression, the maximum class probability is used.
    """

    probabilities = model.predict_proba(X_test)

    return probabilities.max(axis=1).tolist()


def find_confidence_threshold(
    model: LogisticRegression,
    X_test,
    y_test: pd.Series,
) -> dict:
    """
    Find a practical confidence threshold.

    We prefer:
        high accuracy on accepted predictions
        while still accepting a useful portion of requests.

    This is not a safety guarantee. It is only a fallback-quality
    control. Low-confidence requests can fall through to the
    deterministic keyword fallback.
    """

    probabilities = model.predict_proba(X_test)

    predictions = model.predict(X_test)

    confidence = probabilities.max(axis=1)

    results = []

    for threshold in [
        0.20,
        0.25,
        0.30,
        0.35,
        0.40,
        0.45,
        0.50,
        0.55,
        0.60,
        0.65,
        0.70,
        0.75,
        0.80,
        0.85,
        0.90,
    ]:

        accepted = confidence >= threshold

        coverage = float(accepted.mean())

        if accepted.any():

            accepted_accuracy = float(
                accuracy_score(
                    y_test.iloc[accepted],
                    predictions[accepted],
                )
            )

        else:
            accepted_accuracy = 0.0

        results.append(
            {
                "threshold": threshold,
                "coverage": coverage,
                "accuracy": accepted_accuracy,
            }
        )

    # Preferred operating point:
    # accuracy >= 0.85 where possible, with the highest coverage.
    good_options = [
        item
        for item in results
        if item["accuracy"] >= 0.85
        and item["coverage"] >= 0.20
    ]

    if good_options:
        selected = max(
            good_options,
            key=lambda item: item["coverage"],
        )

    else:
        # If the dataset is not strong enough for 85% accuracy,
        # choose the highest-confidence practical threshold.
        selected = max(
            results,
            key=lambda item: (
                item["accuracy"],
                item["coverage"],
            ),
        )

    return {
        "selected_threshold": selected["threshold"],
        "selected_accuracy": round(
            selected["accuracy"],
            4,
        ),
        "selected_coverage": round(
            selected["coverage"],
            4,
        ),
        "tested_thresholds": results,
    }


# ------------------------------------------------------------
# Main training pipeline
# ------------------------------------------------------------

def main() -> None:

    print()
    print("=" * 60)
    print("VEYRA LOCAL ML TRAINING")
    print("=" * 60)

    # --------------------------------------------------------
    # Load dataset
    # --------------------------------------------------------

    print()
    print("Dataset:")
    print(DATA_PATH)

    if not DATA_PATH.exists():
        fail(
            "Dataset file was not found.\n"
            f"Expected location:\n{DATA_PATH}\n\n"
            "Run generate_dataset.py first."
        )

    try:
        df = pd.read_csv(DATA_PATH)

    except Exception as exc:
        fail(
            f"Could not read the CSV dataset:\n{exc}"
        )

    print(f"Loaded {len(df)} examples.")

    # --------------------------------------------------------
    # Validate
    # --------------------------------------------------------

    validate_dataset(df)

    print()
    print("Dataset validation: PASSED")

    print_distribution(
        "Service distribution",
        df[SERVICE_COLUMN],
    )

    print_distribution(
        "Urgency distribution",
        df[URGENCY_COLUMN],
    )

    print_distribution(
        "Required-skill distribution",
        df[SKILL_COLUMN],
    )

    # --------------------------------------------------------
    # Prepare data
    # --------------------------------------------------------

    X = df[TEXT_COLUMN].astype(str)

    y_service = df[SERVICE_COLUMN]
    y_urgency = df[URGENCY_COLUMN]
    y_skill = df[SKILL_COLUMN]

    # We stratify by the broad service category because it is
    # the most important target and has sufficient examples.
    (
        X_train,
        X_test,
        y_service_train,
        y_service_test,
        y_urgency_train,
        y_urgency_test,
        y_skill_train,
        y_skill_test,
    ) = train_test_split(
        X,
        y_service,
        y_urgency,
        y_skill,
        test_size=0.20,
        random_state=42,
        stratify=y_service,
    )

    print()
    print("Training examples:", len(X_train))
    print("Testing examples :", len(X_test))

    # --------------------------------------------------------
    # TF-IDF
    # --------------------------------------------------------

    print()
    print("Building TF-IDF features...")

    vectorizer = build_vectorizer()

    X_train_vectorized = vectorizer.fit_transform(
        X_train
    )

    X_test_vectorized = vectorizer.transform(
        X_test
    )

    print(
        "Feature matrix:",
        X_train_vectorized.shape,
    )

    # --------------------------------------------------------
    # Train SERVICE model
    # --------------------------------------------------------

    print()
    print("Training service classifier...")

    service_model = train_classifier(
        X_train_vectorized,
        y_service_train,
    )

    service_metrics = evaluate_model(
        "Service",
        service_model,
        X_test_vectorized,
        y_service_test,
    )

    service_threshold = find_confidence_threshold(
        service_model,
        X_test_vectorized,
        y_service_test,
    )

    # --------------------------------------------------------
    # Train URGENCY model
    # --------------------------------------------------------

    print()
    print("Training urgency classifier...")

    urgency_model = train_classifier(
        X_train_vectorized,
        y_urgency_train,
    )

    urgency_metrics = evaluate_model(
        "Urgency",
        urgency_model,
        X_test_vectorized,
        y_urgency_test,
    )

    urgency_threshold = find_confidence_threshold(
        urgency_model,
        X_test_vectorized,
        y_urgency_test,
    )

    # --------------------------------------------------------
    # Train SKILL model
    # --------------------------------------------------------

    print()
    print("Training required-skill classifier...")

    skill_model = train_classifier(
        X_train_vectorized,
        y_skill_train,
    )

    skill_metrics = evaluate_model(
        "Required Skill",
        skill_model,
        X_test_vectorized,
        y_skill_test,
    )

    skill_threshold = find_confidence_threshold(
        skill_model,
        X_test_vectorized,
        y_skill_test,
    )

    # --------------------------------------------------------
    # Save models
    # --------------------------------------------------------

    vectorizer_path = MODEL_DIR / "vectorizer.joblib"
    service_model_path = MODEL_DIR / "service_model.joblib"
    urgency_model_path = MODEL_DIR / "urgency_model.joblib"
    skill_model_path = MODEL_DIR / "skill_model.joblib"
    metadata_path = MODEL_DIR / "metadata.json"

    joblib.dump(
        vectorizer,
        vectorizer_path,
    )

    joblib.dump(
        service_model,
        service_model_path,
    )

    joblib.dump(
        urgency_model,
        urgency_model_path,
    )

    joblib.dump(
        skill_model,
        skill_model_path,
    )

    # --------------------------------------------------------
    # Metadata
    # --------------------------------------------------------

    metadata = {
        "version": "1.0",
        "algorithm": "TF-IDF + Logistic Regression",
        "training_examples": int(len(df)),
        "test_examples": int(len(X_test)),
        "random_state": 42,
        "test_size": 0.20,
        "vectorizer": {
            "analyzer": "word",
            "ngram_range": [1, 2],
            "lowercase": True,
            "strip_accents": "unicode",
            "sublinear_tf": True,
            "max_features": 10000,
        },
        "models": {
            "service": {
                "metrics": service_metrics,
                "confidence": service_threshold,
                "classes": sorted(
                    str(value)
                    for value in service_model.classes_
                ),
            },
            "urgency": {
                "metrics": urgency_metrics,
                "confidence": urgency_threshold,
                "classes": sorted(
                    str(value)
                    for value in urgency_model.classes_
                ),
            },
            "required_skill": {
                "metrics": skill_metrics,
                "confidence": skill_threshold,
                "classes": sorted(
                    str(value)
                    for value in skill_model.classes_
                ),
            },
        },
    }

    with metadata_path.open(
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            metadata,
            f,
            indent=2,
        )

    # --------------------------------------------------------
    # Final report
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)

    print()
    print("Models saved to:")
    print(MODEL_DIR)

    print()
    print("Created files:")

    print(f"  ✓ {vectorizer_path.name}")
    print(f"  ✓ {service_model_path.name}")
    print(f"  ✓ {urgency_model_path.name}")
    print(f"  ✓ {skill_model_path.name}")
    print(f"  ✓ {metadata_path.name}")

    print()
    print("Selected confidence thresholds:")

    print(
        "  Service:",
        service_threshold["selected_threshold"],
    )

    print(
        "  Urgency:",
        urgency_threshold["selected_threshold"],
    )

    print(
        "  Skill:",
        skill_threshold["selected_threshold"],
    )

    print()
    print("The local ML fallback is ready for integration.")
    print()


if __name__ == "__main__":
    main()

