# Development Guide — CareerPulse

This guide outlines code organization principles, naming standards, API formats, and developer workflows for CareerPulse.

---

## Code Organization Principles

1. **Feature-First Architecture**: Feature-scoped UI code belongs in `frontend/src/features/<feature>/` (components, pages, hooks). Shared utilities go into `frontend/src/components/`, `frontend/src/hooks/`, `frontend/src/utils/`, or `frontend/src/types/`.
2. **Thin Route Controllers**: Backend route handlers in `backend/src/modules/<domain>/` only parse requests, invoke services, and format standardized responses.
3. **Thin AI Endpoints**: AI Engine FastAPI endpoints in `ai-engine/app/api/` only validate schemas and delegate execution to `services/` or `pipelines/`.
4. **No Circular Imports**: Features may import from common folders (`components/`, `hooks/`, `utils/`, `types/`), never horizontally across features.

---

## Frontend Conventions (React 19 · TypeScript · Tailwind CSS v4)

### Component Structure
```tsx
// frontend/src/features/skill-gap/components/GapChart.tsx
import { BarChart } from 'recharts';
import type { UserSkill } from '@/types';

interface GapChartProps {
  skills: UserSkill[];
}

export default function GapChart({ skills }: GapChartProps) {
  return <BarChart /* ... */ />;
}
```

- Default export for components.
- Props interface declared in the same file or imported from `src/types/index.ts`.
- Complex data fetching or manipulation extracted into custom hooks.

### Styling & Tailwind CSS
Theme tokens and font definitions are configured in `frontend/src/index.css` under `@theme {}`. Use utility classes directly.

---

## Backend Conventions (Node.js · Express · TypeScript · MongoDB)

### Domain Module Structure
```
backend/src/modules/auth/
├── auth.routes.ts       → Router definition mounts on /api/v1/auth
├── auth.controller.ts   → Request parsing, calls service, sends response
├── auth.service.ts      → Business logic and database operations
├── auth.model.ts        → Mongoose schema and model definition
└── auth.validation.ts   → express-validator validation rules
```

### Response Envelope Format
All API responses conform to the uniform envelope:

**Success:**
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [ "Email format is invalid" ]
}
```

Helpers `sendSuccess()` and `sendError()` in `backend/src/utils/api-response.ts` handle response construction.

---

## AI Engine Conventions (Python · FastAPI · Pydantic)

### Endpoint Example
```python
# ai-engine/app/api/skill_gap.py
from fastapi import APIRouter
from app.schemas.skill_gap import SkillGapRequest, SkillGapResponse
from app.services.skill_gap_service import analyse_skill_gap

router = APIRouter()

@router.post("/", response_model=SkillGapResponse)
async def get_skill_gap(body: SkillGapRequest):
    return await analyse_skill_gap(body)
```

- Request and response schemas live in `ai-engine/app/schemas/`.
- Domain algorithms and ML models live in `services/`, `pipelines/`, and `models/`.

---

## Developer Commands & Verification

### Running Services Locally

| Command | Working Directory | Description |
|---|---|---|
| `npm run dev` | Repository Root | Starts Frontend Vite dev server (`http://localhost:5173`) |
| `npm run preview` | Repository Root | Previews production built frontend (`http://localhost:5173`) |
| `npm run dev:backend` | Repository Root | Starts Backend with ts-node-dev (`http://localhost:4000`) |
| `npm run dev:all` | Repository Root | Concurrently runs Frontend and Backend |
| `uvicorn app.main:app --port 8000` | `ai-engine/` | Starts Python AI service (`http://localhost:8000`) |

### Verification & Testing

```bash
# Frontend type check & build
npm run typecheck
npm run build

# Backend unit & integration tests
npm run test:backend
# or: cd backend && npm test

# AI Engine tests
cd ai-engine && pytest

# Automated health check across all services
npm run health
```
