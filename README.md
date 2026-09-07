# Veyra

### Fair work. Trusted services. Powered by cooperation.

Veyra is an AI-powered cooperative gig services platform designed to connect households with verified local service workers while helping cooperatives distribute work fairly and manage workforce demand intelligently.

Unlike a traditional gig marketplace, Veyra is designed around the cooperative ecosystem — helping customers find the right worker while giving workers fairer access to opportunities.

---

## 🚀 What We Built

Veyra currently includes:

- 🏠 Household service request system
- 🤖 AI-powered service understanding
- 🧠 Local ML fallback for reliable service classification
- ⚖️ Fair worker matching
- 👷 Verified worker profiles
- 📍 Location-aware worker matching
- 📅 Worker selection and booking
- 💰 Transparent service pricing
- 💵 Cash on Delivery payment option
- 📊 Cooperative administration dashboard
- 📈 AI demand forecasting interface
- 🔄 Live booking data on the dashboard
- 🌐 Deployed frontend and backend

---

## 🤖 AI Service Understanding

Customers can describe their problem naturally instead of selecting complicated service categories.

For example:

> "Mere ghar ka switch kaam nahi kar raha hai."

Veyra analyzes the request and identifies:

    Service: Electrical
    Issue: Switch not working
    Urgency: Medium
    Required skill: Electrical Repair

The system uses the Gemini API for intelligent service understanding and includes a local machine-learning fallback for improved reliability when the external AI service is unavailable.

---

## ⚖️ Fair Worker Matching

Veyra does not simply assign the highest-rated worker.

Workers are evaluated using multiple factors:

- Skill compatibility
- Distance
- Availability
- Worker rating
- Current workload

The matching system uses a deterministic scoring approach so that worker allocation is predictable and explainable.

This helps prevent excessive concentration of jobs among a small number of workers while still prioritizing qualified workers.

---

## 📅 Booking & Pricing

After understanding a service request, Veyra presents suitable workers to the customer.

Customers can:

1. Review matched workers
2. Select a worker
3. Choose a date and time
4. See the estimated service price
5. Confirm the booking
6. Select Cash on Delivery

Current demo service pricing:

| Service | Estimated Price |
|---|---:|
| Electrical | ₹350 |
| Plumbing | ₹400 |
| Carpentry | ₹500 |
| Cleaning | ₹450 |
| Gardening | ₹350 |
| General Repairs | ₹400 |

Prices are fixed demo estimates and may vary for more complex jobs after worker assessment.

---

## 📊 Cooperative Dashboard

The Veyra dashboard provides cooperative administrators with an overview of:

- Verified workers
- Active bookings
- Services
- Worker availability
- Worker workload
- Service demand
- AI demand forecasting
- Cooperative health
- Fair opportunity distribution
- Recent bookings

Booking information is connected to the deployed backend and automatically refreshed on the dashboard.

---

## 🧠 Demand Forecasting

Veyra includes an AI forecasting interface designed to help cooperatives anticipate upcoming service demand.

The goal is to help administrators prepare the workforce in advance.

For example:

> Electrical services are expected to have the highest demand tomorrow.

This can help cooperatives keep appropriately skilled workers available when demand is expected to increase.

---

## 🛠️ Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Leaflet
- React Leaflet

### Backend

- FastAPI
- Python
- Pydantic
- Uvicorn

### AI / Machine Learning

- Google Gemini API
- scikit-learn
- TF-IDF
- Logistic Regression
- joblib
- pandas

### Database & Authentication

- Supabase
- PostgreSQL
- Supabase Auth

### Deployment

- Vercel — Frontend
- Render — Backend
- GitHub — Source control

---

## 🏗️ Project Structure

    cooperative-gig-platform/
    │
    ├── app/
    │   ├── components/
    │   │   ├── Map.tsx
    │   │   ├── MapWrapper.tsx
    │   │   └── VeyraMatching.tsx
    │   │
    │   ├── dashboard/
    │   │   └── page.tsx
    │   │
    │   ├── request/
    │   │   └── page.tsx
    │   │
    │   └── page.tsx
    │
    ├── backend/
    │   ├── main.py
    │   ├── matching.py
    │   │
    │   └── ml/
    │       ├── data/
    │       │   ├── service_requests.csv
    │       │   └── generate_dataset.py
    │       │
    │       ├── models/
    │       │   ├── vectorizer.joblib
    │       │   ├── service_model.joblib
    │       │   ├── urgency_model.joblib
    │       │   ├── skill_model.joblib
    │       │   └── metadata.json
    │       │
    │       ├── local_analyzer.py
    │       └── train_model.py
    │
    ├── public/
    │
    ├── package.json
    ├── README.md
    └── ...

---

## 🔄 How Veyra Works

    Customer describes a problem
                ↓
         AI understands request
                ↓
     Service + issue + urgency + skill
                ↓
         Worker matching engine
                ↓
    Qualified workers ranked fairly
                ↓
          Customer selects worker
                ↓
           Date & time selected
                ↓
          Booking confirmed
                ↓
         Cooperative dashboard
                ↓
      Booking and workforce insights

---

## 🎯 Core Idea

Traditional gig platforms primarily optimize for transactions.

Veyra is designed to optimize for the **cooperative ecosystem**.

The platform aims to provide:

**Better matching for households.**

**Fairer opportunities for workers.**

**Smarter workforce management for cooperatives.**

---

## 🌐 Demo

### Veyra Web Application

https://cooperative-gig-platform-zeta.vercel.app/

### Backend API

https://veyra-backend-aydx.onrender.com/

### API Documentation

https://veyra-backend-aydx.onrender.com/docs

---

## 💻 Running Locally

### Frontend

Install dependencies:

    npm install

Start the development server:

    npm run dev

Open:

    http://localhost:3000

---

### Backend

Navigate to the backend:

    cd backend

Start the FastAPI server:

    python -m uvicorn main:app --reload

The API will run at:

    http://127.0.0.1:8000

API documentation:

    http://127.0.0.1:8000/docs

---

## 🔐 Environment Variables

The backend requires a Gemini API key.

Create a `.env` file inside `backend/`:

    GEMINI_API_KEY=your_api_key_here

Do not commit API keys or other secrets to GitHub.

---

## 🧪 Example Service Request

    My ceiling fan has stopped working.

Veyra can identify the request as:

    Service: Electrical
    Urgency: Medium
    Required Skill: Electrical Repair

The matching engine can then rank suitable workers based on skill, availability, distance, rating, and workload.

---

## 👥 Cooperative Vision

Veyra is built around the idea that local service workers should not simply be treated as individual gig workers competing for jobs.

Instead, workers can participate in a cooperative ecosystem where:

- Opportunities are distributed more fairly
- Skills are matched intelligently
- Workload can be monitored
- Service demand can be anticipated
- Customers receive trusted local services

---

## 📌 Current Status

**MVP — Functional Demo**

The current version demonstrates the core Veyra workflow:

- Customer request
- AI service understanding
- ML fallback
- Worker matching
- Worker selection
- Pricing
- Booking
- Cash on Delivery
- Cooperative dashboard
- Live booking data
- Demand forecasting interface

Additional capabilities such as advanced authentication, production payments, comprehensive worker verification, insurance/welfare integration, multilingual expansion, and advanced forecasting can be added in future iterations.

---

## 🏆 Built for Smart India Hackathon

**Problem Statement:** SIH26089

**Theme:** Cooperative Gig Services Platform for Household & Community Services

Veyra focuses on combining AI-assisted service understanding, explainable worker matching, and cooperative workforce management into a single platform.