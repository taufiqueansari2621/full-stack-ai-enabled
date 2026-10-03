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

Implementation commit `2f93d12` was pushed to GitHub main and deployed as Worker
`1bcfdffb-8d3d-4aca-9c21-28b2c4f81040`. Production Chrome reported real LCP, INP
and CLS, each accepted with HTTP 200. A filtered live tail confirmed the custom
`client_web_vital` log without displaying request metadata. Default off/no SDK,
reload-to-enable, credential/referrer omission, opt-out persistence, keyboard,
four viewport widths and no page errors passed against the deployed site.
Existing production/PWA/offline verification and live Turnstile/missing-token
security checks also passed. No database changes or billing upgrade.

Screenshot review then caught inherited modal styling overriding the new row;
the follow-up makes the checkbox horizontal, its label 14px and explanatory
copy 12px. Computed-style checks guard these properties in the browser suite.
Local full gates still pass; final layout rollout/version is recorded below
after deployment. Screenshot uses a disposable local test profile, not an
account or real learner records.

Email/domain configuration, optional OAuth registration, separate isolated
private judge and operator D1 restore drill are not implemented by this unit.
