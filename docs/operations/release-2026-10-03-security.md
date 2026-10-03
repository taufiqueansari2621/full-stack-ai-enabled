# Free account protection — October 3, 2026

Worker: `forge-ai-engineering`.
Version: `eeab0d3c-bb95-4c39-ac1f-f870e526b5cd`.
Prior code release: `20b3723e-ab8b-4cb3-ac1b-5cd6306da450`.
No migration, paid upgrade, additional compute service or inference calls.

The managed widget accepts only
`forge-ai-engineering.taufiqueansari895.workers.dev`. Its secret was transferred
directly from Cloudflare's widget API into the existing Worker's secret store,
without displaying or persisting it locally. Only the public site key is checked
into Wrangler config and returned by the no-store `/api/auth/config` endpoint.
The explicit provisioning script uses Wrangler's supported authentication
command in a captured subprocess; credentials never reach its output.

Register/login/recover enforce server-side success, exact hostname/action,
2,048-character token bounds and a ten-second provider deadline. Verification
failures/outages fail closed before account database operations. Existing rate
limits, logout and revocation remain unchanged. The account-only SDK load has
a deadline, retries remove old widgets, and each submission requires a fresh
token. Main CSP allows the documented provider script/frame origins; compiler,
runner and opaque framework-preview isolation policies are unchanged.

Verification: 21 Node + 91 Vitest tests, lint, strict builds and bundle budgets
pass. Explicitly mocked client Chrome tests cover gated submission, payload,
rejected-login reset, expiry/retry, singleton SDK and four widths. Full local
responsive learning regression passes. Live Chrome confirms the real provider
frame, public config containing only a site key, and missing-token rejection
on all three routes. Live public/PWA/security and React/Angular isolation
regressions pass. No real account was created by the dedicated security test.

## Manual acceptance

October 3 follow-up: the user reported "succeeds" after receiving the live
sign-in screenshot and opening Forge in normal Chrome for the instructed
security-check/account test. Manual acceptance is now recorded as user-reported
success; no fake token or automated challenge bypass was used. This does not
claim manual verification of every recovery/registration/error variant.

For future release checks, in a normal browser open the live site, choose Sign in to Forge and complete
the security check. Confirm login or registration succeeds with valid account
input, and a failed credential attempt presents a fresh check. Headless widget
rendering is not proof of successful human verification. Never add a fake token
or production test-key bypass to make automation pass. Email ownership and
email recovery remain deferred until the user supplies a sender domain;
optional OAuth and private multi-language execution are not complete.

## Local and live checks

The production widget intentionally rejects localhost. For local development
without provider access, use an empty site-key override (never deploy it):

```bash
npx wrangler dev --port 8787 --var TURNSTILE_SITE_KEY:
npm run test:security
FORGE_SECURITY_TEST_URL=https://forge-ai-engineering.taufiqueansari895.workers.dev FORGE_SECURITY_LIVE=1 npm run test:security
```

The local security script mocks only the browser provider/config/login response;
server-side rejection is separately exercised by unit tests and the live suite.
Legacy unattended production account/session scripts cannot pass a real human
challenge and must not be reported as reverified after this release.

Provider reference:
[Cloudflare CSP](https://developers.cloudflare.com/turnstile/reference/content-security-policy/)
and [widget management](https://developers.cloudflare.com/turnstile/get-started/widget-management/api/).
