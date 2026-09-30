# Free-only account session management

Use the existing sessions table and Worker; add no services, billing, or migration.
Authenticated GET lists at most 50 active unexpired sessions, current session
first, exposing only row ID, creation/expiry dates, and a current boolean.
Do not expose bearer tokens/hashes or invent device/location/last-active data.
Disclose truncation and allow revoking all other sessions even beyond the page.

Authenticated same-origin POST revokes an owned session ID or all other sessions.
Never revoke the current session through this endpoint (existing logout handles
that). Use user ID derived from authentication and exclude the current token
hash in the SQL mutation. Foreign/unknown IDs are idempotent no-ops. Changes
affect future authenticated requests, not already executing requests.

Lazy account-security panel in cloud My Progress has explicit load, loading,
empty, error/retry, offline and confirmation states. No automatic revocation.
Verify owner isolation, current-session protection, expiry filtering, bounded
results, cross-origin rejection, and actual second-browser-session revocation.
