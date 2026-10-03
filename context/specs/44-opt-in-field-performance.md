# Opt-in field performance monitoring

## Outcome

Settings offers optional, browser-local sharing of real LCP, CLS and INP
measurements with Forge's existing Cloudflare Worker. Default is off. Enabling
requires reload; disabling immediately prevents further sends and aborts pending
requests. No learner work, identity, SDK identifiers, DOM attribution, raw URL,
query, or fragment enters a metric payload. No third-party analytics service.

## Boundaries

- A versioned preference repository owns consent; storage failures fail closed.
- A once-per-document bootstrap dynamically imports the standard web-vitals
  library only for pre-existing consent. No experimental SPA navigation metrics.
- Send the first reported snapshot per metric ID, including new BFCache IDs,
  bounded to 30 sends per document. Missing INP is not fabricated. These are
  opt-in diagnostic samples, not authoritative full-visit or population p75.
- Capture only initial coarse route and viewport category; never account IDs.
- Credential-free, no-referrer same-origin POST; best effort, five-second
  deadline, no retries or offline queue. Opt-out latches until next reload.
- Collector requires exact Origin, JSON, consent, a strict bounded schema and
  existing IP-hash rate limiting (60/hour). It logs allowlisted, client-reported
  measurements only; no metric table or learner-data migration.
- Provider request metadata and the existing hashed-IP quota still exist;
  do not promise absolute anonymity. Existing Workers Free log limits apply.

## Acceptance

Consent, payload sanitation, cutoff, malformed requests, rating boundaries and
quota behavior have automated tests. A real production-style browser exercises
off → enable → reload → real metric → disable, keyboard/mobile layout and clean
console. Lint, build, security audit and bundle budgets pass. Operations docs
explain log filtering and the limits of this sample. Commit/push/deploy only
after verification; verify the deployed collector and browser flow.
