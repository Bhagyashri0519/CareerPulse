# Environment Setup — CareerPulse

This guide walks you through running the complete platform locally.

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 20 | [nodejs.org](https://nodejs.org) |
| pnpm | ≥ 9 | `npm i -g pnpm` |
| Python | ≥ 3.12 | [python.org](https://python.org) |
| MongoDB | ≥ 7 | [mongodb.com](https://mongodb.com/try/download/community) or MongoDB Atlas |
| Git | any | [git-scm.com](https://git-scm.com) |

---

## Step 1 — Clone and install

```bash
git clone <your-repo-url> CareerPulse
cd CareerPulse
```

---

## Step 2 — Frontend

```bash
# Install deps (uses pnpm from .mise.toml)
pnpm install

# Copy and fill env file
cp .env.example .env

# Start dev server (hot-reload, port 8443)
pnpm dev
```

The app is available at **http://localhost:8443**.

---

## Step 3 — Backend

```bash
cd backend

# Install deps
npm install

# Configure environment
cp .env.example .env
# Edit .env and set:
#   MONGODB_URI=mongodb://localhost:27017/careerpulse
#   JWT_SECRET=<your-secret>

# Start dev server (hot-reload, port 4000)
npm run dev
```

Test the backend is running:
```bash
curl http://localhost:4000/health
# → {"status":"ok","service":"careerpulse-backend","timestamp":"…"}
```

---

## Step 4 — AI Engine

```bash
cd ai-engine

# Create virtual environment
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Start FastAPI dev server (port 8000)
uvicorn app.main:app --reload --port 8000
```

Test the AI engine:
```bash
curl http://localhost:8000/health
# → {"status":"ok","service":"careerpulse-ai-engine","timestamp":"…"}
```

---

## Step 5 — Docker Compose (all services)

```bash
# From repo root
cp .env.example .env
cp backend/.env.example backend/.env
cp ai-engine/.env.example ai-engine/.env

# Build and start all containers
docker compose up --build

# Tear down (preserves volumes)
docker compose down
```

---

## Environment Variables Reference

### Frontend (`.env`)
| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend API base URL |
| `VITE_AI_ENGINE_URL` | No | Direct AI engine URL (optional) |

### Backend (`backend/.env`)
| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Long random string for JWT signing |
| `JWT_EXPIRES_IN` | No | Token TTL (default: `7d`) |
| `BACKEND_PORT` | No | Port (default: `4000`) |
| `AI_ENGINE_URL` | Yes | URL of AI engine service |
| `FRONTEND_URL` | Yes | Allowed CORS origin |

### AI Engine (`ai-engine/.env`)
| Variable | Required | Description |
|---|---|---|
| `LLM_API_KEY` | Yes* | API key for the LLM provider |
| `LLM_MODEL` | No | Model name (default: `gpt-4o-mini`) |
| `AI_ENGINE_PORT` | No | Port (default: `8000`) |
| `BACKEND_URL` | No | Backend URL for callbacks |

*Required only when LLM-based features are enabled.

---

## Troubleshooting

**Port already in use:** Change the port in the relevant `.env` file.

**MongoDB connection refused:** Ensure MongoDB is running locally or update `MONGODB_URI` to point to Atlas.

**pnpm not found:** Run `npm i -g pnpm` or use `mise install` if you have mise configured.
