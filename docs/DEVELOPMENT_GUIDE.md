# Development Guide — CareerPulse

## Code Organization Principles

1. **Feature-first**: New UI code goes into `src/features/<name>/` not into loose page files.
2. **Thin routes**: Backend route files only call controller functions; no business logic.
3. **Thin endpoints**: AI Engine API handlers only call service/pipeline functions.
4. **No circular imports**: Features may import from `components/`, `hooks/`, `utils/`, and `types/` — not from each other.

---

## Frontend Conventions

### Component structure
```tsx
// src/features/skill-gap/components/GapChart.tsx

import { BarChart } from 'recharts';
import type { UserSkill } from '@/types';

interface GapChartProps {
  skills: UserSkill[];
}

export default function GapChart({ skills }: GapChartProps) {
  return <BarChart /* … */ />;
}
```

- Default export for every component.
- Props interface defined in the same file (or imported from `types.ts`).
- No business logic in render — extract to custom hooks.

### Adding a page

1. Create the page in `src/features/<feature>/pages/MyPage.tsx`.
2. Export it from `src/features/<feature>/index.ts`.
3. Import and route it in `src/App.tsx`.

### Tailwind CSS

This project uses **Tailwind CSS v4**. Theme tokens are defined in `src/index.css` under `@theme {}`. Use utility classes directly; avoid inline `style` unless a dynamic value cannot be expressed as a class.

---

## Backend Conventions

### Module structure (example: `auth`)

```
backend/src/modules/auth/
├── auth.routes.ts       → GET /api/v1/auth/…
├── auth.controller.ts   → parseRequest → call service → sendResponse
├── auth.service.ts      → business logic, DB operations
├── auth.model.ts        → Mongoose schema & model
└── auth.validation.ts   → express-validator chains
```

### Response format

All responses use a consistent shape:

```json
{ "success": true, "data": { … } }
{ "success": false, "message": "Validation failed", "errors": [ … ] }
```

---

## AI Engine Conventions

### Endpoint handler example

```python
# app/api/skill_gap.py
from fastapi import APIRouter
from app.schemas.skill_gap import SkillGapRequest, SkillGapResponse
from app.services.skill_gap_service import analyse_skill_gap

router = APIRouter()

@router.post("/", response_model=SkillGapResponse)
async def get_skill_gap(body: SkillGapRequest):
    return await analyse_skill_gap(body)
```

- All business logic lives in `services/` or `pipelines/`.
- All I/O shapes defined as Pydantic models in `schemas/`.

---

## Running Tests

### Frontend
```bash
# (Jest / Vitest — to be configured)
pnpm test
```

### Backend
```bash
cd backend
npm test
```

### AI Engine
```bash
cd ai-engine
source .venv/bin/activate
pytest
```

---

## Linting & Formatting

### Frontend/Backend (ESLint + Prettier)
```bash
pnpm lint       # or npm run lint in backend/
pnpm format     # oxfmt for frontend; prettier for backend
```

### AI Engine (ruff)
```bash
pip install ruff
ruff check app/
```
