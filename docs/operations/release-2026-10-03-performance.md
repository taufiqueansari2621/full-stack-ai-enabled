# October 3, 2026 — Opt-in performance monitoring

## Scope and local gate

Spec 44 adds a default-off Settings preference and coarse real browser
LCP/CLS/INP diagnostic collection through the existing Worker. No paid service,
account data export, new table or database migration. The pinned standard SDK
is lazy and self-hosted, without DOM attribution or experimental soft routes.

27 Node + 128 Vitest tests, lint, production build, bundle gates and npm audit
pass (zero vulnerabilities). Native local Chrome INP/CLS samples received HTTP
200; off/enable/reload/disable, omitted credentials/referrer, strict payload
fields, keyboard and 375/768/1280/1440px Settings checks passed. The complete
existing learner smoke suite passed 90 responsive and six focused lesson checks.
Entry JS: 465.9 KiB; app JS: 757.8 KiB; lazy SDK: 5.26 kB raw.

Logs are short-lived opt-in first-report samples, not full-visit/population
percentiles or evidence of a passing Core Web Vitals score. Cloudflare request
metadata and IP-derived rate limits still exist. See the production runbook.

## Production rollout

Pending deployment and live verification; record actual Worker version here.
Email/domain configuration, optional OAuth registration, separate isolated
private judge and operator D1 restore drill are not implemented by this unit.
