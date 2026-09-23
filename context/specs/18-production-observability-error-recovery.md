# Production Observability and Error Recovery

## Outcome

Make Forge failures visible to operators and recoverable for learners without
recording private learning content or exposing internal errors.

## Acceptance Criteria

1. A top-level React error boundary replaces a crashed application tree with a
   clear recovery screen and reload action.
2. Every Worker response includes a correlation request ID and baseline
   security headers.
3. API telemetry records only route templates, method, status, duration,
   authentication presence, and request ID—never request bodies, email
   addresses, usernames, tokens, prompts, notes, or learner answers.
4. Failed authentication, AI failures, slow API routes, and unhandled Worker
   failures emit structured operational events.
5. Health responses report D1 connectivity and measured database latency.
6. Cloudflare persisted logs/traces are explicitly configured with query-string
   redaction.
7. Production verification checks health, correlation, security headers, and
   the existing browser/account workflows.

The application CSP does not permit dynamic evaluation. Forge's constrained
JavaScript runner lives in a dedicated external Worker resource with its own
minimal CSP. Only that response permits dynamic compilation; it disables
network capabilities and remains subject to parent-enforced time and output
limits. Package or multi-language execution still requires a separate sandbox
service.
