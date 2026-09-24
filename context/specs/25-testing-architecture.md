# Focused Testing Architecture

## Outcome

Forge enforces every testing category named in the Forge 2.0 brief through one
repeatable production quality gate.

## Coverage layers

- Node tests cover pure domains, runner boundaries, Worker HTTP/security,
  password/session behavior, D1 migrations, API versions, and OpenAPI coverage.
- Vitest + jsdom covers the Forge API repository boundary and the rendered
  application error-recovery component.
- Browser smoke covers learner navigation, persisted local learning, practice,
  notes, reviews, projects, workspace saving, and responsive layouts.
- Authenticated browser lifecycle covers signup, login, logout, onboarding and
  roadmap selection, progress synchronization, workspace/project save,
  real AI requests, certificates, recovery, and authorization/privacy denial.
- Production verification checks deployed PWA/offline behavior, security
  headers, OpenAPI, focused learning, dialogs, and mobile overflow.

## Required command

`npm test` runs Node tests, Vitest tests, ESLint, strict client and Worker
TypeScript builds, Vite production build, and enforced bundle budgets. GitHub
Actions runs this same gate for every change.

## Boundaries verified here

- Repository tests preserve same-origin credentials, JSON request shape, and
  structured API error handling.
- Component tests prove both normal rendering and an accessible recovery screen
  for a child render failure.
- Existing account and browser suites remain the integration and end-to-end
  safety net; no synthetic success is substituted for a deployed flow.
