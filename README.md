# CareerPulse — AI-Powered Career Development Platform

> Helping students understand their skills, identify gaps, explore career paths, and grow with AI-guided learning roadmaps.

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 20 and npm
- Python ≥ 3.12
- MongoDB (local or Atlas)

### 1. Frontend (React + Vite + Tailwind CSS)

```bash
cd frontend
npm install
cp .env.example .env    # set VITE_API_URL
npm run dev             # → http://localhost:5173
```

### 2. Backend (Node.js + Express + MongoDB)

```bash
cd backend
npm install
cp .env.example .env    # set MONGODB_URI and JWT_SECRET
npm run dev             # → http://localhost:4000
```

### 3. AI Engine (Python + FastAPI)

```bash
cd ai-engine
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000/docs
```

### 4. All services via Docker Compose

```bash
cp backend/.env.example backend/.env
cp ai-engine/.env.example ai-engine/.env
cp frontend/.env.example frontend/.env
docker compose up --build
```

---

## 📁 Project Structure

```
CareerPulse/
├── frontend/              React 19 + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/    Shared UI (layout/, common/, ui/, charts/)
│   │   ├── features/      Feature modules (auth, skills, career…)
│   │   ├── pages/         Routed page components
│   │   ├── context/       Global React context
│   │   ├── hooks/         Shared custom hooks
│   │   ├── services/      API client (fetch + JWT)
│   │   ├── types/         Shared TypeScript types
│   │   └── utils/         Pure utility functions
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/               Node.js + Express + TypeScript + MongoDB
│   └── src/
│       ├── modules/       Feature modules (auth, users, skills…)
│       ├── middleware/    JWT auth, validation, error handling
│       └── routes/        API router (/api/v1)
│
├── ai-engine/             Python + FastAPI + scikit-learn
│   └── app/
│       ├── api/           Thin HTTP endpoints
│       ├── services/      Business logic
│       └── pipelines/     ML processing pipelines
│
├── database/              DB docs, seed data, migration scripts
├── docs/                  Project documentation
├── scripts/               Dev & CI helper scripts
├── .github/               GitHub Actions CI/CD
├── .editorconfig          Consistent code style across editors
├── .gitattributes         Git LFS rules
├── .gitignore
├── docker-compose.yml     Multi-service orchestration
└── README.md              This file
```

---

## 📚 Documentation

| Document | Contents |
|---|---|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design & service communication |
| [FOLDER_STRUCTURE.md](./docs/FOLDER_STRUCTURE.md) | Complete directory reference |
| [DATABASE_DESIGN.md](./docs/DATABASE_DESIGN.md) | Entity models & relationships |
| [ENVIRONMENT_SETUP.md](./docs/ENVIRONMENT_SETUP.md) | Full local setup guide |
| [DEVELOPMENT_GUIDE.md](./docs/DEVELOPMENT_GUIDE.md) | Coding conventions & workflow |
| [CONTRIBUTING.md](./docs/CONTRIBUTING.md) | Git branching & PR process |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express, TypeScript, MongoDB + Mongoose, JWT |
| AI Engine | Python, FastAPI, Pydantic, scikit-learn, pandas |
| DevOps | Docker, Docker Compose, GitHub Actions |

---

## 📄 License

MIT — see [LICENSE](./LICENSE) for details.
