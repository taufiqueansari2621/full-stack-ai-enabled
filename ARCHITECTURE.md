# Forge 2.0 Architecture

## Purpose

This document records the audited current system, the production target, and the incremental migration path. Forge must remain usable throughout the migration. A feature is not considered cloud-backed until its API, ownership rules, persistence, failure states, and tests are real.

## Current Architecture Audit

### Application

Forge is a React, strict-TypeScript, Vite single-page application. `src/App.tsx` owns the application shell, URL-to-workspace selection, local profile entry, and several legacy feature views. Larger newer features have already moved into focused modules such as curriculum learning, catalog lessons, resources, assessments, interview academy, example labs, mastery studio, and topic practice.

The application currently uses lightweight path routing without a routing library. Routes select one of 13 workspaces. Heavy lesson, resource, practice, and interview surfaces are lazy-loaded. Focused lesson mode deliberately removes global navigation while retaining a route back to the roadmap.

### Curriculum

The numbered Markdown directories remain the independently readable curriculum source. `src/curriculumCatalog.ts` contains the navigable phase/module/topic hierarchy, while authored lesson content and generated topic knowledge are stored separately. This separation lets navigation cover all 684 topics without claiming that each topic has identical authored depth.

### Learner State

`src/useLocalProfiles.ts` stores browser-local profiles. `src/useForgeStore.ts` is the versioned learner repository for completions, attempts, notes, projects, interviews, quizzes, certificates, mastery work, topic practice, example labs, framework choice, activity, time, and the current learning position. Components mutate data through store actions rather than writing learner records directly.

This state is useful as an offline cache and migration source, but a browser profile is not an authenticated identity and cannot synchronize across devices.

### Deployment

Forge was previously deployed as Cloudflare Workers Static Assets with SPA fallback and no server entry point. Forge 2.0 introduces a Worker entry point while retaining the same asset binding and fallback. Requests under `/api/` are handled by the Worker; all other requests are served by the existing Vite build.

### Verification

The repository has ESLint, strict TypeScript builds, a production Vite build, a Puppeteer smoke suite, responsive viewport checks, focused-lesson assertions, and live deployment verification. Component, repository, and API test coverage must be added incrementally.

### Technical Debt

- `src/App.tsx` remains oversized and should be decomposed one feature at a time.
- Browser-only profiles and state are not authoritative or cross-device.
- There is no conflict-aware sync client yet.
- Several curriculum topics use generated structured lessons rather than fully authored topic-specific material.
- The code runner, project workspace, AI gateway, DSA lab, system-design canvas, SQL lab, and RAG lab require isolated implementations; they must not be represented by empty screens.
- Authentication rate limiting, recovery email, OAuth, and account verification require a later security unit.

## Target Architecture

```text
Browser / installed PWA
├── React application shell
├── Feature modules and route-level chunks
├── Indexed/local cache and pending mutation queue
├── Safe browser runners (HTML/CSS/limited JS)
└── Typed API client
          │ HTTPS, secure session cookie
Cloudflare Worker
├── API router and validation
├── Authentication and authorization
├── Learning/progress services
├── AI provider boundary
├── Storage repositories
└── Static asset fallback
     ├── D1: accounts, learning records, metadata
     ├── R2: larger workspace/project artifacts (when justified)
     ├── KV: safe derived cache/rate-limit state (when justified)
     └── Dedicated sandbox service: untrusted server-side code (future)
```

Cloudflare products are added only when their operational purpose is demonstrated. The first production foundation uses Workers, Static Assets, and D1. R2 becomes justified when workspace artifacts outgrow transactional records. KV becomes justified for distributed throttling or derived public content. Durable Objects and Queues are deferred until coordination or asynchronous workloads require them.

## First Implemented Cloud Unit

The Worker now exposes:

| Endpoint                  | Purpose                                        | Authentication    |
| ------------------------- | ---------------------------------------------- | ----------------- |
| `GET /api/health`         | Verify Worker and D1 connectivity              | Public            |
| `POST /api/auth/register` | Create an account, profile, and session        | Public            |
| `POST /api/auth/login`    | Verify credentials and create a session        | Public            |
| `POST /api/auth/logout`   | Revoke the current session                     | Cookie if present |
| `GET /api/me`             | Return the authenticated account               | Required          |
| `GET /api/progress`       | Read the user's cloud progress snapshot        | Required          |
| `PUT /api/progress`       | Save progress with revision conflict detection | Required          |

This API is intentionally not wired into the current UI yet. The existing local experience remains authoritative until registration, login, import consent, offline behavior, and conflict handling form one tested vertical slice.

Production registration is explicitly closed until rate limiting, abuse protection, recovery, and the account UI ship together. The endpoint is fully exercised against local D1 and can later be enabled with a Worker environment value.

## Database Design

Migration `0001_accounts_and_progress.sql` creates only the tables justified by the first cloud unit:

