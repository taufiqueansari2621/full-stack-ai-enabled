# Architecture Context

## Current Architecture

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

| Layer | Technology | Role |
|---|---|---|
| Language | TypeScript, strict mode | Domain and UI type safety |
| UI runtime | React | Component rendering and interaction |
| Build tool | Vite | Local development and production bundling |
| Styling | Tokenized plain CSS | Visual system, responsive layout, animation |
| Icons | Lucide React | Consistent stroke-based interface icons |
| Current data | Typed objects in `src/data.ts` | Representative curriculum and progress data |
| Current persistence | Versioned `localStorage` adapters | Local profiles, learner-scoped progress, and non-sensitive preferences |
| Quality | TypeScript and ESLint | Static verification |
| Curriculum | Markdown directories `00_`–`14_` | Human-readable roadmap source material |

The application catalog in `src/curriculumCatalog.ts` owns navigable phase/module/topic metadata. Detailed lesson records remain separate in `src/curriculum.ts`, allowing the full hierarchy to exist before each lesson is populated without presenting outline-only topics as finished content.

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
- **Durable learner state:** completions, evidence, mastery, review schedule, notes, mistakes.
- **Server-authoritative state:** identity, synced progress, AI usage, project artifacts; introduced later.

Components must not read or write browser storage directly. Storage access belongs behind a typed repository adapter, except the existing theme preference until the adapter unit is complete.

## Future Storage Model

- **PostgreSQL:** learners, topics, prerequisites, attempts, evidence, mastery snapshots, review schedule, projects, tasks, notes, and interview sessions.
- **Object storage:** project images, portfolio artifacts, recordings, imported learning documents.
- **Cache/queue:** short-lived computed recommendations, rate limits, and asynchronous evaluation jobs only when operational need exists.
- **Vector index:** learner notes or curriculum retrieval only after authorization and deletion behavior are defined.
- **Browser storage:** optimistic cache and preferences, never secrets or authoritative assessment results.

## Authentication and Access

- The current MVP has explicit Local Learning Profiles for same-browser separation. They are not authentication and are presented as local-only profiles.
- When accounts are introduced, the server—not the browser—establishes learner identity.
- Every read and mutation derives ownership from the authenticated principal.
- AI retrieval and personal knowledge queries apply authorization before content reaches the model.
- Public portfolio output is an explicit published projection, not direct access to private project data.

## AI Model Boundary

- UI components call a typed mentor/evaluation interface, never a model SDK directly.
- The gateway owns prompt versions, structured output validation, timeouts, retries, quotas, safety policy, and observability.
- AI evaluation contributes evidence but is not treated as unquestionable truth.
- Project mentor behavior uses escalating hints and protects full solutions until requested.
- High-impact changes require deterministic authorization and explicit learner confirmation.

## Code Execution Boundary

- Untrusted learner code never runs in the main UI thread or application API process.
- Browser-compatible exercises use a constrained Web Worker with time and output limits.
- Multi-language or package-based execution requires a dedicated sandbox service with resource, network, and filesystem restrictions.

## Invariants

1. A lesson-completed flag alone never equals mastery.
2. UI components never calculate final mastery or review dates; domain functions own those rules.
3. External and persisted data is validated before entering trusted domain state.
4. AI output never directly mutates durable state or executes a tool without validation and authorization.
5. User code never executes in the main application process.
6. Curriculum content remains independently readable as Markdown.
7. New features provide loading, empty, error, and recovery states where data is asynchronous.
8. Accessibility, mobile behavior, lint, build, and browser runtime are release gates.
9. No secret or private learner content is stored in source control or browser-visible configuration.
