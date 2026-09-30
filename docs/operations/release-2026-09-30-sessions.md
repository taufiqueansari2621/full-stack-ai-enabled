# Free-only session management — September 30, 2026

Worker: `forge-ai-engineering`.
Version: `34af2a52-addc-40c8-8694-1bf011d5489f`.
Prior version: `3bc0694e-d9e1-4b4c-98a6-2e8111912201`.

No database migration, new infrastructure, paid upgrade, or new provider.
Existing session rows support bounded owner-only listing and same-origin,
confirmed targeted/all-other revocation. Tokens/hashes never enter responses;
current-session exclusion is enforced in SQL, not just the UI. No device or
location fingerprinting. Revocation affects subsequent authorization checks.

Local verification: 21 Node + 66 Vitest tests, lint, strict builds, bundle
budgets, full responsive smoke, and two-browser-context session smoke pass.
The session suite makes no model inference calls. Broader account/AI features
were production-verified in the previous release and unchanged by this unit.

Git push of all six earlier commits succeeded through `f4a566d`; separate GitHub
CLI login remains absent but is not a blocker for Git's credential helper.

Live session and public/PWA/security regression checks passed against the
deployed version. Full-spec completion remains 57 complete, 4 partial chapters;
this closes a security subtask, not the remaining provider or sandbox gaps.
