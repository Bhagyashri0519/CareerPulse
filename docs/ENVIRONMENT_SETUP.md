# Environment Setup — CareerPulse

This guide walks every team member through setting up and running CareerPulse locally.

---

## ⚡ Quick Start (TL;DR)

Get up and running from the repository root in 3 commands:

```bash
# 1. Generate all environment files (.env) from templates
npm run setup:env

# 2. Start the Frontend dev server (or preview production build)
npm run dev           # Dev server with HMR → http://localhost:5173
npm run preview       # Production preview → http://localhost:5173

# 3. In another terminal, start the Backend API
npm run dev:backend   # API server → http://localhost:4000
```

---

## 📋 Prerequisites

| Tool | Recommended Version | Purpose | Download |
|---|---|---|---|
| **Node.js** | ≥ 20.x | Frontend & Backend runtime | [nodejs.org](https://nodejs.org) |
| **npm** | ≥ 10.x | Package manager | Bundled with Node.js |
| **Python** | ≥ 3.10 | AI Engine FastAPI service | [python.org](https://python.org) |
| **MongoDB** | ≥ 7.x *(Optional for dev)* | Database | [mongodb.com](https://mongodb.com/try/download/community) or Atlas |

> [!NOTE]
> **MongoDB is optional for frontend development and local preview.**
> In development mode, the backend automatically detects if MongoDB is offline and continues running so that health checks and non-database routes remain fully functional.

---

## 📁 Repository Setup by Service

### 1. Root Monorepo Commands

You can run and orchestrate the entire platform from the repository root:

| Command | Action |
|---|---|
| `npm run setup:env` | Generates `.env` files for frontend, backend, and ai-engine |
| `npm run dev` | Runs the Frontend Vite development server |
| `npm run preview` | Serves the production build of Frontend |
| `npm run dev:backend` | Runs the Backend Express server with auto-reload |
| `npm run dev:all` | Runs both Backend and Frontend concurrently |
| `npm run build` | Compiles both Frontend and Backend |
| `npm run test` | Runs the backend unit and integration test suite |
| `npm run db:seed` | Populates MongoDB with the sample skill taxonomy |
| `npm run health` | Probes health status for Frontend, Backend, and AI Engine |

---

### 2. Frontend (React 19 · Vite · Tailwind CSS v4)

```bash
cd frontend

# Install dependencies (already installed)
npm install

# Start development server
npm run dev        # → http://localhost:5173

# Or build & preview
npm run build
npm run preview    # → http://localhost:5173
```

**Environment Variables (`frontend/.env`):**
```ini
VITE_API_URL=http://localhost:4000/api/v1
VITE_AI_ENGINE_URL=http://localhost:8000
```

---

### 3. Backend (Node.js · Express · TypeScript · MongoDB)

```bash
cd backend

# Install dependencies
npm install

# Start in development mode (hot reload via ts-node-dev)
npm run dev        # → http://localhost:4000

# Run tests
npm test

# Build TypeScript to dist/
npm run build

# Run production build
npm start
```

**Verify Backend:**
```bash
curl http://localhost:4000/health
# Response:
# {"status":"ok","service":"careerpulse-backend","version":"1.0.0","uptime":1,"database":"disconnected"}
```

**Environment Variables (`backend/.env`):**
```ini
NODE_ENV=development
BACKEND_PORT=4000
MONGODB_URI=mongodb://localhost:27017/careerpulse
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
AI_ENGINE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=500
```

---

### 4. AI Engine (Python · FastAPI · scikit-learn · Pydantic)

The AI Engine provides machine learning pipelines for resume parsing, skill matching, and gap analysis.

```bash
cd ai-engine

# 1. Create Python virtual environment
python3 -m venv .venv

# 2. Activate virtual environment
source .venv/bin/activate       # On Linux / macOS
# .venv\Scripts\activate       # On Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the FastAPI development server
uvicorn app.main:app --reload --port 8000
```

**Interactive API Documentation:**
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

**Environment Variables (`ai-engine/.env`):**
```ini
AI_ENGINE_PORT=8000
LLM_API_KEY=replace_with_your_llm_api_key
LLM_MODEL=gpt-4o-mini
BACKEND_URL=http://localhost:4000/api/v1
ENVIRONMENT=development
LOG_LEVEL=info
```

---

### 5. Multi-Service Health Checker

To verify which services are currently online, run:

```bash
npm run health
# or: bash scripts/check-health.sh
```

Sample output:
```
==================================================
🩺 CareerPulse Service Health Checker
==================================================
Checking Backend (http://localhost:4000/health)... ✅ ONLINE
{"status":"ok","service":"careerpulse-backend",...}

Checking AI Engine (http://localhost:8000/health)... ❌ OFFLINE
Checking Frontend (http://localhost:5173)... ✅ ONLINE
==================================================
```

---

## 🛠️ Troubleshooting

| Issue | Resolution |
|---|---|
| **Port 5173 or 4000 in use** | Kill existing process (`lsof -i :4000` → `kill -9 <PID>`) or change the port in `.env`. |
| **MongoDB connection failed warning** | Normal in dev mode without local mongod. If using MongoDB Atlas, update `MONGODB_URI` in `backend/.env`. |
| **Frontend preview cannot find dist** | Run `npm --prefix frontend run build` before `npm run preview`. |
| **Python package installation issues** | Ensure you are inside the activated `.venv` and Python version is ≥ 3.10. |
