# Curriculum Depth Audit — September 2026

## Standard

The curriculum is evaluated against a zero-to-professional learning loop:

```text
Learn → Understand → Visualize → Code → Practice → Debug → Build
      → Test → Deploy → Scale → Design → Interview → Assess → Certify
```

Course completion is not treated as equivalent to years of professional
experience. Senior, staff, and principal material exposes learners to the
decisions, failure modes, migrations, trade-offs, and communication expected at
those levels; only real practice and work experience can build equivalent
judgment.

## Findings Before This Unit

- Frontend Engineering had 23 topics and was effectively React-only.
- Angular curriculum existed as Markdown but was absent from the app catalog.
- Framework choice was not stored and progress implicitly required one fixed path.
- Data Structures & Algorithms existed in repository content but had no roadmap phase.
- Backend, system design, Python/AI, DevOps, cloud, production incidents, and
  senior architecture were represented but too compressed.
- Unauthored catalog topics received only a short generic introduction,
  application prompt, and professional prompt.

## Implemented Curriculum

The navigable catalog now contains 17 phases, 98 modules, and 684 topics.

### Frontend Engineering

- 39 shared frontend-platform topics covering browser behavior, HTTP, APIs,
  TypeScript, accessible UI, testing, security, performance, architecture,
  observability, delivery, and rollback.
- 67 React topics covering fundamentals, hooks, state, application development,
  testing, debugging, internals, advanced patterns, Next.js, projects, incidents,
  interviews, and capstone assessment.
- 94 Angular topics covering standalone components, templates, directives,
  pipes, dependency injection, RxJS, Signals, routing, forms, HTTP,
  authentication, guards, interceptors, state, NgRx, testing, debugging,
  change detection, performance, SSR/hydration, enterprise architecture,
  production delivery, projects, incidents, interviews, and assessment.
- A persisted React / Angular / Both decision controls visible curriculum and
  progress calculations. Shared foundations remain required for every option.

The Angular structure was checked against current official documentation for
standalone components, Signals, dependency injection, routing, forms, SSR,
security, accessibility, CLI tooling, and DevTools. The React/Next.js path was
checked against current React learning guidance and the Next.js App Router and
production guidance.

### Whole-platform expansion

- Added a complete DSA roadmap from complexity through graphs, dynamic
  programming, professional reasoning, and mock interviews.
- Expanded backend internals, NoSQL/data systems, architecture patterns,
  projects, and production incidents.
- Expanded distributed systems, reliability/security architecture, technical
  RFCs, platform engineering, migrations, governance, and global-system cases.
- Expanded advanced Python, math/statistics, data engineering, ML production,
  model incidents, NLP, computer vision, and deep-learning production.
- Expanded Kubernetes, cloud architecture, infrastructure as code, SRE, and
  incident-response laboratories.
- Added React, Angular, frontend architecture, backend debugging, cloud,
  production incident, staff, and principal interview tracks.
- Expanded the default Full Learning Mode for every catalog topic with mental
  model, guided implementation, application, debugging, testing, performance,
  security, professional practice, and multi-level interview reasoning.

## Remaining Content Work

Breadth and learning structure are now much stronger, but a catalog title plus
a shared teaching framework is not the same as authoritative authored course
material. Topic-specific definitions, examples, exercises, assessment banks,
and project artifacts should continue to be authored and reviewed phase by
phase. Safe executable code labs and a real AI tutor also require dedicated
sandbox and provider boundaries rather than simulated controls.

Recommended authoring order:

1. Shared frontend foundation.
2. Angular Foundations, React Foundations, and framework comparison guidance.
3. Framework application projects, testing, performance, and incident labs.
4. DSA assessment banks.
5. Backend and distributed-system incident cases.
6. AI evaluation, security, MLOps, and capstone evidence.

## Primary Technical References

- [Angular official overview](https://angular.dev/overview)
- [Angular Signals](https://angular.dev/guide/signals)
- [Angular dependency injection](https://angular.dev/guide/di)
- [Angular routing](https://angular.dev/guide/routing)
- [React Learn](https://react.dev/learn)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js production checklist](https://nextjs.org/docs/app/guides/production-checklist)

