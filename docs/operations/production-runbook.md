# Forge Production Runbook

This runbook covers the deployed `forge-ai-engineering` Cloudflare Worker and
the remote `forge-production` D1 database. Run commands from the repository
root with the Cloudflare account shown by `npx wrangler whoami`.

## Release gate

Before every production deployment:

```bash
npm ci
npm test
npm run test:smoke
npx wrangler d1 migrations list forge-production --remote
```

After deployment, record the version printed by Wrangler and verify:

```bash
npx wrangler deployments status
npm run verify:cloudflare
FORGE_ACCOUNT_TEST_URL=https://forge-ai-engineering.taufiqueansari895.workers.dev npm run test:account
```

Since October 3, production account creation/login/recovery require real
Turnstile tokens. The old unattended account/session lifecycle scripts cannot
complete a human challenge: use them locally with an empty site-key override,
and do not introduce production test-key bypasses. Run the real-widget and
missing-token rejection suite, then manually verify successful account access:

```bash
FORGE_SECURITY_TEST_URL=https://forge-ai-engineering.taufiqueansari895.workers.dev FORGE_SECURITY_LIVE=1 npm run test:security
```

See `release-2026-10-03-security.md` for exact automated/manual coverage.

The API health response must report `status: ok`, `database: connected`, and a
finite D1 latency. The response must also contain `x-request-id`,
`x-forge-api-version: 1`, and `server-timing` headers.

## D1 backup

Before an additive, backward-compatible migration, retrieve and record a fresh
Cloudflare-managed recovery bookmark without copying learner data locally:

```bash
npx wrangler d1 time-travel info forge-production --json
```

