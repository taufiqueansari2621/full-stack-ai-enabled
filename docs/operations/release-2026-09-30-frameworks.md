# Free framework preview release — September 30, 2026

Worker: `forge-ai-engineering`.
Version: `20b3723e-ab8b-4cb3-ac1b-5cd6306da450`.
Prior version: `34af2a52-addc-40c8-8694-1bf011d5489f`.
No migration, new infrastructure, paid upgrade, package CDN, or inference calls.

React JSX/TSX and Angular standalone JIT run in an opaque sandboxed iframe after
bounded compiler-worker transpilation. Bundled runtime allowlist only; no
arbitrary npm installation, backend execution, full framework typecheck/AOT,
private judge, or server-grade CPU/memory isolation is claimed.

Local gates: 21 Node + 70 Vitest tests, lint, strict builds, bundle budgets,
full responsive regression and dedicated framework browser tests pass.
The live framework suite proves both generated starters, local imports/templates,
state/signal updates, denied parent DOM and fetch, stale-preview removal,
compile/runtime errors, recovery, Stop, and four viewport widths.
Live public/PWA/security regression also passes. Runtime assets total 1,352 KiB
and are only loaded on explicit preview builds; app JS remains within budget.

The static host redirects index.html to /preview/; both routes receive the
preview-only policy. Main-page unsafe-eval remains prohibited. Preview files
bypass service-worker caching so iframe navigation cannot replace the app shell.

Production dependencies: npm audit --omit=dev reports zero advisories.
Full npm audit still reports four development-tool dependency findings affecting
brace-expansion and Wrangler/Miniflare/Undici; track a separately tested toolchain
update, not an automatic broad audit fix during this runtime release.

Connected Cloudflare API confirms no Turnstile widgets currently configured.
No widget or account-provider credentials were created by this unit.
