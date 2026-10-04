# Gmail account email operations

## Release status — October 4, 2026

Implementation and additive migration 0012 are deployed. Local verification and
reset pass through the real Worker/browser; 178 automated tests, lint, production
build and bundle budgets pass. The real one-message production submission failed
with `MAIL_UNAVAILABLE`. A subsequent configuration-only check found a valid
app-password format, not valid Google authorization. Both exact synthetic
principals were removed. No automatic mail retry or inbox receipt is claimed.
The integration remains pending Google authorization/transport investigation and
successful delivery plus human inbox/link acceptance. Review Google app-password
authorization in the account dashboard, never paste the credential into chat.

The Worker sends fixed verification/reset templates through TLS Gmail SMTP on
port 465 as `zerotoaiforge@gmail.com`. Only `GMAIL_APP_PASSWORD` is a secret;
never copy it into chat, source files, logs or browser configuration. Google
app-password authorization can be revoked; SMTP acceptance is not inbox receipt.
No paid mail service is enabled. The app caps attempted sends at 100/day and
three per account/purpose/hour; provider limits can be lower.

Existing users sign in, open learner Settings and select Send verification
email. New registration attempts a verification email but still succeeds if
mail fails. Open the message link and explicitly confirm verification. Only
verified inboxes can request an email password reset from Sign in. Reset links
expire after 30 minutes; verification links after 24 hours. Both are single-use.
Reset signs out every existing session and displays a fresh recovery code to
save privately. Saved recovery-code recovery remains available without email.

Anonymous requests return identical content whether the address is unknown,
unverified or mail fails. Background submission avoids revealing SMTP latency;
the UI does not guarantee that mail was sent. Authenticated resends report only
provider acceptance or a generic unavailable error, not SMTP replies. All links
use fragments; confirmation is POST-only, preventing scanner GET consumption.

## Verification

`node scripts/email-smoke.mjs` targets localhost only, seeds hashed tokens into
local D1 and removes exact synthetic accounts. It checks real Worker/browser
verification/reset behavior, not SMTP or inbox delivery. Unit tests separately
exercise scripted SMTP acceptance/rejection/TLS/header injection/deadline and
database replay/expiry/concurrent consumption/atomic resets/cascade/quotas.

`node scripts/email-provider-check.mjs --send-one-to-owned-mailbox` is an
explicit operator-only one-message production probe. It creates a unique
synthetic principal and hashed session, addresses only a generated tag of the
owner's configured Gmail inbox, calls authenticated resend and removes that
exact principal in finally. It does not read credentials, impersonate an
existing learner, bypass application Turnstile, or retry an ambiguous send.
Its diagnostic link intentionally becomes inactive after cleanup. Provider
acceptance still requires the owner to confirm actual inbox receipt.

`--check-config-only` on the same operator script instead reads only the
authenticated configuration boolean, never connects to SMTP or sends mail.
It validates the normalized 16-character app-password format without returning
the value. Structural validity does not prove Google accepts authorization.
Mail failures log only fixed allowlisted stage codes, never raw SMTP responses.

Before any future additive production migration, record a fresh D1 Time Travel
bookmark. Do not export private learner rows or restore production without an
incident-specific decision. Keep migrations even if rolling back Worker code.
If SMTP fails, verify Google app-password authorization and the Worker secret
through the dashboards; never print the value. Request a new verification link
only after fixing delivery. No automatic retry after an ambiguous submission.
