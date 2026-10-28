# Instructions for AI agents and new contributors

Read these before changing anything:
1. `docs/SkipPD_v2.md`: what the product is, decisions taken, roadmap.
2. `docs/CODEBASE.md`: what every file and folder does.
3. `docs/CONVENTIONS.md`: code style, documentation and modularity rules (follow them).
4. `docs/HOW-TO.md`: where to change common things (branding, settings, data backend).
5. `web/AGENTS.md`: Next.js version notes (this Next.js version may differ from what you know).

## Working rules
- The app lives in `web/`. Run all npm commands there.
- Only `web/src/lib/data/` may talk to a database. Business values go in `web/src/config/`.
- Never commit secrets. Use environment variables; `.env*` files are git-ignored.
- Branch from `dev` (`feature/...`), open PRs into `dev`. `main` receives tagged releases only. Every PR needs approval from `@skippdtraining`.
- Before a PR: `npm run format`, `npm run lint`, `npm run build` must pass.
- In the same PR, update `docs/CODEBASE.md` (files added/moved/removed) and `docs/HOW-TO.md` (new settings or recipes).