Record the UTC time, database, bookmark, migration, and deployed Worker version.
If the bookmark lookup fails, stop the migration. Time Travel is always enabled
on supported production databases; retention depends on the account plan (at
least seven days). A bookmark is not a permanent archive. See the
[Cloudflare recovery documentation](https://developers.cloudflare.com/d1/reference/time-travel/).
Prefer a corrective forward migration for failures. A Time Travel restore
overwrites the live database and can lose newer learner writes: never perform
one as a test or without explicit incident-specific authorization.

For destructive maintenance or longer-lived archives, obtain explicit approval
for a full SQL export and its sensitive-data destination first. Replace the date
in the filename with the UTC backup date:

```bash
mkdir -p backups
npx wrangler d1 export forge-production --remote --output backups/forge-production-YYYY-MM-DD.sql
```

Treat exports as sensitive production data. Do not commit them, attach them to
issues, or upload them to an unencrypted personal drive. Record the export
time, migration number, Worker version, operator, and encrypted storage
location in the incident or release record.

## Restore drill

Never test a restore against production or export learner records just to run
a routine drill. Use a fresh, synthetic-only unbound database and the guarded
managed recovery script:

```bash
npx wrangler d1 create forge-restore-drill-YYYYMMDD --update-config=false
npm run verify:recovery -- forge-restore-drill-YYYYMMDD EXACT_NEW_DATABASE_UUID
```

Replace the date and UUID with the actual newly created target. The script
checks the Forge account, exact remote name/UUID and empty database, rejects
production, imports the current migrations, captures a managed bookmark,
deletes only its fictional fixture, restores and checks records, projections,
foreign keys, `quick_check` and a post-restore write. It uses a binding-free
operator config and targets the UUID, never the application `DB` binding.
It never exports production, resets existing data or deletes databases.

For a manually preloaded but empty schema, append `--preloaded-empty-schema`;
all migration object names/types and zero rows in every table must match before
seeding. Stop on failure and inspect only the scratch target; do not blindly
retry a nonempty database. See `release-2026-10-04-recovery.md` for the actual
successful provider drill and its limited synthetic coverage.

The small unbound scratch database is retained as evidence until an operator
confirms its exact ID for cleanup. Importing a real private backup, restoring
production or testing application account traffic against copied real data
requires separate incident-specific authorization and protected storage.

## Worker rollback

List deployments and inspect the last known-good version:

```bash
npx wrangler deployments list
npx wrangler versions view LAST_KNOWN_GOOD_VERSION_ID
```

Rollback only the Worker code after confirming the target version is
compatible with every already-applied D1 migration:

```bash
npx wrangler rollback LAST_KNOWN_GOOD_VERSION_ID --name forge-ai-engineering --message "Rollback after failed release"
```

D1 migrations are forward-only in production. If a schema change must be
reversed, ship a new corrective migration; do not manually edit the migration
history or restore an old database over current learner data.

## Incident triage

1. Confirm the impact using `/api/v1/health` and a private browser session.
2. Record the UTC start time, request IDs, affected routes, status codes, and
   current Worker version without copying learner content.
3. Inspect Cloudflare structured logs and traces by `x-request-id`.
4. Stop a rollout or rollback the Worker if the failure is code-only and the
   prior version is schema-compatible.
5. Preserve local/offline learner writes; do not advise users to clear browser
   storage during an outage.
6. After recovery, run the release verification commands and document the root
   cause, user impact, corrective action, and prevention work.

## API compatibility policy

- `/api/v1` is the canonical stable prefix. Legacy `/api` URLs remain aliases.
- Every API response advertises version `1` and links to
  `/api/v1/openapi.json`.
- Breaking request or response changes require `/api/v2`; additive fields do
  not.
- Revision-controlled progress and workspace writes reject stale updates with
  `409 REVISION_CONFLICT`.
- Certificate issuance is naturally idempotent per learner and certificate.
- Collection responses are bounded server-side; future unbounded collections
  must add opaque cursor pagination before release.
## Opt-in field performance samples

Learner Settings → **Share performance** is off by default, browser-local and
not part of cloud progress. Enable and reload to start; disable to immediately
abort pending sends and block further reporting until reload. Storage failures
fail closed. The standard, pinned web-vitals 5.3 library is self-hosted in a
5.26 kB lazy chunk; it is not loaded while sharing is off.

In Cloudflare → Workers & Pages → `forge-ai-engineering` → Observability, filter
structured custom logs by `event = client_web_vital`. Group samples by `name`,
`route`, `device`, and `rating`; inspect numeric `value`. LCP/INP are milliseconds,
CLS is unitless. `clientReported = true` explicitly marks untrusted diagnostics.
Keep exported reports to these fields; do not dump request headers or other
logs containing private data. For a safe browser check, run:

```sh
FORGE_VITALS_TEST_URL=https://forge-ai-engineering.taufiqueansari895.workers.dev npm run test:vitals
```

Only the first reported metric value per library ID is sent, capped at 30 per
document (including BFCache restorations). Initial coarse document route and
viewport category are fixed; SPA transitions do not create new visits. No SDK
IDs, DOM attribution, full URLs, queries, usernames, account identifiers or
learning content are submitted. Missing/unsupported metrics, including INP
without interaction, are not fabricated. Fetch omits credentials and referrer,
has a five-second deadline and no retry or offline queue. Collector requires
exact Origin, JSON <= 4096 bytes, strict schema, explicit consent and the
existing 60/hour IP-hash quota; no metrics table or migration is added.

These opt-in first-report samples are not representative population p75, final
full-visit measurements, or evidence that the site's Core Web Vitals pass.
Browser measurements can be forged; do not use them for learner scoring. The
existing quota stores an IP-derived hash, and Cloudflare invocation metadata
still exists: do not promise absolute anonymity. Existing account and Worker
logging policies remain unchanged.

As checked October 3, 2026, Workers Free includes 200,000 log events/day and
three-day retention; no paid plan or separate analytics service was enabled.
Quota exhaustion can drop observations. Cloudflare announces pricing changes
from December 1, 2026; re-check before that date. Sources:
[Google web-vitals](https://github.com/GoogleChrome/web-vitals) and
[Cloudflare Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/).
