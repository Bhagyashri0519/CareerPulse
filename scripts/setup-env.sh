#!/usr/bin/env bash
# ==============================================================================
# CareerPulse — Setup Environment Files
# Copies .env.example templates to .env files if not already present.
# ==============================================================================

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔧 Setting up environment files for CareerPulse..."

# Frontend
if [ -f "$REPO_ROOT/frontend/.env.example" ] && [ ! -f "$REPO_ROOT/frontend/.env" ]; then
  cp "$REPO_ROOT/frontend/.env.example" "$REPO_ROOT/frontend/.env"
  echo "✅ Created frontend/.env from template"
else
  echo "ℹ️  frontend/.env already exists (or template missing)"
fi

# Backend
if [ -f "$REPO_ROOT/backend/.env.example" ] && [ ! -f "$REPO_ROOT/backend/.env" ]; then
  cp "$REPO_ROOT/backend/.env.example" "$REPO_ROOT/backend/.env"
  echo "✅ Created backend/.env from template"
else
  echo "ℹ️  backend/.env already exists (or template missing)"
fi

# AI Engine
if [ -f "$REPO_ROOT/ai-engine/.env.example" ] && [ ! -f "$REPO_ROOT/ai-engine/.env" ]; then
  cp "$REPO_ROOT/ai-engine/.env.example" "$REPO_ROOT/ai-engine/.env"
  echo "✅ Created ai-engine/.env from template"
else
  echo "ℹ️  ai-engine/.env already exists (or template missing)"
fi

echo ""
echo "🎉 Environment configuration complete."
echo "Edit frontend/.env, backend/.env, or ai-engine/.env to adjust custom credentials."
