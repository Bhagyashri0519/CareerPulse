# CareerPulse — AI-Powered Career Development Platform

> Helping students understand their skills, identify gaps, explore career paths, and grow with AI-guided learning roadmaps.

---

## ⚡ Quick Start

All primary commands can be executed directly from the repository root:

```bash
# 1. Generate local .env files across all services
npm run setup:env

# 2. Start the Frontend dev server with HMR
npm run dev
# → http://localhost:5173

# 3. Or preview the production build immediately
npm run preview
# → http://localhost:5173

# 4. In another terminal, start the Backend API
npm run dev:backend
# → http://localhost:4000
```

### Root Scripts Reference

| Command | Action |
|---|---|
| `npm run setup:env` | Generates `.env` files from templates across all services |
| `npm run dev` | Runs Frontend Vite dev server (`http://localhost:5173`) |
| `npm run preview` | Previews Frontend production build (`http://localhost:5173`) |
| `npm run build` | Builds both Frontend and Backend for production |
| `npm run build:frontend` | Builds Frontend production assets into `frontend/dist/` |
| `npm run build:backend` | Builds Backend TypeScript into `backend/dist/` |
| `npm run typecheck` | Typechecks Frontend and Backend |
| `npm run dev:backend` | Runs Backend Express server with auto-reload (`http://localhost:4000`) |
| `npm run test` / `test:backend` | Runs Backend Jest test suites |
| `npm run dev:all` | Runs Frontend and Backend concurrently |
| `npm run db:seed` | Seeds database with skill taxonomy |
| `npm run health` | Runs automated health check across all services |

---

## 🚀 Running Individual Services

### 1. Frontend (React 19 · Vite · Tailwind CSS v4)
Located in `frontend/`.

```bash
cd frontend
npm install
npm run dev      # Dev server with HMR → http://localhost:5173
npm run preview  # Serve production build → http://localhost:5173
```

### 2. Backend (Node.js · Express · TypeScript · MongoDB)
Located in `backend/`.

```bash
cd backend
npm install
npm run dev      # ts-node-dev → http://localhost:4000
npm test         # Run test suite
```

> **Note on MongoDB:** In local development, the backend will gracefully start even if MongoDB is not running locally, reporting `database: "disconnected"` in `/health` while keeping all non-database routes active.

### 3. AI Engine (Python · FastAPI · scikit-learn · Pydantic)
Located in `ai-engine/`.

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
    "timestamp": "2026-10-14T00:00:00.000Z",
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
    "timestamp": "2026-10-14T00:00:00.000Z"
  }
  ```

---

## 📁 Project Structure

```
CareerPulse/
├── package.json           Root script orchestrator (preview, dev, build, health)
├── frontend/              React 19 + Vite + Tailwind CSS v4 SPA
│   ├── src/               Pages, features, components, services
│   ├── public/            Static assets
│   ├── index.html         Vite entry point
│   ├── vite.config.ts     Vite configuration
│   ├── tsconfig.json      TypeScript configuration
│   └── package.json
├── backend/               Express + TypeScript + MongoDB API
│   ├── src/               Config, middleware, routes, modules, utils
│   ├── tests/             Jest test suites
│   ├── tsconfig.json      Backend TypeScript configuration
│   ├── jest.config.js     Jest configuration
│   └── package.json
├── ai-engine/             Python + FastAPI ML service
│   ├── app/               API routes, ML services, schemas, models
│   ├── tests/             Pytest test suite
│   └── requirements.txt
├── database/              DB guidelines, migration scripts & seed data
├── tests/                 Cross-module integration smoke tests
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
