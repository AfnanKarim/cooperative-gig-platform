# backend/matching.py

WORKERS = [
    # ============================================================
    # ELECTRICAL — 7 WORKERS
    # ============================================================
    {
        "id": 1,
        "name": "Rahul",
        "skill": "Electrical Repair",
        "rating": 4.8,
        "distance_km": 1.2,
        "available": True,
        "workload": 2,
        "experience_years": 6,
        "verified": True,
    },
    {
        "id": 2,
        "name": "Neha",
        "skill": "Electrical Repair",
        "rating": 4.9,
        "distance_km": 1.8,
        "available": True,
        "workload": 3,
        "experience_years": 7,
        "verified": True,
    },
    {
        "id": 3,
        "name": "Aman",
        "skill": "Electrical Repair",
        "rating": 4.5,
        "distance_km": 2.5,
        "available": True,
        "workload": 5,
        "experience_years": 4,
        "verified": True,
    },
    {
        "id": 4,
        "name": "Vikram",
        "skill": "Electrical Repair",
        "rating": 4.7,
        "distance_km": 3.1,
        "available": True,
        "workload": 1,
        "experience_years": 5,
        "verified": True,
    },
    {
        "id": 5,
        "name": "Sana",
        "skill": "Electrical Repair",
        "rating": 4.6,
        "distance_km": 3.8,
        "available": True,
        "workload": 4,
        "experience_years": 5,
        "verified": True,
    },
    {
        "id": 6,
        "name": "Arjun",
        "skill": "Electrical Repair",
        "rating": 4.4,
        "distance_km": 4.5,
        "available": False,
        "workload": 6,
        "experience_years": 3,
        "verified": True,
    },
    {
        "id": 7,
        "name": "Meera",
        "skill": "Electrical Repair",
        "rating": 4.7,
        "distance_km": 5.2,
        "available": True,
        "workload": 2,
        "experience_years": 6,
        "verified": True,
    },

    # ============================================================
    # PLUMBING — 7 WORKERS
    # ============================================================
    {
        "id": 8,
        "name": "Rakesh",
        "skill": "Plumbing",
        "rating": 4.8,
        "distance_km": 1.1,
        "available": True,
        "workload": 3,
        "experience_years": 8,
        "verified": True,
    },
    {
        "id": 9,
        "name": "Pooja",
        "skill": "Plumbing",
        "rating": 4.7,
        "distance_km": 2.0,
        "available": True,
        "workload": 2,
        "experience_years": 6,
        "verified": True,
    },
    {
        "id": 10,
        "name": "Imran",
        "skill": "Plumbing",
        "rating": 4.9,
        "distance_km": 2.7,
        "available": True,
        "workload": 4,
        "experience_years": 9,
        "verified": True,
    },
    {
        "id": 11,
        "name": "Karan",
        "skill": "Plumbing",
        "rating": 4.5,
        "distance_km": 3.4,
        "available": True,
        "workload": 1,
        "experience_years": 5,
        "verified": True,
    },
    {
        "id": 12,
        "name": "Ayesha",
        "skill": "Plumbing",
        "rating": 4.6,
        "distance_km": 4.0,
        "available": True,
        "workload": 3,
        "experience_years": 6,
        "verified": True,
    },
    {
        "id": 13,
        "name": "Deepak",
        "skill": "Plumbing",
        "rating": 4.4,
        "distance_km": 4.8,
        "available": False,
        "workload": 7,
        "experience_years": 4,
        "verified": True,
    },
    {
        "id": 14,
        "name": "Nisha",
        "skill": "Plumbing",
        "rating": 4.8,
        "distance_km": 5.5,
        "available": True,
        "workload": 2,
        "experience_years": 7,
        "verified": True,
    },

    # ============================================================
    # CARPENTRY — 6 WORKERS
    # ============================================================
    {
        "id": 15,
        "name": "Suresh",
        "skill": "Carpentry",
        "rating": 4.8,
        "distance_km": 1.5,
        "available": True,
        "workload": 2,
        "experience_years": 10,
        "verified": True,
    },
    {
        "id": 16,
        "name": "Anita",
        "skill": "Carpentry",
        "rating": 4.7,
        "distance_km": 2.3,
        "available": True,
        "workload": 3,
        "experience_years": 7,
        "verified": True,
    },
    {
        "id": 17,
        "name": "Mohit",
        "skill": "Carpentry",
        "rating": 4.6,
        "distance_km": 2.9,
        "available": True,
        "workload": 1,
        "experience_years": 6,
        "verified": True,
    },
    {
        "id": 18,
        "name": "Kavita",
        "skill": "Carpentry",
        "rating": 4.9,
        "distance_km": 3.6,
        "available": True,
        "workload": 4,
        "experience_years": 9,
        "verified": True,
    },
    {
        "id": 19,
        "name": "Rohit",
        "skill": "Carpentry",
        "rating": 4.5,
        "distance_km": 4.2,
        "available": True,
        "workload": 2,
        "experience_years": 5,
        "verified": True,
    },
    {
        "id": 20,
        "name": "Farah",
        "skill": "Carpentry",
        "rating": 4.6,
        "distance_km": 5.0,
        "available": False,
        "workload": 6,
        "experience_years": 6,
        "verified": True,
    },

    # ============================================================
    # CLEANING — 7 WORKERS
    # ============================================================
    {
        "id": 21,
        "name": "Sunita",
        "skill": "Cleaning",
        "rating": 4.9,
        "distance_km": 1.0,
        "available": True,
        "workload": 2,
        "experience_years": 7,
        "verified": True,
    },
    {
        "id": 22,
        "name": "Priya",
        "skill": "Cleaning",
        "rating": 4.8,
        "distance_km": 1.7,
        "available": True,
        "workload": 3,
        "experience_years": 6,
        "verified": True,
    },
    {
        "id": 23,
        "name": "Lakshmi",
        "skill": "Cleaning",
        "rating": 4.7,
        "distance_km": 2.4,
        "available": True,
        "workload": 1,
        "experience_years": 5,
        "verified": True,
    },
    {
        "id": 24,
        "name": "Rani",
        "skill": "Cleaning",
        "rating": 4.6,
        "distance_km": 3.0,
        "available": True,
        "workload": 4,
        "experience_years": 5,
        "verified": True,
    },
    {
        "id": 25,
        "name": "Shabnam",
        "skill": "Cleaning",
        "rating": 4.8,
        "distance_km": 3.7,
        "available": True,
        "workload": 2,
        "experience_years": 8,
        "verified": True,
    },
    {
        "id": 26,
        "name": "Geeta",
        "skill": "Cleaning",
        "rating": 4.5,
        "distance_km": 4.4,
        "available": False,
        "workload": 6,
        "experience_years": 4,
        "verified": True,
    },
    {
        "id": 27,
        "name": "Maya",
        "skill": "Cleaning",
        "rating": 4.7,
        "distance_km": 5.1,
        "available": True,
        "workload": 3,
        "experience_years": 6,
        "verified": True,
    },

    # ============================================================
    # GARDENING — 6 WORKERS
    # ============================================================
    {
        "id": 28,
        "name": "Raj",
        "skill": "Gardening",
        "rating": 4.8,
        "distance_km": 1.3,
        "available": True,
        "workload": 2,
        "experience_years": 7,
        "verified": True,
    },
    {
        "id": 29,
        "name": "Manoj",
        "skill": "Gardening",
        "rating": 4.6,
        "distance_km": 2.1,
        "available": True,
        "workload": 3,
        "experience_years": 5,
        "verified": True,
    },
    {
        "id": 30,
        "name": "Divya",
        "skill": "Gardening",
        "rating": 4.9,
        "distance_km": 2.8,
        "available": True,
        "workload": 1,
        "experience_years": 8,
        "verified": True,
    },
    {
        "id": 31,
        "name": "Sameer",
        "skill": "Gardening",
        "rating": 4.5,
        "distance_km": 3.5,
        "available": True,
        "workload": 4,
        "experience_years": 4,
        "verified": True,
    },
    {
        "id": 32,
        "name": "Komal",
        "skill": "Gardening",
        "rating": 4.7,
        "distance_km": 4.1,
        "available": True,
        "workload": 2,
        "experience_years": 6,
        "verified": True,
    },
    {
        "id": 33,
        "name": "Harish",
        "skill": "Gardening",
        "rating": 4.4,
        "distance_km": 5.3,
        "available": False,
        "workload": 7,
        "experience_years": 3,
        "verified": True,
    },

    # ============================================================
    # GENERAL REPAIRS — 7 WORKERS
    # ============================================================
    {
        "id": 34,
        "name": "Vivek",
        "skill": "General Repairs",
        "rating": 4.8,
        "distance_km": 1.4,
        "available": True,
        "workload": 2,
        "experience_years": 8,
        "verified": True,
    },
    {
        "id": 35,
        "name": "Sanjay",
        "skill": "General Repairs",
        "rating": 4.6,
        "distance_km": 2.2,
        "available": True,
        "workload": 3,
        "experience_years": 6,
        "verified": True,
    },
    {
        "id": 36,
        "name": "Ishita",
        "skill": "General Repairs",
        "rating": 4.9,
        "distance_km": 2.9,
        "available": True,
        "workload": 1,
        "experience_years": 9,
        "verified": True,
    },
    {
        "id": 37,
        "name": "Naveen",
        "skill": "General Repairs",
        "rating": 4.5,
        "distance_km": 3.3,
        "available": True,
        "workload": 4,
        "experience_years": 5,
        "verified": True,
    },
    {
        "id": 38,
        "name": "Swati",
        "skill": "General Repairs",
        "rating": 4.7,
        "distance_km": 4.0,
        "available": True,
        "workload": 2,
        "experience_years": 7,
        "verified": True,
    },
    {
        "id": 39,
        "name": "Tarun",
        "skill": "General Repairs",
        "rating": 4.4,
        "distance_km": 4.7,
        "available": False,
        "workload": 6,
        "experience_years": 4,
        "verified": True,
    },
    {
        "id": 40,
        "name": "Simran",
        "skill": "General Repairs",
        "rating": 4.8,
        "distance_km": 5.4,
        "available": True,
        "workload": 3,
        "experience_years": 6,
        "verified": True,
    },
]


