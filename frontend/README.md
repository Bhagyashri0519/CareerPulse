# Frontend — CareerPulse

React 19 + Vite + Tailwind CSS v4 single-page application.

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev            # → http://localhost:5173
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Typecheck then production build |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript type check only |
| `npm run lint` | ESLint |

## Structure

```
src/
├── App.tsx              Root component (router + providers)
├── main.tsx             React DOM entry point
├── index.css            Global styles + Tailwind CSS v4 import
├── components/          Shared UI components
│   ├── layout/          DashboardLayout, Sidebar, PublicNavbar
│   ├── ui/              Design-system atoms (Button, Badge…)
│   ├── charts/          Recharts wrappers
│   └── common/          AIAssistant and other shared helpers
├── features/            Feature-scoped code (pages, components, hooks)
├── pages/               Routed page components
├── context/             React Context (AppContext)
├── hooks/               Shared custom hooks
├── services/            API client (api.ts)
├── types/               Shared TypeScript types
└── utils/               Pure utility functions
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:4000/api/v1`) |
| `VITE_AI_ENGINE_URL` | AI engine URL (optional) |
