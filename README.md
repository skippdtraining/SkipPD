# SkipPD

Marketplace where teachers list professional-development (PD) training and schools or other teachers book it.
Project plan and roadmap: [SkipPD_v2.md](SkipPD_v2.md).

## Stack
Next.js (App Router, TypeScript) · Supabase (from Step 2) · Vercel hosting.

## Run locally
Requires Node.js 20.9+ (22 LTS recommended).

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

## Project layout
```
src/app/            routes, root layout, global styles
src/components/     UI components (catalog, cards, modals, forms)
src/lib/            types, sample data, filtering, client storage helpers
```

## Workflow
- `main` holds released versions only (tagged `vX.Y.Z`); Vercel production deploys from it.
- `dev` is the integration branch.
- Work happens on `feature/*` branches with PRs into `dev`.
- Every PR requires approval from `@skippdtraining` (see `.github/CODEOWNERS`).
