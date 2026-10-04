# Gmail account verification and recovery

Use only the configured server-side Gmail app password and fixed authenticated
TLS SMTP submission to smtp.gmail.com:465. No paid provider, plaintext downgrade,
arbitrary SMTP relay, private message logging or secret retrieval. Messages use
fixed subjects/content and canonical Forge links; recipient/header injection is
rejected. Bound reply buffers and total connection time; no automatic retry
after ambiguous delivery. SMTP acceptance is not inbox receipt.

Add hashed, expiring, purpose-bound single-use email tokens through additive
migration 0012. Fragment links keep raw tokens out of request URLs/logs. Explicit
POST confirmation prevents email scanners consuming links. Atomic token consume
and database triggers update email verification, or reset password/revoke all
sessions and old recovery codes/issue a fresh hashed fallback code. Test expiry,
replay, concurrent consumption, purpose mismatch and cascade deletion.

Registration attempts verification when configured but mail failure must not
discard a successful account. Existing users are not silently marked verified
or blocked from saved work. Authenticated status/resend supports existing users.
Anonymous reset requests require Turnstile, quotas and uniform responses for
unknown/known/unverified accounts; only verified accounts receive reset links.
Per-IP/account throttles plus an atomic app-wide daily SMTP cap control abuse.
No raw tokens returned by APIs or stored in D1. No third-party recovery-page
scripts beyond the existing challenge; no localStorage token/password storage.

Keep recovery-code login/recovery and local learning working. UI distinguishes
pending, verified, SMTP-accepted and unavailable; reset rotates the fallback code
and asks the user to sign in again. Automated fake SMTP/inbox tests are local
only, never a production bypass. Apply migration only after a fresh Time Travel
bookmark, then deploy and verify provider acceptance and user inbox/link flows.
If live Gmail rejects access, report it honestly; do not claim delivery.
