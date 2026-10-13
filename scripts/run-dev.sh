#!/usr/bin/env bash
# ==============================================================================
# CareerPulse — Run Local Development Services
# ==============================================================================

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Ensure environment files are present
"$REPO_ROOT/scripts/setup-env.sh"

echo ""
echo "🚀 Starting CareerPulse Services..."
echo "1. Backend:  http://localhost:4000"
echo "2. Frontend: http://localhost:5173"
echo ""

# Trap SIGINT to kill background jobs cleanly
cleanup() {
  echo ""
  echo "🛑 Stopping CareerPulse services..."
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

echo "Starting Backend..."
(cd "$REPO_ROOT/backend" && npm run dev) &

echo "Starting Frontend..."
(cd "$REPO_ROOT/frontend" && npm run dev) &

wait
