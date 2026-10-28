# SkipPD

Marketplace where teachers list professional-development (PD) training and schools or other teachers book it.
Project plan and roadmap: [docs/SkipPD_v2.md](docs/SkipPD_v2.md).

```
docs/   documentation (plan, codebase map, conventions)
web/    the Next.js application
```

## Stack
Next.js (App Router, TypeScript) · Supabase (from Step 3) · Vercel hosting.

## Run locally
Requires Node.js 20.9+ (22 LTS recommended).

```bash
cd web
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
npm run format   # auto-format code (Prettier)
```

## Docs
- [docs/CODEBASE.md](docs/CODEBASE.md): what every file and folder is, and why.
- [docs/CONVENTIONS.md](docs/CONVENTIONS.md): coding style and documentation rules.
- [docs/HOW-TO.md](docs/HOW-TO.md): which file to edit for common changes.
- [AGENTS.md](AGENTS.md): start-here guide for AI agents and new contributors.

## Workflow
- `main` holds released versions only (tagged `vX.Y.Z`); Vercel production deploys from it.
- `dev` is the integration branch.
- Work happens on `feature/*` branches with PRs into `dev`.
- Every PR requires approval from `@skippdtraining` (see `.github/CODEOWNERS`).
