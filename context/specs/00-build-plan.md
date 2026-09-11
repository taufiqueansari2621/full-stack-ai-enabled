# Forge Build Plan

Each unit produces a visible, verifiable outcome. Write a focused spec in this directory before implementing a unit.

## Phase A — Stabilize the Prototype

### Unit 01: Application shell decomposition

- Extract shell, sidebar, top bar, shared progress primitives, and feature pages from `App.tsx`.
- Add a global error boundary with a useful recovery screen.
- Preserve all current behavior and appearance.
- Dependency: current working MVP.

### Unit 02: Learner domain and local repository

- Define learner, topic, evidence, attempt, review, project, note, and interview-session types.
- Add a versioned local repository with validation and safe defaults.
- Replace hard-coded theme access with a preferences adapter.
- Dependency: Unit 01.

### Unit 03: Routing and deep links

- Give each primary workspace and selected lesson/project a stable URL.
- Restore the correct view after reload and support browser back/forward.
- Dependency: Unit 01.

### Unit 04: Accessibility and responsive audit

- Correct tiny critical text, touch targets, landmarks, labels, reduced motion, and keyboard behavior.
- Validate mobile, tablet, laptop, and large desktop layouts.
- Dependency: Units 01–03.

## Phase B — Complete the Learning Loop

### Unit 05: Curriculum content adapter

- Convert roadmap and lesson content into typed content records.
- Map the existing Markdown curriculum to stable topic IDs and prerequisites.
- Provide empty/error diagnostics for invalid content.
- Dependency: Unit 02.

### Unit 06: Lesson player

- Implement all 17 lesson blocks from concept introduction through mastery assessment.
- Persist learner position, notes, and lesson evidence.
- Dependency: Units 02 and 05.

### Unit 07: Practice engine

- Implement quick, prediction, debugging, coding, explanation, and real-world challenges.
- Record attempts, hint usage, correctness, confidence, and elapsed time.
- Dependency: Units 02 and 05.

### Unit 08: Mastery engine

- Calculate topic mastery from understanding, recall, implementation, project usage, and interviews.
- Explain score changes and prevent single activities from dominating the score.
- Dependency: Units 02, 06, and 07.

### Unit 09: Review scheduler

- Generate daily review queues from memory strength, failure history, prerequisites, and upcoming projects.
- Support skip, snooze, completion, and reschedule behavior.
- Dependency: Unit 08.

## Phase C — Projects and Knowledge

### Unit 10: Project workspace

- Add project overview, milestones, Kanban tasks, architecture, testing, deployment, and decision log views.
- Persist project and task progress locally.
- Dependency: Unit 02.

### Unit 11: Personal knowledge base

- Add notes, flashcards, bookmarks, snippets, decisions, and a mistake journal.
- Connect every entry to topics, projects, and review scheduling.
- Dependency: Units 02 and 09.

### Unit 12: Portfolio report

- Turn completed showcase-project evidence into an editable case study and interview question set.
- Dependency: Units 10 and 11.

## Phase D — Interview Readiness

### Unit 13: Interview session engine

- Implement configurable technical, coding, system-design, behavioral, and project sessions.
- Store responses, rubric scores, feedback, and review recommendations.
- Dependency: Units 02, 07, and 08.

### Unit 14: Career readiness dashboard

- Replace illustrative scores with explainable values from real learning evidence.
- Show gaps, confidence, recent trend, and specific next actions.
- Dependency: Units 08, 10, 12, and 13.

## Phase E — Safe Execution and AI

### Unit 15: Browser code playground

- Add an editor and constrained JavaScript/TypeScript execution worker.
- Enforce execution timeout, output size, reset, and deterministic tests.
- Dependency: Unit 07.

### Unit 16: AI provider boundary

- Define streaming tutor, hint, explanation-evaluation, and interview-evaluation contracts.
- Add structured output validation, cancellation, fallback, and local mock adapter.
- Dependency: Units 06, 07, and 13.

### Unit 17: Mentor experience

- Build context-aware coaching with progressive hints and explicit reveal controls.
- Show what learner context is sent and allow session reset.
- Dependency: Unit 16.

## Phase F — Accounts and Production

### Unit 18: Server API and authentication

- Add authenticated account sync behind the existing repository interface.
- Migrate local state safely and preserve offline recovery.
- Dependency: validated local-first product and explicit provider decision.

### Unit 19: Observability and evaluation

- Add product funnel, reliability, AI quality, latency, cost, and safety measurement.
- Provide privacy-respecting consent and retention behavior.
- Dependency: Units 16–18.

### Unit 20: Production release

- Add CI tests, deployment, security headers, environment validation, backup/restore, incident runbook, and release checklist.
- Dependency: all release-critical units.

## Definition of Done for Every Unit

- [ ] The user-visible outcome works end to end.
- [ ] Loading, empty, error, and recovery behavior is covered where relevant.
- [ ] Keyboard and responsive behavior is verified.
- [ ] No browser console errors or React warnings.
- [ ] Relevant tests pass.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] Context and progress documentation are synchronized.

