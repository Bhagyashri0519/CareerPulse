# Frontend — CareerPulse

React 19 + Vite + Tailwind CSS v4 single-page application.

## Setup

```bash
cd frontend
npm install
npm run dev      # → http://localhost:5173
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Vite dev server with HMR (`http://localhost:5173`) |
| `npm run build` | Typecheck then production build (`dist/`) |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript type check only (`tsc --noEmit`) |
| `npm run lint` | ESLint |

## Environment Variables (`.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (`http://localhost:4000/api/v1`) |
| `VITE_AI_ENGINE_URL` | AI engine URL (`http://localhost:8000`) |