# ================================================================
# FAIR WORKER MATCHING SCORE
# ================================================================
def calculate_worker_score(
    skill_match: float,
    distance_score: float,
    availability_score: float,
    rating_score: float,
    fairness_score: float,
) -> float:
    """
    Calculate a worker's overall matching score.

    Weighting:
    - Skill match:       30%
    - Distance:          20%
    - Availability:      20%
    - Rating:            15%
    - Workload fairness: 15%
    """

    score = (
        skill_match * 0.30
        + distance_score * 0.20
        + availability_score * 0.20
        + rating_score * 0.15
        + fairness_score * 0.15
    )

    return round(score, 2)
def get_worker_category(required_skill: str) -> str:
    skill = required_skill.lower()

    skill_groups = {
        "electrical repair": (
            "fan", "electrical", "wiring", "switch",
            "socket", "light", "power",
        ),
        "plumbing": (
            "plumb", "water", "leak", "pipe",
            "tap", "sink", "drain",
        ),
        "carpentry": (
            "carp", "wood", "furniture", "table",
            "chair", "door",
        ),
        "cleaning": (
            "clean", "housekeeping", "sanitation",
        ),
        "gardening": (
            "garden", "gardening", "lawn", "plant",
        ),
    }

    for category, keywords in skill_groups.items():
        if any(keyword in skill for keyword in keywords):
            return category

    return "general repairs"