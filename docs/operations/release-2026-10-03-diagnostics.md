# Public test feedback — October 3, 2026

Worker: `forge-ai-engineering`.
Final version: `b057958b-3d8d-40ca-9619-5b5c0dca7a99`.
Prior security release: `eeab0d3c-bb95-4c39-ac1f-f870e526b5cd`.
An initial diagnostics deployment (`eeabf98b-9e1c-448b-a500-b34b24fbdc20`)
was followed by the versioned-runner fix before handoff.

The three public sum-exercise cases now expose individual pass/fail/not-run
status, input, expected/actual and bounded error details for JS and standalone
TS. Counts derive from validated cases. Syntax, startup, malformed message and
deadline failures no longer pretend tests ran. Unsupported backend languages
retain their unavailable state, and unrelated output no longer claims "9" was
expected. Returning PWA clients use `runner-worker.js?protocol=2` to avoid an
incompatible pre-release runner in the stale-while-revalidate asset cache.

Local gates: 27 Node + 91 Vitest tests, lint, strict builds and bundle budgets
pass. Full responsive learning regression passes. The dedicated browser suite
exercises partial/correct answers, thrown/missing functions, syntax errors,
forged messages, timeout/recovery and four widths. It deliberately seeds an old
runner at the unversioned cached URL and still passes with the new protocol.
The built-runtime editor suite verifies TypeScript execution/error recovery,
formatting/file operations, explanations, notes and four widths. Earlier
development attempts timed out; button-label/lazy-mount waits were corrected
and the production-style checks passed, rather than ignoring failed runs.

Live diagnostic, production public/PWA/security and managed Turnstile
rendering/missing-token checks pass against the final version. Runtime dependency
audit is clean. No migration, learner-data export, new service, inference call
or paid plan was used. Source and curriculum Markdown are preserved.

## Not yet complete

- Public browser tests are inspectable and tamperable. This is not a private,
  server-authoritative multi-language judge. A separate approved execution host
  and its access/package/network limits are still needed. The user was asked
  whether an existing free host is available. No paid sandbox was enabled.
- Optional GitHub/Google login still needs app registration/client credentials
  and implementation; connected repository access is not an OAuth app client.
- Email ownership/recovery still needs a verified sender and a configured mail
  transport. The user previously deferred purchasing/adding the sender domain.
- The audit also retains operational field-vitals and an operator-approved
  restore drill; no production restore was attempted as an automated test.

Follow-up: the user subsequently reported the instructed manual browser
security-check/account test "succeeds". This acceptance step is no longer
outstanding; it remains user-reported, separate from automated coverage.

Current platform constraints were checked against primary documentation:
[Cloudflare Dynamic Workers pricing](https://developers.cloudflare.com/dynamic-workers/pricing/)
requires a paid plan for its dynamic execution option, which is not authorized
under the user's free-only constraint. This does not mean every possible
external execution host is paid.
[Cloudflare Email Service](https://developers.cloudflare.com/email-service/)
distinguishes paid public sending from free sending to account-verified
destinations; the latter is not arbitrary-user verification mail.
[GitHub app registration](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)
is separate from repository access. Never put client/mail/host secrets in chat
or committed source; configure them through the relevant secret manager.

The overall Forge target stays partial. A same-day request does not remove
these setup requirements or authorize paid upgrades.
