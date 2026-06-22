# 🧭 Voyage — AI Travel Planner

> Plan trips, generate AI itineraries, and get a **Trip Health Score** — a deterministic, AI-free score measuring how good your trip plan actually is.

**🔗 Live demo:** [rishitha1204.github.io/AI_Travel_Planner/](https://rishitha1204.github.io/AI_Travel_Planner/)
**📦 Repository:** [github.com/rishitha1204/AI_Travel_Planner](https://github.com/rishitha1204/AI_Travel_Planner)
**🎥 Video walkthrough:** *[add your video link here before submitting]*

---

## 1. Project Overview

Voyage is a full-stack travel planning app where users register, create trips, generate an itinerary with AI, and then get a **Trip Health Score** — a 0–100 score across four dimensions (budget efficiency, travel pace, activity balance, destination coverage) that tells them, objectively, whether their trip is actually well-planned.

The core product bet: **AI is good at generating options and explaining things in plain language, but bad at being a trustworthy, reproducible judge of quality.** So this app uses AI for generation and explanation, and pure deterministic logic for judgment — see [Key Design Decisions](#8-key-design-decisions--trade-offs) below for the full reasoning.

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite | Fast dev loop, no need for SSR/Next.js for an authenticated SPA |
| Styling | Tailwind CSS | Speed of iteration, no separate CSS files to keep in sync |
| Data fetching | React Query | Cache-coherent mutations (itinerary edits patch cache directly via `setQueryData` instead of refetching) |
| Backend | Node.js + Express | Lightweight, explicit middleware chain — easy to reason about request lifecycle for a take-home of this size |
| Database | MongoDB (Mongoose) | Itinerary data is naturally nested/document-shaped (trip → days → activities); avoids a 4-table join for what is conceptually one object |
| Validation | Zod | Single schema definition validates both request shape and gives TypeScript-style inference without TypeScript |
| Auth | JWT (access + refresh) + HttpOnly cookies | Stateless access tokens for speed, revocable refresh tokens for security — see Section 5 |
| AI | Google Gemini API | Used narrowly — see Section 6 |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas (DB) | Free tiers sufficient for an assignment; Vercel for static frontend hosting, Render for a persistent Node process |

No deviation from a "default" MERN-ish stack was needed for this scope — the interesting decisions are in *how* the AI and scoring are separated, not in unusual tech choices.

## 3. Setup Instructions

### Local Setup

**Prerequisites:** Node.js 18+, a MongoDB connection string ([MongoDB Atlas](https://cloud.mongodb.com) free tier works), a [Gemini API key](https://aistudio.google.com/apikey).

**Backend:**
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

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173`.

### Deployed Setup

- **Frontend:** Vercel, root directory `frontend`, env var `VITE_API_BASE_URL` pointing at the Render backend's `/api` path.
- **Backend:** Render, root directory `backend`, build `npm install`, start `node server.js`, with the same env vars as local plus `NODE_ENV=production` and `CLIENT_ORIGIN` set to the deployed frontend URL(s) — the CORS layer supports a list of allowed origins so the app can be deployed to more than one frontend host (Vercel + GitHub Pages, in this case) against one shared backend.
- **Database:** MongoDB Atlas, network access opened to `0.0.0.0/0` since Render's outbound IP isn't static on the free tier.

**Note:** the backend is on Render's free tier, which sleeps after inactivity. The first request after idle time can take 30–60 seconds to respond — expected behavior, not a bug.

## 4. High-Level Architecture

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

**Backend module structure** (feature-based, not layer-based, so everything about one feature lives together):
```
backend/src/
├── modules/
│   ├── auth/         # JWT auth: register, login, refresh, logout
│   ├── trip/          # Trip CRUD, itinerary patching
│   ├── ai/             # Gemini client + itinerary generation use case
│   └── healthScore/   # Deterministic scoring + AI explanation
├── middleware/         # Auth guard, Zod validation, rate limiting, error handler
└── utils/              # ApiError, logger, shared helpers
```

Each module follows `routes → controller → service → repository`, with Zod validation sitting in front of the controller so controllers never have to defensively re-check input shape.

## 5. Authentication and Authorization

- **Access tokens** (JWT, short-lived) are returned to the client and held in memory only — never in `localStorage`, so they can't be exfiltrated via XSS.
- **Refresh tokens** are issued as `HttpOnly` cookies, invisible to JavaScript, and used to silently re-establish a session on page load.
- **Revocation:** every user document has a `refreshTokenVersion` counter. Logout increments it; any refresh token issued before that bump fails verification on its next use. This gives a full "log out everywhere" without needing a separate token blacklist/Redis store — the revocation check is just a number comparison.
- **Enumeration protection:** login returns the identical error and status code whether the email doesn't exist or the password is wrong, so an attacker can't use the login endpoint to discover which emails are registered.
- **Authorization:** a `requireAuth` middleware verifies the access token and attaches the user to `req.user`; all trip/health-score routes are scoped to `req.user.id` at the repository layer, so one user can never read or mutate another user's data even if they guess an ID.

## 6. AI Agent Design and Purpose

Gemini is used in exactly two places, and deliberately **not** in a third place where it might seem obvious to use it:

1. **Itinerary generation** (`generateItinerary.usecase.js`) — given destination, dates, budget, and a pace preference, Gemini drafts a day-by-day itinerary. The response is parsed, schema-validated (Zod), and retried with a corrective prompt if the model returns something malformed — generation isn't trusted blindly.
2. **Score explanation** (`explainHealthScore.usecase.js`) — given the four *already-computed* metric scores, Gemini writes a plain-language summary and recommendations. It receives numbers, not raw trip data, so it's narrating a result, not producing one.
3. **Deliberately NOT used for:** computing the Trip Health Score itself. See Section 7 — this is the central design decision of the project.

**Resilience:** the score is saved to the database *before* Gemini is called for the explanation. If the Gemini call fails, times out, or returns something that doesn't parse, the catch block marks `explanation.status = 'failed'` and the request still succeeds with a valid score — only the narration is missing, recoverable by retrying later.

## 7. Creative/Custom Feature: The Trip Health Score

This is the project's differentiator. Most "AI travel planner" submissions ask an LLM to generate an itinerary and stop there. This one adds a second layer: **can the trip be scored, objectively and reproducibly, the same way every time?**

The score is computed by `computeHealthScoreMetrics()` — a pure function, identical trip data in, identical score out, every time, with zero network calls:

| Metric | What it measures | Weight |
|---|---|---|
| Budget efficiency | How well planned activity costs track the stated trip budget | 30% |
| Travel pace | Whether the itinerary is over- or under-packed per day | 25% |
| Activity balance | Variety across categories (sightseeing, food, adventure, culture, etc.) | 25% |
| Destination coverage | How well the itinerary covers the stated destination | 20% |

Weights and scoring version are tracked (`SCORING_VERSION`) so future tuning never silently changes the meaning of a historical score.

## 8. Key Design Decisions & Trade-offs

**Decision: the score is never AI-generated.**
Trade-off accepted: the score can't account for subjective qualitative factors an LLM might catch (e.g. "this itinerary doesn't account for jet lag"). Benefit gained: the score is reproducible, fast (no API latency or cost on every page load), and survives a Gemini outage with zero functional impact on the number itself — only the narration degrades.

**Decision: refresh-token revocation via version counter instead of a token blacklist.**
Trade-off accepted: doesn't let you revoke one specific session while leaving others active (it's all-or-nothing per user). Benefit gained: no Redis/extra infra needed, and the check is a single integer comparison.

**Decision: feature-based backend module structure instead of layer-based (no global `/controllers`, `/services` folders).**
Trade-off accepted: slightly more boilerplate per module (each has its own routes/controller/service/repository files). Benefit gained: everything about `healthScore` — its model, validation, repository, and service — lives in one folder, so a reviewer can understand one feature without jumping across the codebase.

**Decision: React Query with direct cache patching on mutations rather than refetch-after-write.**
Trade-off accepted: more code per mutation (manually shaping the cache update). Benefit gained: itinerary edits feel instant — no network round-trip before the UI reflects a change.

## 9. Known Limitations

- **No automated tests.** Scoped out given the assignment timeframe; manual end-to-end testing was used instead (register → login → create trip → generate itinerary → confirm → compute score → log out → log back in).
- **Access tokens can't be revoked before they expire** — only refresh tokens are revocable via the version counter. An access token issued just before logout remains valid until its short natural expiry.
- **Score weighting is global, not user-configurable.** Every trip is scored against the same fixed weights; a future version could let users indicate what they care about most (e.g. budget vs. variety).
- **Render free-tier cold starts.** The backend sleeps after ~15 minutes of inactivity; first request after that can take 30–60 seconds.

## 10. What I'd Add With More Time

- Automated tests (unit tests for the four scoring metrics specifically — they're pure functions, easy to test in isolation, and the most important code to trust)
- Access-token revocation (e.g. a short-lived denylist for the rare "I need to kill this session right now" case)
- User-configurable score weighting

---

*Built as a take-home assignment / portfolio piece.*
This project was built as a take-home assignment / portfolio piece.
