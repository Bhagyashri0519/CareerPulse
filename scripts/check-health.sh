#!/usr/bin/env bash
# ==============================================================================
# CareerPulse — Check Health Status of Services
# ==============================================================================

echo "=================================================="
echo "🩺 CareerPulse Service Health Checker"
echo "=================================================="

# Backend (Port 4000)
echo -n "Checking Backend (http://localhost:4000/health)... "
if curl -s -f http://localhost:4000/health > /dev/null 2>&1; then
  echo "✅ ONLINE"
  curl -s http://localhost:4000/health
  echo ""
else
  echo "❌ OFFLINE (Run 'npm run dev:backend')"
fi

echo ""

# AI Engine (Port 8000)
echo -n "Checking AI Engine (http://localhost:8000/health)... "
if curl -s -f http://localhost:8000/health > /dev/null 2>&1; then
  echo "✅ ONLINE"
  curl -s http://localhost:8000/health
  echo ""
else
  echo "❌ OFFLINE (Run 'cd ai-engine && uvicorn app.main:app --port 8000')"
fi

echo ""

# Frontend (Port 5173)
echo -n "Checking Frontend (http://localhost:5173)... "
if curl -s -f http://localhost:5173 > /dev/null 2>&1; then
  echo "✅ ONLINE"
else
  echo "❌ OFFLINE (Run 'npm run dev')"
fi

echo "=================================================="