- `users` — email and password verifier data.
- `profiles` — public-facing name, unique username, and future onboarding preferences.
- `sessions` — hashed opaque session tokens, expiry, and revocation.
- `progress_snapshots` — bounded versioned state with optimistic revision control.
- `activity_events` — privacy-conscious learning events for later recommendations and analytics.

Foreign keys enforce ownership. User deletion cascades to private records. Emails and usernames are case-insensitively unique. Large project files do not belong in D1 and will use R2 when that unit is built.

The progress snapshot is a deliberate migration bridge, not the final normalized mastery model. It allows safe cross-device synchronization of the existing typed state before individual attempts, review schedules, notes, and evidence are normalized into dedicated tables.

## API Design Rules

- JSON responses use consistent `{ error: { code, message } }` failures.
- Request bodies have explicit size limits and structural validation.
- Authentication comes from a server-verified session cookie, never a client user ID.
- Ownership comes from the authenticated user on the Worker.
- State-changing calls reject cross-origin browser requests.
- Progress writes use optimistic revisions; conflicting devices receive `409 REVISION_CONFLICT` instead of silently overwriting data.
- API responses containing learner data use `Cache-Control: no-store`.
- Static routes continue through the asset binding and SPA fallback.

## Authentication and Security Boundaries

- Passwords are derived with Web Crypto PBKDF2-SHA-256, a unique random salt, and 210,000 iterations. Plaintext passwords are never stored.
- Sessions use high-entropy random tokens. Only SHA-256 token hashes are stored in D1.
- Production cookies use `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, and the `__Host-` prefix.
- Cross-origin state-changing API requests are rejected using the browser `Origin` header.
- Global responses set clickjacking, MIME-sniffing, referrer, and browser-permission protections.
- Progress payloads are capped at 512 KB and must match the current Forge state version.
- Password reset, verified email, OAuth, distributed rate limiting, session-device management, and stronger bot protection are required before open public registration is promoted.
- The client may never submit authoritative mastery, certificates, ownership, or assessment eligibility without server verification.

## AI Architecture

UI features will call a typed Forge AI service, never a model SDK. The Worker gateway will own provider selection, credentials, prompt versions, consented context selection, structured-output validation, quotas, timeouts, retries, cost telemetry, and safety rules.

The client must preview which lesson, file, error, or project context will be sent. Unrelated files and notes are excluded by default. AI may propose hints or evidence, but deterministic domain services decide persisted progress and eligibility.

The teaching policy escalates through guiding question, concept hint, likely problem location, pseudocode, and partial implementation. A full solution requires deliberate learner action.

## Code-Runner Architecture

```text
CodeRunner interface
├── BrowserPreviewRunner: isolated HTML/CSS preview
├── BrowserWorkerRunner: constrained dependency-free JS/TS exercises
└── RemoteSandboxRunner: future dedicated isolated service
```

Learner code never runs in the Forge UI thread or primary API Worker. Browser execution requires an isolated Worker or sandboxed iframe, strict message validation, time and output limits, and reset/termination controls. Python, Node, package installation, and framework builds require a separate sandbox with CPU, memory, filesystem, network, dependency, and wall-time limits.

## Local-to-Cloud Migration

1. Preserve the current versioned local repository.
2. Add real registration/login UI against the Worker.
3. After authentication, explicitly offer **Import my existing Forge progress**.
4. Validate local state before upload and show the destination account.
5. Save with progress revision `0`; never import silently.
6. Retain the local state as an offline cache after successful import.
7. Record server revision and update it after every debounced save.
8. On conflict, fetch both versions and offer a deterministic merge or user choice; never last-write-wins silently.
9. Once sync is proven, make the cloud record authoritative for authenticated users.

## Incremental Delivery Plan

1. **Foundation** — audit, architecture, Worker router, D1 migration, account/session primitives, progress snapshot API.
2. **Account experience** — auth UI, verified email/recovery plan, profile settings, protected client state, accessibility and browser tests.
3. **Sync vertical slice** — explicit import, debounced saves, revisions, offline queue, cross-device and conflict tests.
4. **Onboarding** — goals, experience, framework, schedule, diagnostic assessment, personalized starting point.
5. **Workspace** — file model, autosave, browser-safe JS/TS runner, tests, export; then project workspaces.
6. **Forge AI** — provider-independent gateway, explicit context consent, teaching modes, limits, observability.
7. **Learning records** — normalize practice, review, mastery, interviews, and evidence as scale requires.
8. **Advanced labs** — DSA, SQL, system design, and AI/RAG as complete usable vertical slices.
9. **Portfolio and certificates** — opt-in publication and server-verified evidence.
10. **Production hardening** — recovery, OAuth, Turnstile/rate limits, security review, performance, accessibility, operational alerts.

Each unit must pass TypeScript, lint, relevant tests, build, responsive checks, and authorization tests before deployment. Production migration is applied before the Worker code that depends on it, and existing static routes are rechecked after every Worker deployment.
