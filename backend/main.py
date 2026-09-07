import os
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pydantic import BaseModel, Field

from matching import WORKERS, calculate_worker_score


# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not configured.")

client = genai.Client(api_key=GEMINI_API_KEY)


# FastAPI application
app = FastAPI(
    title="Veyra API",
    description="AI-powered cooperative gig services platform",
    version="1.0.0",
)


# Allow the Next.js frontend to communicate with the API
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


# -------------------------
# Request / response models
# -------------------------

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


# -------------------------
# Demo booking storage
# -------------------------

BOOKINGS: list[dict] = []


# -------------------------
# Basic routes
# -------------------------

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


# -------------------------
# AI service understanding
# -------------------------

@app.post("/analyze", response_model=ServiceAnalysis)
def analyze_request(request: ServiceRequest):
    prompt = f"""
You are the service-understanding engine for Veyra, a cooperative
platform connecting households with local service workers.

Analyze the customer's request and return structured information.

Customer request:
"{request.description}"

Choose the most appropriate service category from:
- Electrical
- Plumbing
- Carpentry
- Cleaning
- Gardening
- General Repairs

Return:
- service: broad service category
- issue: concise description of the actual problem
- urgency: Low, Medium, or High
- required_skill: specific worker skill needed

Examples:

"My ceiling fan stopped working"
-> service: Electrical
-> required_skill: Ceiling fan repair

"Water is leaking under my kitchen sink"
-> service: Plumbing
-> required_skill: Plumbing

"Help me assemble a wooden study table"
-> service: Carpentry
-> required_skill: Furniture assembly

Keep the output concise and practical.
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

        return response.parsed

    except Exception:
        description = request.description.lower()

        if any(word in description for word in ["fan", "switch", "socket", "wire", "light", "electric"]):
            return ServiceAnalysis(
                service="Electrical",
                issue=request.description,
                urgency="Medium",
                required_skill="Electrical Repair",
            )

        if any(word in description for word in ["leak", "pipe", "tap", "sink", "water", "drain"]):
            return ServiceAnalysis(
                service="Plumbing",
                issue=request.description,
                urgency="Medium",
                required_skill="Plumbing",
            )

        if any(word in description for word in ["table", "chair", "door", "wood", "furniture"]):
            return ServiceAnalysis(
                service="Carpentry",
                issue=request.description,
                urgency="Medium",
                required_skill="Furniture Assembly",
            )

        if any(word in description for word in ["clean", "dust", "mop", "house"]):
            return ServiceAnalysis(
                service="Cleaning",
                issue=request.description,
                urgency="Low",
                required_skill="House Cleaning",
            )

        return ServiceAnalysis(
            service="General Repairs",
            issue=request.description,
            urgency="Medium",
            required_skill="General Repair",
        )

# -------------------------
# Worker skill normalization
# -------------------------

def get_worker_category(required_skill: str) -> str:
    """
    Maps specific customer requirements to the broader worker
    skill categories used by the matching system.
    """

    skill = required_skill.lower()

    skill_groups = {
        "electrical repair": (
            "fan",
            "electrical",
            "wiring",
            "switch",
            "socket",
            "light",
            "power",
        ),
        "plumbing": (
            "plumb",
            "water",
            "leak",
            "pipe",
            "tap",
            "sink",
            "drain",
        ),
        "carpentry": (
            "carp",
            "wood",
            "furniture",
            "table",
            "chair",
            "door",
        ),
        "cleaning": (
            "clean",
            "housekeeping",
            "sanitation",
        ),
        "gardening": (
            "garden",
            "gardening",
            "lawn",
            "plant",
        ),
    }

    for category, keywords in skill_groups.items():
        if any(keyword in skill for keyword in keywords):
            return category

    return "general repairs"


# -------------------------
# Fair worker matching
# -------------------------

@app.post("/match-workers")
def match_workers(request: ServiceAnalysis):
    target_skill = get_worker_category(request.required_skill)
    matched_workers = []

    for worker in WORKERS:
        skill_match = (
            1.0
            if worker["skill"].lower() == target_skill
            else 0.0
        )

        if not skill_match:
            continue

        distance_score = max(
            0.0,
            1.0 - (worker["distance_km"] / 10),
        )

        availability_score = (
            1.0 if worker["available"] else 0.0
        )

        rating_score = worker["rating"] / 5

        # Lower workload receives a higher fairness score.
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
                "match_score": match_score,
            }
        )

    matched_workers.sort(
        key=lambda worker: worker["match_score"],
        reverse=True,
    )

    return {
        "workers": matched_workers[:5],
    }


# -------------------------
# Booking
# -------------------------

@app.post("/bookings")
def create_booking(booking: BookingRequest):
    worker = next(
        (worker for worker in WORKERS if worker["id"] == booking.worker_id),
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