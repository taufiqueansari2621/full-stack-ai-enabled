# Versioned API Contract and Production Operations

## Outcome

Forge exposes a stable v1 Worker API contract without breaking existing
clients, verifies route coverage automatically, and documents safe production
release, backup, restore-drill, rollback, and incident procedures.

## API requirements

- `/api/v1/*` is the canonical stable namespace.
- Existing `/api/*` paths remain compatibility aliases.
- Every API response advertises `x-forge-api-version: 1` and links to the
  machine-readable OpenAPI contract.
- `GET /api/v1/openapi.json` documents every registered route and method.
- Request validation, consistent error envelopes, authentication,
  authorization, ownership checks, and appropriate rate limits remain enforced
  by the same handlers for versioned and compatibility paths.
- Contract tests fail when a registered Worker route is missing from OpenAPI.

## Operational requirements

- The release gate runs focused unit/API/migration/security tests, lint, strict
  TypeScript, production build, browser regression, and live verification.
- Production D1 is exported before schema or destructive maintenance.
- Restore drills target a temporary database, never the live database.
- Worker rollback requires a known version ID and confirmation that the older
  Worker is compatible with already-applied forward-only migrations.
- Incident records use request IDs and operational metadata without copying
  learner content.

## Verification

- `npm test`
- `npm run verify:cloudflare`
- Authenticated production account lifecycle
- Live `GET /api/v1/openapi.json` and version-discovery header checks
