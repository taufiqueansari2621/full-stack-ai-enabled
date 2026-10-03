# Architecture Context

## Current Architecture

The local retrieval tutor builds a lightweight index from the curriculum catalog and learner knowledge entries tagged `AI Tutor Source`. Added sources reuse the learner-scoped Forge store, persist locally, and are removed by profile reset. Responses include source labels, while the response composer can later be replaced by a hosted open-weight model endpoint.

The application shell owns optional global navigation and Fullscreen API controls during focused learning. Course-topic visibility remains local to each lesson. `RoadmapPage` renders one curriculum model as cards or an interactive flow, avoiding duplicated curriculum state.

Forge is currently a local-first single-page application. The MVP deliberately uses seeded domain data so product flows and information architecture can be validated before committing to authentication, backend, database, or AI-provider choices.

```text
Browser
├── React application shell
├── Feature views
├── Typed curriculum/demo data
├── UI state
└── localStorage preferences

Future boundaries
├── Learning API
├── Assessment/mastery service
├── Review scheduler
├── AI mentor gateway
├── Code execution sandbox
└── PostgreSQL + object storage
```

## Stack

| Layer               | Technology                        | Role                                                                   |
| ------------------- | --------------------------------- | ---------------------------------------------------------------------- |
| Language            | TypeScript, strict mode           | Domain and UI type safety                                              |
| UI runtime          | React                             | Component rendering and interaction                                    |
| Build tool          | Vite                              | Local development and production bundling                              |
| Production hosting  | Cloudflare Workers Static Assets  | Global asset delivery with SPA route fallback                          |
| Styling             | Tokenized plain CSS               | Visual system, responsive layout, animation                            |
| Icons               | Lucide React                      | Consistent stroke-based interface icons                                |
| Current data        | Typed objects in `src/data.ts`    | Representative curriculum and progress data                            |
| Current persistence | Versioned `localStorage` adapters | Local profiles, learner-scoped progress, and non-sensitive preferences |
| Quality             | TypeScript and ESLint             | Static verification                                                    |
| Curriculum          | Markdown directories `00_`–`14_`  | Human-readable roadmap source material                                 |

The application catalog in `src/curriculumCatalog.ts` owns navigable phase/module/topic metadata. Detailed lesson records remain separate in `src/curriculum.ts`, allowing the full hierarchy to exist before each lesson is populated without presenting outline-only topics as finished content.

Frontend modules carry a `common`, `react`, or `angular` track. The learner's
profile-scoped framework preference selects visible modules and progress
denominators without deleting evidence from a previously studied track.

Official and trusted learning links are typed curriculum data. The large
resource catalog, topic resource panels, Full Learning lesson, and topic-drill
engine are lazy-loaded feature chunks so research breadth does not inflate the
initial application bundle. Exact topic matches may replace broad phase links;
the npm lesson, for example, uses current first-party npm dependency, clean
install, and security guidance. External resource visits never mutate progress.

Lesson entry activates an ephemeral focused-shell state. Authored lessons use
the active `/learn` workspace and catalog lessons report their open/close state
to the application shell. Both paths remove global navigation chrome, retain a
lesson-owned Back action, and expose only course-topic navigation. This state is
presentational and never changes progress or mastery evidence.

Forge 2.0 introduces a Worker entry point while preserving the Vite asset
binding and `single-page-application` fallback. `/api/*` requests are handled by
the Worker and all other requests retain the existing static application
behavior. The first cloud unit uses D1 for accounts, hashed sessions, profiles,
and revision-controlled progress snapshots. The authenticated UI and explicit
local-to-cloud import remain a later verified unit, so the current local learner
experience is not silently replaced. See the root `ARCHITECTURE.md` for the
audited target architecture and migration plan.

## Intended Source Boundaries

The MVP started compactly. New feature work should move toward these boundaries:

