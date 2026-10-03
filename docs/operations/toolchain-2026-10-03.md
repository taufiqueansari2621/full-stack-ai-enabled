# Toolchain security verification — October 3, 2026

The full npm audit previously reported four dependency findings affecting
brace-expansion and the Wrangler/Miniflare/Undici dependency chain. A narrowly
scoped update now pins Wrangler 4.147.0, Miniflare 5.20261001.0-alpha,
Undici 7.29.1 and brace-expansion 5.0.12 in the lockfile. No application runtime
dependency or broad `npm audit fix` was used. Full `npm audit`: zero findings.

Verification after the update: 21 Node + 91 Vitest tests, lint, strict production
builds and bundle budgets pass. Wrangler's deploy dry run bundles the production
Worker successfully. A restarted local Worker with an empty site-key override
passes real two-context account/session revocation and mock-client Turnstile
browser regression at four widths. The old dev process failed while its package
files were being replaced; it was stopped and the new runtime started cleanly.

No production data, migration, paid service or production deployment was changed
by this toolchain-only unit. The live application remains the verified October 3
security version `eeab0d3c-bb95-4c39-ac1f-f870e526b5cd`.

Maintainer release references:
[Wrangler 4.147.0](https://github.com/cloudflare/workers-sdk/releases/tag/wrangler%404.147.0)
and [brace-expansion 5.0.12](https://github.com/juliangruber/brace-expansion/releases/tag/v5.0.12).
