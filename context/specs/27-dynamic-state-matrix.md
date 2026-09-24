# Dynamic Feature State Matrix

## Outcome

No dynamic Forge surface leaves a learner with an unexplained blank panel.
Loading, empty, error, retry, and appropriate offline behavior are explicit and
enforced as part of the production quality gate.

## Coverage

The typed matrix in `src/domain/dynamicFeatureStates.ts` covers:

- cloud accounts and onboarding;
- cross-device progress and conflict resolution;
- workspace persistence, execution, AI, and snapshots;
- private/public portfolios and certificates;
- search, reviewed resources, notifications, and lesson media;
- practice, reviews, notes, labs, and analytics.

Synchronous/local-first or browser-native behavior is identified explicitly
rather than represented as a fake loading state. Offline is marked not
applicable only where the feature already runs locally without a network.

## Public portfolio hardening

Public profiles use a finite state model: loading, ready, unavailable/private,
offline, or temporary error. Temporary and offline failures expose a retry;
404 stays a privacy-preserving unavailable state. Requests ignore late results
after unmount or username changes.

## Verification

Vitest enforces unique matrix entries, evidence for all five state decisions,
and visible failure/retry/offline behavior for every remote feature. Component
tests prove public 404 handling and recovery from a temporary server failure.