- `src/app/` — application shell, routing, providers, global error boundary.
- `src/features/<feature>/` — feature-specific views, state, domain logic, and tests.
- `src/components/ui/` — reusable presentation primitives with no learning-domain logic.
- `src/domain/` — shared entities, mastery rules, review scheduling, and validation.
- `src/data/` — repositories and adapters for local, HTTP, or imported Markdown data.
- `src/styles/` — tokens, reset, shared patterns, and feature styles.
- `context/` — durable product and engineering decisions.
- numbered roadmap directories — curriculum content; they do not own application behavior.

Do not perform a large mechanical reorganization. Move code into these boundaries one verified feature at a time.

## State Model

Separate state by lifetime:

- **Ephemeral UI state:** active tab, open panel, selected filter, modal state.
- **Session learning state:** current attempt, answers, timer, hint level.
- **Durable learner state:** completions, interactive example records, mastery artifacts, topic-practice artifacts, attempts, review schedule, notes, mistakes.
- **Server-authoritative state:** identity, synced progress, AI usage, project artifacts; introduced later.

Interactive example records are unique per learner, lesson, and case. Saving a
first normal, unusual, or failure case records the learner's prediction and
reflection, but does not mark the topic complete or claim mastery.

Gamification is a derived projection over raw learner evidence. The stored
legacy XP field remains readable for migration compatibility, but current XP,
levels, badge unlocks, and milestones are calculated by the pure gamification
domain from unique evidence keys. Navigation and repeated submissions never
increase the projection.

Components must not read or write browser storage directly. Storage access belongs behind a typed repository adapter, except the existing theme preference until the adapter unit is complete.

## Future Storage Model

- **PostgreSQL:** learners, topics, prerequisites, attempts, evidence, mastery snapshots, review schedule, projects, tasks, notes, and interview sessions.
- **Object storage:** project images, portfolio artifacts, recordings, imported learning documents.
- **Cache/queue:** short-lived computed recommendations, rate limits, and asynchronous evaluation jobs only when operational need exists.
- **Vector index:** learner notes or curriculum retrieval only after authorization and deletion behavior are defined.
- **Browser storage:** optimistic cache and preferences, never secrets or authoritative assessment results.

## Authentication and Access

- Cloud account registration, login, and recovery require managed Turnstile
  verification on the configured production hostname. A public no-store config
  exposes only the site key. The secret remains a Worker secret. Siteverify has
  a ten-second deadline and checks success, exact hostname and exact action;
  missing tokens, replay/provider rejection and outages fail closed. Existing
  rate limits and session/revocation behavior remain unchanged. The SDK is only
  loaded on account forms, tokens are renewed after every attempt, and local
  learning remains independent. Unconfigured local development can override
  `TURNSTILE_SITE_KEY` to empty; production never uses test keys or bypasses.

- The free-only session-management unit reuses the sessions table. Owner-scoped
  bounded reads expose dates and current-session status, never tokens or hashes.
  Same-origin revocations exclude the current token in SQL and invalidate future
  requests. No device fingerprint, geolocation, provider, or new service is added.

- The current MVP has explicit Local Learning Profiles for same-browser separation. They are not authentication and are presented as local-only profiles.
- When accounts are introduced, the server—not the browser—establishes learner identity.
- Every read and mutation derives ownership from the authenticated principal.
- AI retrieval and personal knowledge queries apply authorization before content reaches the model.
- Public portfolio output is an explicit published projection, not direct access to private project data.

## AI Model Boundary

- Bounded lab inference has its own authenticated same-origin endpoint for
  plan/answer/evaluate, sharing the tutor's quota and existing fixed model.
  Model decisions are schema-validated before the client can invoke one
  read-only source search; no model can name executable code or a network tool.
  Claim evaluation checks exact quote presence separately from model judgments.
  Only usage metadata is persisted by this endpoint; no source or claim text.

- AI lab learned embeddings use a bounded authenticated endpoint with the same
  hourly AI quota and metadata-only usage records as tutoring. Source passages
  are explicitly entered and consented, not fetched from learner records. RAG
  performs exact cosine ranking over a small input batch before generation;
  no persistent vector index is required for this bounded experiment. Local
  chunking, explicit JSON tool execution, and lexical evaluation do not claim
  to be model inference or verified factual scoring.

