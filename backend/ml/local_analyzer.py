from __future__ import annotations

import json
from pathlib import Path

import joblib

from matching import get_worker_category


BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"


def _load_models():
    vectorizer = joblib.load(MODEL_DIR / "vectorizer.joblib")
    service_model = joblib.load(MODEL_DIR / "service_model.joblib")
    urgency_model = joblib.load(MODEL_DIR / "urgency_model.joblib")
    skill_model = joblib.load(MODEL_DIR / "skill_model.joblib")

    metadata_path = MODEL_DIR / "metadata.json"

    with metadata_path.open("r", encoding="utf-8") as file:
        metadata = json.load(file)

    return (
        vectorizer,
        service_model,
        urgency_model,
        skill_model,
        metadata,
    )


_vectorizer, _service_model, _urgency_model, _skill_model, _metadata = _load_models()


def _get_threshold(target: str) -> float:
    thresholds = _metadata.get("thresholds", {})

    # Use the threshold selected during training.
    # Fall back to 0.30 if metadata is missing it.
    return float(thresholds.get(target, 0.30))


def analyze_locally(description: str) -> dict | None:
    """
    Analyze a household service request using the local ML models.

    Returns:
        A dictionary compatible with the ServiceAnalysis response model,
        or None when model confidence is too low.
    """

    if not description or not description.strip():
        return None

    text = description.strip()

    try:
        features = _vectorizer.transform([text])

        service_probabilities = _service_model.predict_proba(features)[0]
        urgency_probabilities = _urgency_model.predict_proba(features)[0]
        skill_probabilities = _skill_model.predict_proba(features)[0]

        service_index = service_probabilities.argmax()
        urgency_index = urgency_probabilities.argmax()
        skill_index = skill_probabilities.argmax()

        service = _service_model.classes_[service_index]
        urgency = _urgency_model.classes_[urgency_index]
        required_skill = _skill_model.classes_[skill_index]

        service_confidence = float(service_probabilities[service_index])
        urgency_confidence = float(urgency_probabilities[urgency_index])
        skill_confidence = float(skill_probabilities[skill_index])

        # Confidence gating:
        # If any important prediction is too uncertain, let the
        # deterministic keyword fallback handle the request.
        if service_confidence < _get_threshold("service"):
            return None

        if urgency_confidence < _get_threshold("urgency"):
            return None

        if skill_confidence < _get_threshold("required_skill"):
            return None

        # Make sure the predicted skill belongs to the predicted service.
        # This protects the worker-matching system from incompatible
        # service/skill combinations.
        worker_category = get_worker_category(required_skill)

        if worker_category != service:
            return None

        return {
            "service": str(service),
            "issue": text,
            "urgency": str(urgency),
            "required_skill": str(required_skill),
        }

    except Exception:
        # Never let a local ML model failure break the API.
        # main.py will continue to its next fallback layer.
        return None