\# AI Travel Planner



Plan trips, generate AI itineraries, and get a \*\*Trip Health Score\*\* — a deterministic

score (not AI-generated) measuring budget efficiency, travel pace, activity balance,

and destination coverage. Gemini is used only to generate itineraries and to narrate

an already-computed score; it never decides the number itself.



\## Stack

\- Frontend: React + Vite + Tailwind + React Query

\- Backend: Node.js + Express + MongoDB (Mongoose) + Gemini API

\- Auth: JWT access tokens + HttpOnly refresh cookies, with version-based revocation



\## Setup



\### Backend

cd backend

npm install



Create a `.env` file with:

MONGO\_URI=your\_mongodb\_connection\_string



PORT=5000



JWT\_ACCESS\_SECRET=at\_least\_32\_characters\_long



JWT\_REFRESH\_SECRET=at\_least\_32\_characters\_long



GEMINI\_API\_KEY=your\_gemini\_api\_key



npm run dev



\### Frontend



cd frontend

npm install

npm run dev



\## Key design decision

The Trip Health Score is computed purely from itinerary data — no AI involved.

The score is persisted \*before\* Gemini is ever called for an explanation, so a

Gemini outage degrades only the narration text, never the score itself.

Save (Ctrl+S).



3\. Git init and commit (run in order, in project root)

cmdcd C:\\Users\\kunch\\OneDrive\\Desktop\\AI\_Travel\_Planner

git init

git add .

git status

Stop here and paste the git status output to me before running the commit — I need to confirm .env, node\_modules, and any junk files aren't listed as files to be committed. Once I confirm it's clean, run:

cmdgit commit -m "Initial commit: AI Travel Planner with deterministic health score"