- UI components call a typed mentor/evaluation interface, never a model SDK directly.
- The gateway owns prompt versions, structured output validation, timeouts, retries, quotas, safety policy, and observability.
- AI evaluation contributes evidence but is not treated as unquestionable truth.
- Project mentor behavior uses escalating hints and protects full solutions until requested.
- High-impact changes require deterministic authorization and explicit learner confirmation.

## Code Execution Boundary

- Free framework previews transpile bounded local modules in the existing
  disposable compiler worker, then run bundled React or Angular JIT in an
  opaque-origin iframe. Fixed framework imports and local modules/templates/CSS
  are supported; arbitrary npm installs, backend APIs, AOT/full framework
  typechecking and server-grade resource isolation are not. Preview CSP is
  restricted to its canonical document route; application script policy remains
  unchanged. Explicit Build/Stop and source-identity checks prevent stale output.
  React/Angular runtimes are separate on-demand static assets (1,352 KiB total),
  never imported by the application shell or service-worker offline precache.

- Editor suggestions and diagnostics use the TypeScript language service in the
  same disposable, on-demand compiler worker. Analysis is current-file/ES2022
  only, never executes code, and has bounded input, output, and time. Pure file
  operations enforce cloud-compatible limits, reject collisions, map open tabs
  on moves, and preserve subsequent edits during deletion undo.

- Standalone TypeScript is type-checked and emitted inside an on-demand compiler
  worker using bundled ES2022 libraries, bounded source, and a ten-second
  deadline. Only error-free scripts enter the existing JavaScript runner.
  Package modules and JSX remain outside this adapter. The 5,000 KiB compiler
  budget is separate from app navigation bundles (current compiler: 4,014 KiB).

- SQL teaching scripts execute against a fresh in-memory SQLite WASM database
  in a disposable browser worker. The worker alone allows WASM compilation;
  the application page keeps its existing script policy. A five-second deadline,
  SQLite heap/page limits, query/output bounds, cancellation, and same-origin
  runtime assets constrain execution. No learner SQL reaches D1.

- Untrusted learner code never runs in the main UI thread or application API process.
- Browser-compatible exercises use a constrained Web Worker with time and output limits.
- Multi-language or package-based execution requires a dedicated sandbox service with resource, network, and filesystem restrictions.

## Invariants

### September 2026 persistence update

The deployed account product now uses D1; the local-first MVP descriptions above
are historical. Migration 0010 adds indexed domain projections for notes,
practice attempts, review schedules, quiz/interview results, completed topics,
mastery artifacts, and project tasks. Each snapshot insert or update applies its
changed collections atomically through SQLite triggers. Existing snapshots are
preserved as the version-1 sync/rollback contract. The initial backfill does not
change revision numbers, timestamps, or learner payloads.

Progress and workspace saves use SQL compare-and-swap conditions, avoiding the
race in a separate read-then-write revision check. The editor formatter runs in
its own disposable worker with a deadline and language-specific parsers, fetched
only on explicit use. Its bundle budget is distinct from navigation bundles.

Migration 0011 adds owner-keyed project and interview-session projections with
atomic snapshot triggers. Typed read repositories expose bounded cursor pages
for projects, milestones, sessions, and answers without downloading a snapshot.
Snapshot sync remains the compatible write contract. New interview sessions use
stable identifiers; older ungrouped answers remain explicitly labelled legacy
practice records. The lazy My Progress panel never awards additional mastery.

1. A lesson-completed flag or submitted artifact alone never equals mastery.
2. UI components never calculate final mastery or review dates; domain functions own those rules.
3. External and persisted data is validated before entering trusted domain state.
4. AI output never directly mutates durable state or executes a tool without validation and authorization.
5. User code never executes in the main application process.
6. Curriculum content remains independently readable as Markdown.
7. New features provide loading, empty, error, and recovery states where data is asynchronous.
8. Accessibility, mobile behavior, lint, build, and browser runtime are release gates.
9. No secret or private learner content is stored in source control or browser-visible configuration.
