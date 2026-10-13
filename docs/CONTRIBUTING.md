# Contributing — CareerPulse

Welcome to the CareerPulse team! This guide explains how to contribute code effectively.

---

## Getting Started

1. Fork or clone the repository.
2. Create a feature branch from `main` (see branching conventions below).
3. Make your changes following the coding conventions.
4. Open a Pull Request with a clear description.

---

## Git Branching Strategy

We use a simplified **GitHub Flow**:

| Branch | Purpose |
|---|---|
| `main` | Production-ready code |
| `dev` | Integration branch — PRs merge here first |
| `feature/<short-description>` | New features |
| `fix/<short-description>` | Bug fixes |
| `chore/<short-description>` | Config, docs, tooling |
| `experiment/<short-description>` | AI/ML experiments (never merge directly) |

### Examples
```
feature/skill-gap-page
fix/sidebar-mobile-close
chore/update-gitignore
experiment/bert-skill-extraction
```

---

## Commit Message Format

Follow **Conventional Commits**:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, missing semicolons |
| `refactor` | Code change without new feature or fix |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies |

### Examples
```
feat(skill-gap): add radar chart to gap analysis page
fix(auth): handle expired JWT tokens gracefully
docs(contributing): add commit message format section
```

---

## Pull Request Process

1. Ensure your branch is up to date with `dev`.
2. Run linting and tests locally before pushing.
3. Open a PR to `dev`, not directly to `main`.
4. Assign at least one reviewer.
5. Address all review comments before merging.
6. Squash commits when merging.

---

## Coding Conventions

See [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) for detailed conventions.

**Quick summary:**
- React components: **PascalCase**
- TypeScript files (non-component): **kebab-case**
- Python modules: **snake_case**
- React hooks: `use` prefix
- Environment variables: `UPPER_SNAKE_CASE`
- API routes: plural nouns (`/api/v1/assessments`)

---

## Adding a New Feature Module

### Frontend
1. Create `src/features/<feature-name>/` with `pages/`, `components/`, `hooks/`, `types.ts`, `index.ts`.
2. Add the route to `src/App.tsx`.
3. Add the nav link to `src/components/layout/Sidebar.tsx` if needed.

### Backend
1. Create `backend/src/modules/<module-name>/` with:
   - `<name>.routes.ts`
   - `<name>.controller.ts`
   - `<name>.service.ts`
   - `<name>.model.ts`
   - `<name>.validation.ts`
2. Register the router in `backend/src/routes/index.ts`.

### AI Engine
1. Add an endpoint in `ai-engine/app/api/`.
2. Add the schema in `ai-engine/app/schemas/`.
3. Implement the logic in `ai-engine/app/services/` or `pipelines/`.
4. Register the router in `ai-engine/app/main.py`.

---

## Questions?

Open an issue or start a discussion in the repository.
