# Unit 13: Cloudflare Production Hosting

## Goal

Publish the current Forge Vite application to Cloudflare without changing its
local-first learner model or breaking direct workspace URLs.

## Architecture

- Use Cloudflare Workers Static Assets, the recommended platform for new
  Cloudflare static applications.
- Deploy the existing Vite `dist` output with no server-side Worker code.
- Configure `single-page-application` fallback so `/learn`, `/roadmap`, and
  every other client route serves `index.html` on direct navigation or refresh.
- Keep the deployment reproducible through `wrangler.jsonc` and npm scripts.
- Do not attach or modify a custom domain unless the learner explicitly asks.

## Acceptance Criteria

1. `npm run lint` and `npm run build` pass before deployment.
2. Wrangler dry-run accepts the static-assets configuration.
3. Production deployment succeeds under the `forge-ai-engineering` name.
4. The production root and at least two direct SPA routes return HTTP 200.
5. Production HTML references deployed hashed assets successfully.
6. No existing Cloudflare project or custom domain is overwritten.

## Verification

- `npm run lint` — passed.
- `npm run build` — passed.
- `npx wrangler deploy --dry-run` — accepted 13 production assets.
- `npm run deploy:cloudflare` — published version
  `01807517-a352-4b47-8108-8124f0a60fce`.
- Live URL: `https://forge-ai-engineering.taufiqueansari895.workers.dev`.
- Root, `/learn`, `/roadmap`, and `/resources` returned HTTP 200.
- `npm run verify:cloudflare` passed SPA routing, React boot, lazy content,
  focused learning, console-health, and 390px overflow checks.
