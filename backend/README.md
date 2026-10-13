# Backend — CareerPulse

Node.js + Express + TypeScript REST API.

## Setup

```bash
npm install
cp .env.example .env   # edit values
npm run dev            # development server at http://localhost:4000
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with hot-reload (ts-node-dev) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled output |
| `npm run lint` | ESLint |
| `npm test` | Run Jest tests |
| `npm run typecheck` | TypeScript type check only |

## API Base URL

`http://localhost:4000/api/v1`

## Health Check

`GET http://localhost:4000/health`
