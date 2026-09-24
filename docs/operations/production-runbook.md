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

The API health response must report `status: ok`, `database: connected`, and a
finite D1 latency. The response must also contain `x-request-id`,
`x-forge-api-version: 1`, and `server-timing` headers.

## D1 backup

Create a full SQL export before applying a migration or destructive data
maintenance. Replace the date in the filename with the UTC backup date:

```bash
mkdir -p backups
npx wrangler d1 export forge-production --remote --output backups/forge-production-YYYY-MM-DD.sql
```

Treat exports as sensitive production data. Do not commit them, attach them to
issues, or upload them to an unencrypted personal drive. Record the export
time, migration number, Worker version, operator, and encrypted storage
location in the incident or release record.

## Restore drill

Never test a restore against the production database. Create a temporary D1
database, import the export, and inspect critical row counts and schema there:

```bash
npx wrangler d1 create forge-restore-drill
npx wrangler d1 execute forge-restore-drill --remote --file backups/forge-production-YYYY-MM-DD.sql
npx wrangler d1 execute forge-restore-drill --remote --command "SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name"
```

Use a temporary Wrangler configuration that binds the drill database before
running application-level checks. Delete the drill database only after the
validation record is complete and an authorized operator has confirmed the
exact database ID.

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
