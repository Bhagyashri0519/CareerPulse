"""Health check router for the CareerPulse AI Engine."""

from datetime import datetime, timezone
from fastapi import APIRouter

router = APIRouter()


@router.get("/", summary="Health check")
async def health_check():
    return {
        "status": "ok",
        "service": "careerpulse-ai-engine",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
