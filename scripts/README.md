# Developer Scripts — CareerPulse

This directory contains development automation and operational helper scripts.

## Scripts Overview

| Script | Command | Purpose |
|---|---|---|
| `setup-env.sh` | `npm run setup:env` | Copies `.env.example` templates to `.env` across frontend, backend, and ai-engine if missing. |
| `check-health.sh` | `npm run health` | Pings `/health` and status endpoints for Frontend, Backend, and AI Engine. |
| `run-dev.sh` | `npm run dev:all` | Launches Backend and Frontend concurrently with signal trapping. |
| `seed.ts` (in `database/scripts`) | `npm run db:seed` | Seeds database with skill taxonomy data. |
