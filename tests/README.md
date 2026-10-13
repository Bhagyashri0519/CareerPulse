# Cross-Module Tests — CareerPulse

This directory contains cross-module and integration smoke tests covering communication between the Frontend, Backend, and AI Engine.

## Testing Structure

- `tests/` — End-to-end integration and smoke tests.
- `backend/tests/` — Backend unit and API endpoint tests (Jest).
- `ai-engine/tests/` — AI service and FastAPI endpoint tests (pytest).

## Running Tests

- Root frontend typecheck: `npm run typecheck`
- Backend test suite: `npm run test:backend`
- Service health smoke test: `npm run health`
