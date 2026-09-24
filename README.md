# Full-Stack AI-Enabled Engineer

> A practical, project-first roadmap to become a production-ready full-stack engineer who can design, build, evaluate, secure, and explain AI-enabled products.

This repository is not a list of tutorials. It is a **52-week engineering system** that combines frontend, backend, databases, system design, AI engineering, DSA, portfolio work, and interview preparation.

## Interactive platform

The repository now includes **Forge**, a responsive React and TypeScript learning workspace that turns the roadmap into an interactive experience.

```bash
npm install
npm run dev
```

Create an optimized production build with `npm run build`, run the unit, lint,
build, and bundle-budget quality gate with `npm test`, or validate the key
learner journeys with `npm run test:smoke`. Forge includes the learning dashboard, visual roadmap,
multi-level lesson experience, event-loop visualizer, project workshop, smart
review queue, interview simulator, progress views, and a transparent local
mentor workspace. Progress, notes, attempts, milestones, review completion, and
theme preferences persist in browser local storage, so learners can practice
and track progress without an account.

Development is guided by the project-specific [Six-File Product Context](context/README.md), including product scope, architecture, UI language, code standards, workflow rules, current progress, and the ordered [build plan](context/specs/00-build-plan.md).

The production Worker publishes its stable v1 contract at
[`/api/v1/openapi.json`](https://forge-ai-engineering.taufiqueansari895.workers.dev/api/v1/openapi.json).
Release, D1 backup, restore-drill, rollback, and incident procedures are in the
[production runbook](docs/operations/production-runbook.md).

## Target outcome

By the end of the roadmap, you should be able to:

- build accessible Angular and React applications;
- design secure Node.js APIs backed by PostgreSQL, Redis, queues, and realtime transport;
- create Python ML, LLM, RAG, and tool-using agent services;
- evaluate AI quality, latency, cost, safety, and reliability;
- design and explain production systems at low and high scale;
- solve common interview patterns and communicate trade-offs clearly;
- present 3–5 deployed, tested projects with strong case studies.

## Start here

1. Read [How to use the roadmap](00_START_HERE/01_HOW_TO_USE.md).
2. Adopt the [learning and revision system](00_START_HERE/02_LEARNING_SYSTEM.md).
3. Start with [Phase 0](12_PHASES/PHASE_00_WEEKS_1_2.md).
4. Choose projects from the [project ladder](08_PROJECTS/README.md).
5. Practice with the [interview operating system](09_INTERVIEW/README.md).
6. Track each day with the [daily template](13_TRACKERS/DAILY_TEMPLATE.md).

## The 52-week roadmap

| Weeks | Focus                                      | Build outcome                              |
| ----- | ------------------------------------------ | ------------------------------------------ |
| 1–2   | Engineering setup, CS, Git/Linux, HTML/CSS | Accessible portfolio foundation            |
| 3–5   | JavaScript from fundamentals to internals  | Browser apps and JS utilities              |
| 6–7   | Advanced TypeScript                        | Typed SDK and reusable abstractions        |
| 8–12  | Angular architecture and testing           | Enterprise dashboard and IoT UI            |
| 13–16 | React architecture and performance         | Production React apps and comparison study |
| 17–21 | Node, APIs, data, security, realtime       | Multi-service backend portfolio            |
| 22–28 | DSA, low-level and high-level design       | Interview pattern mastery and designs      |
| 29–33 | Python, data, ML                           | Anomaly-detection service                  |
| 34–38 | Deep learning and LLM engineering          | AI support copilot                         |
| 39–43 | RAG and AI evaluation                      | Permission-aware knowledge copilot         |
| 44–47 | Agents, security, observability            | Engineering agent and eval platform        |
| 48–52 | Capstone and interview sprint              | Deployed industrial AI platform            |

Detailed weekly plans live in [`12_PHASES`](12_PHASES/).

## Curriculum map

| Area           | What you will learn                                     | Location                                                                        |
| -------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Foundations    | CS, Git, Linux, HTML/CSS, JavaScript, TypeScript        | [`01_FOUNDATIONS`](01_FOUNDATIONS/)                                             |
| Angular        | Core, RxJS, architecture, performance, testing          | [`02_ANGULAR`](02_ANGULAR/)                                                     |
| React          | Mental model, state, architecture, production practices | [`03_REACT`](03_REACT/)                                                         |
| Backend        | Node, API security, databases, queues, realtime         | [`04_BACKEND`](04_BACKEND/)                                                     |
| DSA            | Patterns from beginner through advanced                 | [`05_DSA`](05_DSA/)                                                             |
| System design  | Fundamentals, LLD, HLD, cloud and DevOps                | [`06_SYSTEM_DESIGN`](06_SYSTEM_DESIGN/)                                         |
| AI engineering | Python, ML, LLMs, RAG, agents, evaluation and MLOps     | [`07_AI`](07_AI/)                                                               |
| Projects       | 34 progressively harder builds                          | [`08_PROJECTS`](08_PROJECTS/)                                                   |
| Interviews     | Full-stack, AI, design, project and behavioral rounds   | [`09_INTERVIEW`](09_INTERVIEW/)                                                 |
| Career         | Positioning, resume, applications, GitHub case studies  | [`10_PRODUCT_COMPANY`](10_PRODUCT_COMPANY/) and [`11_PORTFOLIO`](11_PORTFOLIO/) |

## Project ladder

Do not try to build all 34 projects to portfolio quality. Use three levels:

- **Practice:** small implementation, tests, and learning notes.
- **Showcase:** deployed product, polished UX, architecture diagram, metrics, and case study.
- **Capstone:** production-style system with frontend, APIs, data, AI, evaluation, security, observability, and CI/CD.

Recommended main path:

```text
P01 Portfolio
  -> P05 Search Dashboard
  -> P12 Typed API SDK
  -> P16 Enterprise Dashboard
  -> P25 Multi-tenant SaaS
  -> P30 AI Support Copilot
  -> P31 Enterprise RAG
  -> P33 AI Evaluation Platform
  -> P34 Industrial AI Capstone
```

The complete catalog and acceptance criteria are in the [project guide](08_PROJECTS/README.md).

## Weekly operating rhythm

Suggested weekday schedule (3.5–4 hours):

- 60 minutes: DSA pattern practice;
- 75 minutes: focused concept study;
- 90 minutes: project implementation;
- 30 minutes: interview recall or communication;
- 15 minutes: notes, commit, and tomorrow's first task.

Saturday is for integration, testing, system design, and one mock interview. Sunday is for revision, documentation, portfolio updates, and applications. If you have only two hours, keep the same order and halve the blocks.

## Definition of done

A topic is complete only when you can:

- explain it without notes at junior and senior depth;
- implement a small example from a blank file;
- debug a deliberately broken example;
- test important success and failure paths;
- compare at least two alternatives and their trade-offs;
- answer five interview questions using concrete examples.

A showcase project is complete only when it has:

- a clear problem statement and user stories;
- architecture and data-model documentation;
- validation, errors, loading, empty, and unauthorized states;
- unit, integration, and at least one end-to-end test;
- security and accessibility checks;
- measured performance plus AI quality/cost metrics where relevant;
- reproducible local setup, environment example, CI, and deployment;
- screenshots or demo, known limitations, and future improvements.

## AI engineering principles

An AI feature is not finished when it produces a plausible answer. Every AI project should include:

- a non-AI baseline and a clear reason to use AI;
- structured inputs/outputs and defensive parsing;
- a small versioned evaluation dataset;
- quality, latency, token, and cost measurements;
- prompt-injection and permission-boundary tests;
- traces that make failures diagnosable;
- fallback behavior and human review for high-impact actions;
- citations and retrieval evidence when claims come from documents.

## Interview preparation from day one

Use this answer structure for technical questions:

1. Give the direct definition.
2. Explain the mental model.
3. Show a small example.
4. Name failure modes and trade-offs.
5. Connect it to a project you built.

Record one five-minute answer every week. From week 8 onward, run one mock interview weekly. From week 40 onward, run two targeted mocks and one mixed mock each week.

## Suggested production stack

The roadmap is concept-first, but one coherent default stack reduces decision fatigue:

- **Frontend:** TypeScript, React or Angular, accessible component system;
- **Backend:** Node.js/TypeScript for product APIs, Python/FastAPI for AI services;
- **Data:** PostgreSQL, Redis, object storage, vector search where justified;
- **Async/realtime:** queues, WebSockets or SSE based on delivery requirements;
- **Quality:** unit, integration, contract, end-to-end, load, and AI evaluation tests;
- **Operations:** Docker, CI/CD, structured logs, metrics, tracing, alerts.

Choose one frontend framework for your capstone. Use the second framework to demonstrate transfer of concepts, not to duplicate every feature.

## Repository publishing note

Before publishing, make sure this folder is its own Git repository and that `origin` points to:

```text
https://github.com/taufiqueansari2621/full-stack-ai-enabled.git
```

Do not replace the remote of a parent or unrelated repository. Verify first with `git rev-parse --show-toplevel` and `git remote -v`.

## Progress rule

Consistency beats collecting resources. Every week should leave evidence: code, tests, a design, a written explanation, a recorded answer, or a deployed increment.
