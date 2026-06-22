# 🧭 Voyage — AI Travel Planner

> Plan trips, generate AI itineraries, and get a **Trip Health Score** — a deterministic, AI-free score measuring how good your trip plan actually is.

**🔗 Live demo:** [ai-travel-planner-mu-sandy.vercel.app](https://ai-travel-planner-mu-sandy.vercel.app)
**📦 Repository:** [github.com/rishitha1204/AI_Travel_Planner](https://github.com/rishitha1204/AI_Travel_Planner)

---

## ✨ What makes this different

Most "AI travel planner" projects ask Gemini/GPT to generate an itinerary and call it done. This one goes a step further with a **Trip Health Score** — and the key design decision is:

> **The score is never AI-generated.** It's computed deterministically from four metrics — budget efficiency, travel pace, activity balance, and destination coverage. Gemini is only used for two things: generating the initial itinerary, and writing a plain-English explanation of a score that has *already* been calculated and saved.

Why this matters: if Gemini is slow, rate-limited, or returns something malformed, your score is **still valid** — it was computed and persisted *before* the AI call ever happened. Only the narration text degrades, never the number a user is making budget decisions on.

## 🚀 Features

- **Auth** — Register/login with JWT access tokens + HttpOnly refresh cookies. Logout revokes all sessions via a version-counter on the user document (no Redis blacklist needed).
- **Trip management** — Create, view, and confirm trips with destination, dates, and budget.
- **AI itinerary generation** — Gemini generates a day-by-day itinerary based on destination, dates, pace, and budget. Itinerary can also be edited manually (add/edit/remove activities).
- **Trip Health Score** — Deterministic score (0–100) built from:
  | Metric | What it measures |
  |---|---|
  | Budget efficiency | How well planned costs track the stated budget |
  | Travel pace | Whether the itinerary is over/under-packed per day |
  | Activity balance | Variety across sightseeing, food, adventure, culture, etc. |
  | Destination coverage | How well the itinerary covers the destination |
- **AI explanation** — Once a score is computed, Gemini explains *why* in plain language and suggests improvements — narration only, never the number.
- **Profile** — Live trip stats (planned / draft / confirmed).

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   React     │ ───▶ │   Express    │ ───▶ │  MongoDB    │
│  (Vite, TW) │ ◀─── │   REST API   │ ◀─── │  (Atlas)    │
└─────────────┘      └──────┬───────┘      └─────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │  Gemini API  │  ← itinerary generation +
                      │  (Google AI) │     score explanation ONLY
                      └──────────────┘
```

**Key separation:** `healthScore.service.js` computes the score from pure trip data with zero AI calls, persists it, *then* calls Gemini for narration in a try/catch that can never affect the already-saved score.

### Backend module structure
```
backend/src/
├── modules/
│   ├── auth/        # JWT auth, register/login/refresh/logout
│   ├── trip/         # Trip CRUD, itinerary patching
│   ├── ai/            # Gemini client, itinerary generation
│   └── healthScore/  # Deterministic scoring + AI explanation
├── middleware/        # Auth guard, validation, rate limiting, errors
└── utils/             # ApiError, logger, shared helpers
```

## 🛠️ Tech Stack

**Frontend:** React · Vite · Tailwind CSS · React Query · React Router
**Backend:** Node.js · Express · MongoDB (Mongoose) · Zod validation
**Auth:** JWT (access + refresh) · HttpOnly cookies · bcrypt
**AI:** Google Gemini API
**Deployment:** Vercel (frontend) · Render (backend) · MongoDB Atlas (database)

## 📦 Local Setup

### Prerequisites
- Node.js 18+
- A MongoDB connection string (e.g. from [MongoDB Atlas](https://cloud.mongodb.com))
- A [Gemini API key](https://aistudio.google.com/apikey)

### Backend
```bash
cd backend
npm install
```
Create `backend/.env`:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_ACCESS_SECRET=at_least_32_characters_long_random_string
JWT_REFRESH_SECRET=a_different_32+_character_random_string
GEMINI_API_KEY=your_gemini_api_key
CLIENT_ORIGIN=http://localhost:5173
```
```bash
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173`.

## 🌐 Live Deployment Notes

- Backend is hosted on **Render's free tier**, which sleeps after inactivity. The first request after idle time may take 30–60 seconds to respond while it wakes up — this is expected, not a bug.
- Frontend is hosted on **Vercel** and **GitHub Pages**, both pointing to the same Render backend (CORS allowlist supports multiple origins).

## 🎯 What I'd add with more time

- Automated tests (currently none — scoped out for assignment timeframe)
- Access-token revocation (currently only refresh tokens are revocable mid-lifetime via the version counter)
- User-configurable score weighting (currently a single global weighting scheme)

## 📄 License

This project was built as a take-home assignment / portfolio piece.