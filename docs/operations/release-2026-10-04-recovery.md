# October 4, 2026 — Isolated managed recovery drill

## Verified provider result

- Database: `forge-restore-drill-20261004`
- Exact scratch UUID: `af3efec1-361e-48ee-b4dc-c81574d8be60`
- Forge account: `af93b360658e7749c259e3889a77d6a5`
- Eleven current migrations applied; seven projection triggers verified.
- Synthetic baseline: one account, profile, note, completed topic and workspace.
- Bookmark: `00000003-00000006-000050fa-797969181bd7d76edd015e6014b3cdab`
- Cloudflare confirmed restore to that exact bookmark after deleting the
  fictional account. All five records returned; foreign-key check passed,
  `quick_check` returned `ok`, and a subsequent snapshot write updated its note
  projection. Restore plus post-restore validation took 9,738ms.
- Previous bookmark reported by the provider:
  `00000003-ffffffff-000050fa-0a773bcec7585d8b6d7ef9eb294a18d8`.

Production UUID `6587d47b-fef4-4173-a64e-6904da7e018e` was never targeted by the
drill. No learner data was read, exported, copied, deleted or restored. No paid
service or application binding was introduced. The unbound scratch database
is retained with fictional records only, pending exact-ID operator cleanup.

## Corrections during verification

Initial file import succeeded but its progress-prefixed output broke JSON
parsing; after confirming zero accounts, only the five empty scratch bootstrap
tables were cleared. A second fixture used `notes` instead of Forge's actual
`knowledge` snapshot collection, and its assertion stopped before any restore.
Only that fictional fixture was removed. The final operator run verified the
preloaded schema and zero rows before seeding correctly. A compound SELECT
exceeded D1's term limit; scalar count subqueries fixed the read-only check.
None of these failed attempts is counted as a successful restore.

The reusable script fails closed on unsafe names, IDs, account mismatches,
nonempty tables and incomplete CLI output. A binding-free config plus UUID
targeting prevents collision with production aliases. Fixture, output-parser,
target and config safety tests cover these boundaries. Full local gate and
live public/PWA/offline/security-header checks are recorded in the progress
tracker. This CLI/operations-only unit needs no application deployment.

Final local gate: 32 Node + 128 Vitest tests, lint, strict build and bundle
budgets pass. Live production browser/public/PWA/offline verification passes.
Five new safety tests cover target/config guards, strict JSON output parsing,
actual fixture projection and post-write behavior. Production app assets and
Worker code are unchanged, so redeploying the application is unnecessary.

## Limits and next requirements

This proves managed recovery with Forge's schema and fictional records, not a
private production-export/import drill, restoration of every record type or a
production incident rehearsal. Production restore still needs explicit
incident authorization, write coordination and a confirmed recovery point.
Time Travel bookmarks expire with provider retention; they are not archives.
See [Cloudflare Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)
and [supported D1 checks](https://developers.cloudflare.com/d1/sql-api/sql-statements/).

Email ownership/recovery, optional OAuth, and isolated private multi-language
execution remain incomplete. The supplied Gmail address is not sender
authorization. No 100% completion or working external integration is claimed.
