# Architecture — CareerPulse

## Overview

CareerPulse is a **monorepo** containing three independently deployable services
that communicate over HTTP:

```
┌──────────────────────────────────────────────┐
│  Browser                                     │
│  React 19 + Vite + Tailwind CSS v4           │
│  (frontend/ — src/, index.html, vite.config) │
└────────────────────┬─────────────────────────┘
                     │ REST (VITE_API_URL)
                     ▼
┌──────────────────────────────────────────────┐
│  Backend — Node.js + Express + TypeScript    │
│  /api/v1/…                                   │
│  MongoDB (Mongoose)   JWT Auth               │
└──────────┬───────────────────────────────────┘
           │ REST (AI_ENGINE_URL)
           ▼
┌──────────────────────────────────────────────┐
│  AI Engine — Python + FastAPI                │
│  Skill extraction · Gap analysis             │
│  Career matching · Roadmap generation        │
└──────────────────────────────────────────────┘
```

## Service Responsibilities

### Frontend (`frontend/src/`)
- Renders all user-facing pages (public landing + protected dashboard).
- Communicates with the backend REST API through a centralised fetch client (`frontend/src/services/api.ts`).
- State is managed with React Context (`AppContext`) for MVP; can be extended to Zustand or React Query.

### Backend (`backend/`)
- Implements business logic as a **modular monolith**.
- All routes live under `/api/v1/`.
- Uses JWT for stateless authentication.
- Delegates AI workloads to the AI Engine via HTTP.

### AI Engine (`ai-engine/`)
- Independently deployable Python service.
- Keeps HTTP endpoints thin; all logic is in `services/` and `pipelines/`.
- Does **not** own a database; it reads data passed in requests and returns results.

## Data Flow — Skill Gap Analysis

1. Student completes assessment (frontend).
2. Frontend posts answers to `POST /api/v1/assessments`.
3. Backend stores the attempt, then calls `POST ai-engine/api/v1/skill-gap`.
4. AI Engine analyses skills vs. career requirements, returns gap report.
5. Backend persists the report and returns it to the frontend.
6. Frontend renders the Learning Gap page.

## Naming Conventions

| Context | Convention | Example |
|---|---|---|
| React components | PascalCase | `DashboardLayout.tsx` |
| TS files (non-component) | kebab-case | `auth.middleware.ts` |
| Python modules | snake_case | `skill_gap_service.py` |
| React hooks | `use` prefix | `useSkillGap.ts` |
| Env variables | UPPER_SNAKE_CASE | `MONGODB_URI` |
| API resources | plural nouns | `/api/v1/assessments` |
