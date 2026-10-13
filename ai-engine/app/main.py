"""
CareerPulse AI Engine — FastAPI entry point.

Responsibilities:
  - Expose HTTP endpoints consumed by the Node.js backend.
  - Delegate all business logic to services and pipelines.
  - Validate incoming requests with Pydantic schemas.

Start with:
  uvicorn app.main:app --reload --port 8000
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
# Uncomment as modules are implemented:
# from app.api.skill_extraction import router as skill_extraction_router
# from app.api.skill_gap import router as skill_gap_router
# from app.api.career_matching import router as career_matching_router
# from app.api.roadmap_generation import router as roadmap_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle hooks."""
    print("[AI Engine] Starting up...")
    yield
    print("[AI Engine] Shutting down...")


app = FastAPI(
    title="CareerPulse AI Engine",
    description="AI-powered skill analysis, career matching and roadmap generation.",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("BACKEND_URL", "http://localhost:4000"),
        "http://localhost:5173",
        "http://localhost:8443",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Root Endpoint ────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    return {
        "status": "ok",
        "service": "careerpulse-ai-engine",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(health_router, prefix="/health", tags=["Health"])
# app.include_router(skill_extraction_router, prefix="/api/v1/skills", tags=["Skills"])
# app.include_router(skill_gap_router, prefix="/api/v1/skill-gap", tags=["Skill Gap"])
# app.include_router(career_matching_router, prefix="/api/v1/career-matching", tags=["Career Matching"])
# app.include_router(roadmap_router, prefix="/api/v1/roadmap", tags=["Roadmap"])
