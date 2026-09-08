import os
import re
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pydantic import BaseModel, Field

from matching import WORKERS, calculate_worker_score
from ml.local_analyzer import analyze_locally


# ============================================================
# Environment
# ============================================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not configured.")

client = genai.Client(api_key=GEMINI_API_KEY)


# ============================================================
# FastAPI application
# ============================================================

app = FastAPI(
    title="Veyra API",
    description="AI-powered cooperative gig services platform",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://cooperative-gig-platform-zeta.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Request / response models
# ============================================================

class ServiceRequest(BaseModel):
    description: str = Field(min_length=3, max_length=500)


class ServiceAnalysis(BaseModel):
    service: str
    issue: str
    urgency: str
    required_skill: str


class BookingRequest(BaseModel):
    worker_id: int
    service: str
    issue: str
    scheduled_at: datetime


# ============================================================
# Demo booking storage
# ============================================================

BOOKINGS: list[dict] = []


# ============================================================
# Basic routes
# ============================================================

@app.get("/")
def root():
    return {
        "name": "Veyra API",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }


# ============================================================
# Service category helpers
# ============================================================

SERVICE_KEYWORDS = {
    "Electrical": (
        "electric",
        "electrical",
        "electricity",
        "fan",
        "ceiling fan",
        "switch",
        "switchboard",
        "socket",
        "plug",
        "wire",
        "wiring",
        "light",
        "bulb",
        "power",
        "current",
        "short circuit",
        "sparking",
        "spark",
        "fuse",
        "mcb",
        "voltage",
        "bijli",
        "pankha",
        "switch board",
        "socket",
    ),
    "Plumbing": (
        "plumb",
        "plumbing",
        "water leak",
        "leak",
        "leaking",
        "pipe",
        "tap",
        "faucet",
        "sink",
        "drain",
        "toilet",
        "washbasin",
        "bathroom",
        "water tank",
        "water pressure",
        "blocked drain",
        "clogged",
        "paani",
        "nal",
        "nalka",
        "pipe leak",
    ),
    "Carpentry": (
        "carpentry",
        "carpenter",
        "carpenter work",
        "wood",
        "wooden",
        "furniture",
        "table",
        "chair",
        "door",
        "bed",
        "wardrobe",
        "cabinet",
        "shelf",
        "shelves",
        "woodwork",
        "assemble furniture",
        "assembly",
        "lakdi",
        "darwaza",
        "almirah",
    ),
    "Cleaning": (
        "clean",
        "cleaning",
        "cleaner",
        "dust",
        "dusting",
        "mop",
        "mopping",
        "sweep",
        "sweeping",
        "wash floor",
        "house cleaning",
        "deep cleaning",
        "bathroom cleaning",
        "kitchen cleaning",
        "sanitation",
        "dirty house",
        "safai",
        "saaf",
        "pocha",
        "jhaadu",
        "jhadu",
    ),
    "Gardening": (
        "garden",
        "gardening",
        "gardener",
        "plant",
        "plants",
        "planting",
        "watering plants",
        "water plants",
        "water the plants",
        "lawn",
        "grass",
        "tree",
        "trees",
        "flower",
        "flowers",
        "pot",
        "pots",
        "pruning",
        "trim plants",
        "trim the plants",
        "trim lawn",
        "lawn maintenance",
        "garden maintenance",
        "garden work",
        "weed",
        "weeds",
        "weeding",
        "manure",
        "fertilizer",
        "watering",
        "paudhe",
        "paudha",
        "bagicha",
        "gach",
    ),
    "General Repairs": (
        "repair",
        "repairs",
        "fix",
        "broken",
        "maintenance",
        "general repair",
        "minor repair",
        "ghar ka kaam",
    ),
}


# ============================================================
# Text normalization
# ============================================================

def normalize_text(text: str) -> str:
    """
    Normalizes customer text for reliable keyword matching.

    Keeps normal letters/numbers and converts punctuation
    into spaces.
    """
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text


def contains_keyword(text: str, keyword: str) -> bool:
    """
    Checks whether a keyword/phrase exists as a complete
    word or phrase instead of matching random substrings.
    """
    keyword = normalize_text(keyword)

    if not keyword:
        return False

    return re.search(
        rf"\b{re.escape(keyword)}\b",
        text,
    ) is not None


# ============================================================
# Deterministic service detection
# ============================================================

def detect_obvious_service(description: str) -> str | None:
    """
    Detects strong service signals directly from the customer's
    request.

    This acts as a safety/correctness layer around AI predictions.

    Example:
        "My plants need watering"
        -> Gardening

    Returns None when the request does not contain a strong
    enough signal.
    """

    text = normalize_text(description)

    # Gardening is checked before General Repairs because
    # gardening requests often contain words like "maintenance"
    # or "repair" while still clearly belonging to gardening.
    priority_order = [
        "Gardening",
        "Electrical",
        "Plumbing",
        "Carpentry",
        "Cleaning",
        "General Repairs",
    ]

    matches: dict[str, int] = {}

    for service in priority_order:
        score = 0

        for keyword in SERVICE_KEYWORDS[service]:
            if contains_keyword(text, keyword):
                # Longer phrases are stronger signals.
                score += 2 if " " in keyword else 1

        if score > 0:
            matches[service] = score

    if not matches:
        return None

    # Select the strongest category.
    best_service = max(
        matches,
        key=matches.get,
    )

    # If there is a tie between categories, prefer the
    # more specific service rather than General Repairs.
    top_score = matches[best_service]

    tied_services = [
        service
        for service, score in matches.items()
        if score == top_score
    ]

    if len(tied_services) == 1:
        return best_service

    for service in priority_order:
        if service in tied_services and service != "General Repairs":
            return service

    return best_service


# ============================================================
# Required skill mapping
# ============================================================

SERVICE_SKILLS = {
    "Electrical": "Electrical Repair",
    "Plumbing": "Plumbing",
    "Carpentry": "Furniture Assembly",
    "Cleaning": "House Cleaning",
    "Gardening": "Garden Maintenance",
    "General Repairs": "General Repair",
}


def get_required_skill(
    service: str,
    description: str,
) -> str:
    """
    Converts a broad service category into a useful worker skill.

    For the MVP, service-specific skills are deterministic so
    Gemini cannot accidentally return an incompatible skill.
    """

    text = normalize_text(description)

    if service == "Electrical":
        if contains_keyword(text, "fan") or contains_keyword(text, "pankha"):
            return "Ceiling Fan Repair"

        if (
            contains_keyword(text, "switch")
            or contains_keyword(text, "switchboard")
            or contains_keyword(text, "switch board")
        ):
            return "Switch and Electrical Repair"

        if (
            contains_keyword(text, "wire")
            or contains_keyword(text, "wiring")
            or contains_keyword(text, "spark")
            or contains_keyword(text, "sparking")
        ):
            return "Electrical Wiring Repair"

        return "Electrical Repair"

    if service == "Plumbing":
        if (
            contains_keyword(text, "leak")
            or contains_keyword(text, "leaking")
            or contains_keyword(text, "pipe")
        ):
            return "Pipe and Leak Repair"

        if (
            contains_keyword(text, "tap")
            or contains_keyword(text, "faucet")
            or contains_keyword(text, "nal")
            or contains_keyword(text, "nalka")
        ):
            return "Tap Repair"

        if (
            contains_keyword(text, "drain")
            or contains_keyword(text, "clogged")
        ):
            return "Drain Repair"

        return "Plumbing"

    if service == "Carpentry":
        if (
            contains_keyword(text, "table")
            or contains_keyword(text, "chair")
            or contains_keyword(text, "furniture")
            or contains_keyword(text, "assembly")
            or contains_keyword(text, "assemble")
        ):
            return "Furniture Assembly"

        if (
            contains_keyword(text, "door")
            or contains_keyword(text, "darwaza")
        ):
            return "Door and Wood Repair"

        return "Carpentry"

    if service == "Cleaning":
        if (
            contains_keyword(text, "bathroom")
            or contains_keyword(text, "toilet")
        ):
            return "Bathroom Cleaning"

        if (
            contains_keyword(text, "kitchen")
            and contains_keyword(text, "clean")
        ):
            return "Kitchen Cleaning"

        if contains_keyword(text, "deep cleaning"):
            return "Deep Cleaning"

        return "House Cleaning"

    if service == "Gardening":
        if (
            contains_keyword(text, "lawn")
            or contains_keyword(text, "grass")
            or contains_keyword(text, "weeding")
            or contains_keyword(text, "weed")
        ):
            return "Lawn and Garden Maintenance"

        if (
            contains_keyword(text, "plant")
            or contains_keyword(text, "plants")
            or contains_keyword(text, "paudha")
            or contains_keyword(text, "paudhe")
            or contains_keyword(text, "watering")
            or contains_keyword(text, "water plants")
        ):
            return "Plant Care"

        if (
            contains_keyword(text, "pruning")
            or contains_keyword(text, "trim")
            or contains_keyword(text, "tree")
        ):
            return "Plant and Tree Maintenance"

        return "Garden Maintenance"

    return "General Repair"


# ============================================================
# Urgency detection
# ============================================================

def detect_urgency(description: str) -> str:
    """
    Provides a conservative urgency classification.

    High urgency is used only for clear immediate-risk
    situations.
    """

    text = normalize_text(description)

    high_keywords = (
        "fire",
        "smoke",
        "sparking",
        "spark",
        "short circuit",
        "gas leak",
        "flooding",
        "major leak",
        "burst pipe",
        "danger",
        "dangerous",
        "emergency",
        "urgent",
        "immediately",
        "electric shock",
        "shock",
        "aag",
        "dhua",
        "bahut bada leak",
    )

    low_keywords = (
        "routine",
        "regular",
        "maintenance",
        "watering plants",
        "water plants",
        "gardening",
        "cleaning",
        "dusting",
        "mopping",
        "lawn maintenance",
        "plant care",
    )

    if any(contains_keyword(text, word) for word in high_keywords):
        return "High"

    if any(contains_keyword(text, word) for word in low_keywords):
        return "Low"

    return "Medium"


# ============================================================
# Final analysis validation
# ============================================================

def validate_and_correct_analysis(
    description: str,
    analysis: ServiceAnalysis,
) -> ServiceAnalysis:
    """
    Validates an AI-generated analysis against the customer's
    actual text.

    The AI is useful for understanding language, but obvious
    service signals from the customer's request take priority.

    This prevents mismatches such as:

        "My plants need watering"
        AI -> Plumbing
        Corrected -> Gardening
    """

    obvious_service = detect_obvious_service(description)

    if obvious_service is None:
        return analysis

    correct_skill = get_required_skill(
        obvious_service,
        description,
    )

    # Always use the deterministic urgency when we have an
    # obvious service signal. This keeps the result consistent.
    urgency = detect_urgency(description)

    return ServiceAnalysis(
        service=obvious_service,
        issue=description.strip(),
        urgency=urgency,
        required_skill=correct_skill,
    )


# ============================================================
# AI service understanding
# ============================================================

@app.post("/analyze", response_model=ServiceAnalysis)
def analyze_request(request: ServiceRequest):
    description = request.description.strip()

    prompt = f"""
You are the service-understanding engine for Veyra, a cooperative
platform connecting households with local service workers.

Analyze the customer's request carefully.

Customer request:
"{description}"

Choose exactly one service category from:

- Electrical
- Plumbing
- Carpentry
- Cleaning
- Gardening
- General Repairs

Important rules:

1. Use the customer's actual words and meaning.
2. If the request mentions plants, gardening, lawn, grass,
   watering plants, trees, flowers, pruning, or garden work,
   choose Gardening.
3. If the request mentions water leaks, pipes, taps, sinks,
   drains, or plumbing, choose Plumbing.
4. If the request mentions fans, switches, sockets, wiring,
   lights, electricity, or electrical problems, choose Electrical.
5. If the request mentions wood, furniture, tables, chairs,
   doors, beds, cabinets, or carpentry, choose Carpentry.
6. If the request is about cleaning, dust, mopping, sweeping,
   or house cleaning, choose Cleaning.
7. Use General Repairs only when the request does not clearly
   belong to one of the specific categories.

Return:

- service: broad service category
- issue: concise description of the customer's actual problem
- urgency: Low, Medium, or High
- required_skill: specific worker skill needed

Examples:

"My ceiling fan stopped working"
-> Electrical
-> Ceiling Fan Repair

"Water is leaking under my kitchen sink"
-> Plumbing
-> Pipe and Leak Repair

"Help me assemble a wooden study table"
-> Carpentry
-> Furniture Assembly

"My plants need watering"
-> Gardening
-> Plant Care

"My lawn needs trimming"
-> Gardening
-> Lawn and Garden Maintenance

"Please clean my house"
-> Cleaning
-> House Cleaning

Return only the structured response.
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": ServiceAnalysis,
            },
        )

        if response.parsed is not None:
            analysis = ServiceAnalysis(**response.parsed)

            # Never blindly trust the model's category.
            return validate_and_correct_analysis(
                description,
                analysis,
            )

    except Exception:
        pass

    # ========================================================
    # Local ML fallback
    # ========================================================

    try:
        local_result = analyze_locally(description)

        if local_result is not None:
            analysis = ServiceAnalysis(**local_result)

            return validate_and_correct_analysis(
                description,
                analysis,
            )

    except Exception:
        pass

    # ========================================================
    # Deterministic fallback
    # ========================================================

    detected_service = detect_obvious_service(description)

    if detected_service is not None:
        return ServiceAnalysis(
            service=detected_service,
            issue=description,
            urgency=detect_urgency(description),
            required_skill=get_required_skill(
                detected_service,
                description,
            ),
        )

    # Final safe fallback.
    return ServiceAnalysis(
        service="General Repairs",
        issue=description,
        urgency="Medium",
        required_skill="General Repair",
    )


# ============================================================
# Worker skill normalization
# ============================================================

def get_worker_category(required_skill: str) -> str:
    """
    Maps a specific worker skill to the broader worker category
    used by the matching system.
    """

    skill = normalize_text(required_skill)

    skill_groups = {
        "electrical repair": (
            "electric",
            "electrical",
            "fan",
            "wiring",
            "wire",
            "switch",
            "socket",
            "light",
            "power",
            "spark",
            "voltage",
            "mcb",
            "fuse",
        ),
        "plumbing": (
            "plumb",
            "water",
            "leak",
            "pipe",
            "tap",
            "faucet",
            "sink",
            "drain",
            "toilet",
        ),
        "carpentry": (
            "carp",
            "wood",
            "furniture",
            "table",
            "chair",
            "door",
            "bed",
            "cabinet",
            "shelf",
            "assembly",
        ),
        "cleaning": (
            "clean",
            "housekeeping",
            "sanitation",
            "dust",
            "mop",
            "sweep",
        ),
        "gardening": (
            "garden",
            "gardening",
            "plant",
            "lawn",
            "grass",
            "tree",
            "flower",
            "pruning",
            "weeding",
            "garden maintenance",
            "plant care",
        ),
    }

    for category, keywords in skill_groups.items():
        if any(
            contains_keyword(skill, keyword)
            for keyword in keywords
        ):
            return category

    return "general repairs"


# ============================================================
# Fair worker matching
# ============================================================

@app.post("/match-workers")
def match_workers(request: ServiceAnalysis):
    target_skill = get_worker_category(
        request.required_skill
    )

    matched_workers = []

    for worker in WORKERS:
        worker_skill = normalize_text(worker["skill"])

        skill_match = (
            1.0
            if worker_skill == target_skill
            else 0.0
        )

        if not skill_match:
            continue

        distance_score = max(
            0.0,
            1.0 - (worker["distance_km"] / 10),
        )

        availability_score = (
            1.0
            if worker["available"]
            else 0.0
        )

        rating_score = worker["rating"] / 5

        # Lower workload = higher fairness score.
        fairness_score = max(
            0.0,
            1.0 - (worker["workload"] / 10),
        )

        match_score = calculate_worker_score(
            skill_match=skill_match,
            distance_score=distance_score,
            availability_score=availability_score,
            rating_score=rating_score,
            fairness_score=fairness_score,
        )

        matched_workers.append(
            {
                "id": worker["id"],
                "name": worker["name"],
                "skill": worker["skill"],
                "rating": worker["rating"],
                "distance_km": worker["distance_km"],
                "available": worker["available"],
                "workload": worker["workload"],
                "experience_years": worker["experience_years"],
                "verified": worker["verified"],
                "match_score": round(
                    match_score,
                    2,
                ),
            }
        )

    matched_workers.sort(
        key=lambda worker: worker["match_score"],
        reverse=True,
    )

    return {
        "workers": matched_workers[:5],
    }


# ============================================================
# Booking
# ============================================================

@app.post("/bookings")
def create_booking(booking: BookingRequest):
    worker = next(
        (
            worker
            for worker in WORKERS
            if worker["id"] == booking.worker_id
        ),
        None,
    )

    if worker is None:
        raise HTTPException(
            status_code=404,
            detail="Worker not found.",
        )

    if not worker["available"]:
        raise HTTPException(
            status_code=400,
            detail="This worker is currently unavailable.",
        )

    new_booking = {
        "id": len(BOOKINGS) + 1,
        "worker_id": worker["id"],
        "worker_name": worker["name"],
        "service": booking.service,
        "issue": booking.issue,
        "scheduled_at": booking.scheduled_at.isoformat(),
        "status": "confirmed",
    }

    BOOKINGS.append(new_booking)

    return {
        "message": "Booking confirmed.",
        "booking": new_booking,
    }


@app.get("/bookings")
def get_bookings():
    return {
        "bookings": BOOKINGS,
    }