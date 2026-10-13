# Folder Structure — CareerPulse

Complete reference for every directory in the monorepo.

```
CareerPulse/
│
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │  FRONTEND  (React 19 · Vite · Tailwind CSS v4 · TypeScript)        │
│  └─────────────────────────────────────────────────────────────────────┘
│
├── frontend/
│   ├── index.html                   Vite HTML entry point
│   ├── vite.config.ts               Vite + React + Tailwind CSS v4 config
│   ├── tsconfig.json                TypeScript config
│   ├── package.json                 Frontend deps & scripts
│   ├── .env.example                 Frontend environment variable template
│   ├── README.md
│   ├── public/                      Static assets (favicon, OG images…)
│   └── src/
│       ├── App.tsx                  Root component — router + providers
│       ├── main.tsx                 React DOM entry point
│       ├── index.css                Global styles + Tailwind CSS v4 @import
│       ├── vite-env.d.ts            Vite type declarations
│       │
│       ├── components/              Shared, reusable UI components
│       │   ├── layout/              Page-level shells
│       │   │   ├── DashboardLayout.tsx  Sidebar + topbar wrapper
│       │   │   ├── Sidebar.tsx          Navigation sidebar
│       │   │   ├── PublicNavbar.tsx     Landing/public navbar
│       │   │   └── index.ts             Barrel export
│       │   ├── ui/                  Design-system atoms (Button, Badge, Input…)
│       │   ├── charts/              Recharts wrappers (SkillRadar, ProgressRing…)
│       │   └── common/              Cross-feature helpers (AIAssistant, Loader…)
│       │
│       ├── features/                Feature-scoped code — grows as modules mature
│       │   ├── auth/                Login, register, password reset
│       │   ├── profile/             Student profile view & edit
│       │   ├── resume/              Resume upload & parsed skills
│       │   ├── skill-assessment/    Assessment flow & results
│       │   ├── skill-gap/           Gap analysis visualisation
│       │   ├── career-roadmap/      Milestone roadmap
│       │   ├── learning-resources/  Course/resource discovery
│       │   ├── interview-prep/      Mock interview & tips
│       │   ├── career-matching/     Career fit & role detail
│       │   ├── portfolio/           Project recommendations
│       │   ├── progress/            Learning progress tracking
│       │   └── admin/               Admin dashboard
│       │
│       ├── pages/                   Full-page components (routed in App.tsx)
│       │                            Migrate into features/ as each module matures
│       ├── context/
│       │   └── AppContext.tsx        Global auth + UI state (React Context)
│       ├── hooks/                   Shared custom hooks (useDebounce, useFetch…)
│       ├── services/
│       │   └── api.ts               Centralised HTTP client (fetch + JWT)
│       ├── types/
│       │   └── index.ts             Shared TypeScript interfaces
│       └── utils/
│           └── formatters.ts        Pure formatting utility functions
│
│
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │  BACKEND  (Node.js · Express · TypeScript · MongoDB + Mongoose)     │
│  └─────────────────────────────────────────────────────────────────────┘
│
├── backend/
│   ├── .env.example                 Environment variable template
│   ├── package.json                 Express, Mongoose, JWT, Helmet, ts-node-dev
│   ├── tsconfig.json
│   ├── README.md
│   └── src/
│       ├── app.ts                   Express app — CORS, Helmet, rate-limit, errors
│       ├── server.ts                Entry point — env validation + MongoDB connect
│       ├── config/                  DB, JWT, env config helpers
│       ├── modules/                 Feature modules — one per domain
│       │   ├── auth/                Register, login, token refresh
│       │   ├── users/               User CRUD
│       │   ├── profiles/            Student profiles
│       │   ├── resumes/             Upload & parse resumes
│       │   ├── skills/              Skill taxonomy management
│       │   ├── assessments/         Career assessment Q&A + scoring
│       │   ├── skill-gap/           Gap report storage & retrieval
│       │   ├── roadmaps/            Personalised learning roadmaps
│       │   ├── resources/           Course & resource catalogue
│       │   ├── interviews/          Interview session management
│       │   ├── career-matching/     Career role matching
│       │   ├── portfolio/           Project recommendations
│       │   ├── progress/            Progress records
│       │   └── admin/               Admin operations
│       ├── middleware/
│       │   ├── auth.middleware.ts   JWT authenticate() + authorise()
│       │   └── validate.middleware.ts  express-validator error formatter
│       ├── integrations/            Third-party client wrappers
│       ├── routes/
│       │   └── index.ts             Root API router — mounts all module routers
│       ├── utils/                   Backend utility functions
│       └── types/                   Backend-specific TypeScript types
│   └── tests/
│       ├── unit/                    Per-module unit tests (Jest)
│       └── integration/             API integration tests
│
│
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │  AI ENGINE  (Python · FastAPI · scikit-learn · pandas · Pydantic)  │
│  └─────────────────────────────────────────────────────────────────────┘
│
├── ai-engine/
│   ├── .env.example
│   ├── requirements.txt             FastAPI, uvicorn, pydantic, sklearn, pandas
│   ├── Dockerfile
│   ├── README.md
│   └── app/
│       ├── main.py                  FastAPI app — CORS, lifespan, router registration
│       ├── api/                     Thin HTTP endpoint handlers
│       │   └── health.py            GET /health
│       ├── schemas/                 Pydantic request/response models
│       ├── services/                Business logic (skill extraction, scoring…)
│       ├── pipelines/               Multi-step ML processing pipelines
│       ├── models/                  Trained model loaders
│       ├── recommenders/            Recommendation algorithms
│       ├── knowledge_graph/         Skill taxonomy graph utilities
│       ├── prompts/                 LLM prompt templates
│       └── utils/                   Shared Python utilities
│   ├── data/
│   │   ├── sample/                  Safe sample data for development
│   │   └── processed/               Processed datasets (gitignored)
│   ├── notebooks/                   Exploratory Jupyter notebooks (not production)
│   ├── artifacts/                   Saved model files (gitignored if large)
│   └── tests/                       pytest test suite
│
│
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │  SUPPORT  (database · docs · scripts · CI)                         │
│  └─────────────────────────────────────────────────────────────────────┘
│
├── database/
│   ├── docs/                        Entity diagrams, schema descriptions
│   ├── seeds/
│   │   └── skills.seed.ts           Sample skill taxonomy (safe sample data only)
│   └── scripts/                     DB migration/maintenance scripts
│
├── docs/
│   ├── ARCHITECTURE.md              System design, service communication
│   ├── CONTRIBUTING.md              Branching, commits, PR process
│   ├── DATABASE_DESIGN.md           Entities, fields, indexes, data retention
│   ├── DEVELOPMENT_GUIDE.md         Code conventions, patterns, lint/test commands
│   ├── ENVIRONMENT_SETUP.md         Step-by-step local setup guide
│   └── FOLDER_STRUCTURE.md          This file
│
├── scripts/                         Dev and CI helper scripts
│
├── .github/
│   └── workflows/
│       └── ci.yml                   Frontend typecheck+build · backend tests · AI lint
│
├── .editorconfig                    Consistent indentation across editors & languages
├── .gitattributes                   Git LFS tracking rules
├── .gitignore                       Excludes secrets, build output, private data
├── docker-compose.yml               Orchestrates all four services
└── README.md                        Project overview & quick start
```

---

## Module Addition Cheat-Sheet

| Adding a... | Location |
|---|---|
| New UI page | `frontend/src/features/<name>/pages/` → route in `frontend/src/App.tsx` |
| Shared React component | `frontend/src/components/ui/` or `common/` |
| Custom hook | `frontend/src/hooks/use-<name>.ts` |
| Backend API module | `backend/src/modules/<name>/` → register in `backend/src/routes/index.ts` |
| AI endpoint | `ai-engine/app/api/<name>.py` → register in `ai-engine/app/main.py` |
| Database seed | `database/seeds/<name>.seed.ts` |
| Documentation | `docs/<NAME>.md` |
