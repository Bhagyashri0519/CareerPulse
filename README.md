# CareerPulse — AI-Powered Career Development Platform

> Helping students understand their skills, identify gaps, explore career paths, and grow with AI-guided learning roadmaps.

---

## ⚡ Quick Start (Monorepo Commands)

All primary tasks can be executed directly from the repository root:

```bash
# 1. Generate local .env files across all services
npm run setup:env

# 2. Preview the built frontend immediately
npm run preview
# → http://localhost:5173

# 3. Or launch frontend in development mode with hot reload
npm run dev
# → http://localhost:5173

# 4. In another terminal, start the backend API
npm run dev:backend
# → http://localhost:4000
```

### Monorepo Scripts Reference

| Command | Action |
|---|---|
| `npm run setup:env` | Generates `.env` files for frontend, backend, and ai-engine |
| `npm run dev` | Runs Frontend Vite dev server (`http://localhost:5173`) |
| `npm run preview` | Previews Frontend production build (`http://localhost:5173`) |
| `npm run dev:backend` | Runs Backend Express server with auto-reload (`http://localhost:4000`) |
| `npm run dev:all` | Runs both Frontend and Backend concurrently |
| `npm run build` | Builds both Frontend and Backend for production |
| `npm run test` | Runs Jest unit and integration tests |
| `npm run db:seed` | Seeds database with skill taxonomy |
| `npm run health` | Runs automated health check against all services |

---

## 🚀 Running Individual Services

### 1. Frontend (React 19 · Vite · Tailwind CSS v4)

```bash
cd frontend
npm install
npm run dev      # Dev server with HMR → http://localhost:5173
npm run preview  # Serve production build → http://localhost:5173
```

### 2. Backend (Node.js · Express · TypeScript · MongoDB)

```bash
cd backend
npm install
npm run dev      # ts-node-dev → http://localhost:4000
npm test         # Run test suite
```

> **Note on MongoDB:** In local development, the backend will gracefully start even if MongoDB is not running locally, reporting `database: "disconnected"` in `/health` while keeping all non-database routes active.

### 3. AI Engine (Python · FastAPI · scikit-learn · Pydantic)

```bash
cd ai-engine
python3 -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- Interactive Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

---

## 📡 API Conventions & Health Checks

### 1. Response Envelope Format
All CareerPulse endpoints follow a strict, predictable JSON shape:

**Success:**
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Email format is invalid"
  ]
}
```

### 2. Health Check Endpoints
- **Backend:** `GET http://localhost:4000/health`
  ```json
  {
    "status": "ok",
    "service": "careerpulse-backend",
    "version": "1.0.0",
    "timestamp": "2026-10-13T18:20:00.000Z",
    "uptime": 42,
    "environment": "development",
    "database": "connected"
  }
  ```
- **AI Engine:** `GET http://localhost:8000/health`
  ```json
  {
    "status": "ok",
    "service": "careerpulse-ai-engine",
    "version": "1.0.0",
    "timestamp": "2026-10-13T18:20:00.000Z"
  }
  ```

---

## 📁 Project Structure

```
CareerPulse/
├── package.json           Root script runner (preview, dev, build, health)
├── frontend/              React 19 + Vite + Tailwind CSS v4 SPA
│   ├── src/               Pages, features, components, services
│   └── package.json
├── backend/               Express + TypeScript + MongoDB API
│   ├── src/               Config, middleware, routes, modules, utils
│   ├── tests/             Jest test suites
│   └── package.json
├── ai-engine/             Python + FastAPI ML service
│   ├── app/               API routes, ML services, schemas, models
│   ├── tests/             Pytest test suite
│   └── requirements.txt
├── database/              DB guidelines, migration scripts & seed data
├── docs/                  System architecture & developer guides
├── scripts/               Dev helpers (setup-env.sh, check-health.sh, run-dev.sh)
└── docker-compose.yml     Docker multi-container orchestration
```

---

## 📚 Documentation

| Document | Contents |
|---|---|
| [ENVIRONMENT_SETUP.md](./docs/ENVIRONMENT_SETUP.md) | Step-by-step local setup guide |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design & service communication |
| [FOLDER_STRUCTURE.md](./docs/FOLDER_STRUCTURE.md) | Complete directory and module reference |
| [DATABASE_DESIGN.md](./docs/DATABASE_DESIGN.md) | MongoDB schemas, indexes & retention |
| [DEVELOPMENT_GUIDE.md](./docs/DEVELOPMENT_GUIDE.md) | Coding conventions, responses & testing |
| [CONTRIBUTING.md](./docs/CONTRIBUTING.md) | Branching, commits & PR process |

---
