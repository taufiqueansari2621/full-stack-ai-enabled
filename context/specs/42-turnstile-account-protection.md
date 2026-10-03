# Free Turnstile account protection

Protect registration, password login and recovery with a hostname-restricted
managed Turnstile widget and mandatory server-side Siteverify checks. No paid
features. Public config returns only the site key. Store the secret as a Worker
secret, never in source, browser code, chat output or logs.

When configured, require a bounded token, verify success plus exact request
hostname/action, and enforce a ten-second deadline. Network/provider/config
failure must fail closed with safe retry messages. Keep existing rate limits.
Unconfigured local environments remain usable; never use test keys as a
production bypass. Logout/session revocation do not require a challenge.

Client supports loading, expiry, error/retry, cleanup and a fresh widget after
every submission, including wrong credentials. Block submission until ready.
Load the provider SDK only on account forms. Keep offline local learning usable.
Test provider rejection, replay failure, wrong hostname/action, oversized tokens,
provider outage, missing secret, and client state. Verify real widget rendering
and missing-token rejection in production; human challenge completion may be
needed and must not be replaced by a fake passing token.
