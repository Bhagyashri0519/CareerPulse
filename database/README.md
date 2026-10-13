# Database — CareerPulse

This directory contains database documentation, schema seeds, and migration/maintenance scripts for CareerPulse.

## Directory Structure

```
database/
├── docs/                Architecture & schema diagrams (see docs/DATABASE_DESIGN.md)
├── scripts/
│   └── seed.ts          Automated seed runner
└── seeds/
    └── skills.seed.ts   Standardized taxonomy seed dataset
```

## Running Database Seeds

To populate your local or Atlas MongoDB with the initial skill taxonomy:

```bash
# From repository root
npm run db:seed

# Or directly from backend
cd backend
npx ts-node ../database/scripts/seed.ts
```

If MongoDB is offline, the seed script will safely output the JSON taxonomy payload for offline verification.
