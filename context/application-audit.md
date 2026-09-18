# Forge Application Audit

## Executive assessment

Forge now has a credible local-first shell, separate learner profiles, a complete navigable curriculum hierarchy, persistent learning activity, real foundation lessons, guided catalog lessons, selectable frontend framework paths, curriculum-wide difficulty practice, a curated Resource Academy, projects, knowledge capture, reviews, interviews, a foundation assessment, and an evidence-gated local certificate.

It is no longer only a static dashboard. It is not yet a complete professional learning platform because most curriculum topics still use an expanded shared professional lesson structure rather than topic-specific authored material, practice is not connected to each topic, code examples are not executable, mastery is a coarse aggregate, and several advanced workspaces remain representative rather than comprehensive.

## Keep and strengthen

- The existing dark/light Forge visual identity and responsive shell.
- Explicit Local Learning Profiles with honest browser-only disclosure.
- Versioned learner-scoped persistence behind `useForgeStore`.
- The 17-phase, 98-module, 684-topic curriculum catalog.
- The learner-scoped React, Angular, or Both frontend specialization choice.
- Six deeply authored day lessons and the topic-specific Orientation, Web, and JavaScript instructional records.
- Persistent notes, practice attempts, project milestones, interview responses, quiz attempts, certificates, XP, and activity.
- Open-access curriculum exploration without falsely awarding mastery.
- Deterministic local mentor wording when no AI provider is configured.
- Browser smoke coverage for core workflows and mobile overflow.

## Remove, replace, or rename

### Remove prototype-only code

- Delete legacy unused page implementations from `App.tsx` after confirming no imports remain.
- Remove unused fixed `progress`, `tasks`, `skills`, and weekly-activity fields from `data.ts` once every consumer uses derived state.
- Remove placeholder project actions that only report that a future task was saved. Replace them with real task records or disable them with a specific explanation.

### Replace representative data

- Replace generated open-ended drills with authored topic-linked coding tests and reviewable assessment banks over time.
- Replace fixed review strengths and due labels with a deterministic scheduler using attempts and elapsed time.
- Replace the static global search list with an index built from curriculum, projects, quizzes, interview questions, and learner knowledge.
- Replace the broad mastery formula with dimensioned evidence: lesson checkpoint, recall, implementation, project application, and interview explanation.
- Replace cumulative minutes presented as a weekly goal with per-day activity records and a true rolling-week calculation.
- Replace fixed dashboard review and project recommendations with the next incomplete required activity.

## Product gaps by workspace

| Workspace | Current state | Highest-value improvement |
|---|---|---|
| Home | Personalized and partly evidence-derived | Make every recommendation and weekly metric deterministic from current incomplete work |
| Learn | 684 navigable topics; 64 have topic-specific instructional records; every generated topic has a professional Full Learning sequence; lessons use a responsive full-canvas shell with course-topic-only navigation | Author remaining phases topic by topic and add section-level reading/checkpoint state |
| Roadmap | Complete open hierarchy with React/Angular/Both selection and derived progress | Add module/topic mastery states and stable deep URLs |
| Practice | Four persistent quick checks plus Easy/Medium/Hard open-ended drills for every visible topic | Add authored topic banks and a browser Web Worker code runner with tests, timeout, and output limits |
| Resources | 71 curated official/trusted links, filters, lesson recommendations, and three role roadmaps | Add freshness review dates and optional learner bookmarks without treating visits as mastery |
| Quizzes | One persistent ten-question foundation assessment | Add topic/module/phase quiz banks, question randomization, and attempt comparison |
| Projects | Four milestone-based projects | Import all 34 project briefs and replace representative tabs with artifacts and acceptance criteria |
| Interview | Four questions with a local rubric | Organize by phase/topic/difficulty and connect weak answers to revision |
| Knowledge | Persistent notes and mistakes | Add bookmarks, flashcards, snippets, revision status, and topic backlinks |
| Reviews | Persistent completion over a fixed queue | Implement spaced scheduling from failures, confidence, and last review time |
| Progress | Uses saved learner activity | Explain score contribution by topic and show trends from timestamped evidence |
| Certificates | One evidence-gated local certificate | Add module/phase credentials only after their content and assessments exist |
| AI Mentor | Honest deterministic helpers | Introduce a typed provider gateway only after privacy, cost, and evaluation rules are set |

## Architecture risks

1. `App.tsx` remains oversized and contains both active and legacy views.
2. `useForgeStore` mixes repository parsing, mutations, XP rules, progress rules, and React state.
3. Detailed lessons and catalog metadata are separate but currently joined by display title in some paths; persisted relationships should use stable IDs only.
4. Top-level path restoration exists, but topic/module URLs, browser back/forward, and reloadable deep links are incomplete.
5. One browser smoke script carries most regression coverage; domain calculations and storage migration have no focused tests.
6. Catalog guidance makes every topic useful, but 620 topics still require topic-specific authoritative instructional records.
7. Resource and practice breadth is generated from shared mappings; individual records need scheduled source-freshness and content-quality review.

## Recommended implementation order

### P0 — Trustworthy learning evidence

1. Extract a versioned repository and pure mastery domain module.
2. Store timestamped evidence with topic ID, activity type, score, attempts, hint usage, and elapsed time.
3. Calculate topic/module/phase progress from explicit configurable requirements.
4. Replace fixed review and dashboard recommendations.

### P1 — Complete the core learning loop

1. Author topic-specific shared frontend, React, and Angular content and assessment banks.
2. Add reusable code examples with copy, edit, reset, expected output, and explanation.
3. Add a constrained JavaScript Web Worker practice runner.
4. Connect lesson → practice → quiz → revision → next lesson.
5. Scale assessment banks by topic and module.

### P2 — Project and interview evidence

1. Import all project Markdown through a typed adapter.
2. Add acceptance criteria, artifacts, decision logs, testing evidence, and self-review.
3. Connect project milestones to topic mastery.
4. Expand interview banks and link feedback to revision schedules.

### P3 — Professional product foundations

1. Add stable deep routes and browser history behavior.
2. Build real curriculum-wide search.
3. Decompose the application shell and feature modules.
4. Add domain, repository, component, accessibility, and route tests.
5. Add production authentication and account sync only after the local data model stabilizes.

## Certificate policy

- Keep the wording “Certificate of Completion.”
- Never issue a credential for opening content or XP alone.
- Require explicit lessons, practices, projects, and a passed assessment.
- Do not create certificates for phases whose lesson and assessment coverage is still incomplete.
- Continue stating that local credentials are not external accreditation.

## Definition of a professional Forge topic

A topic is complete only when it has topic-specific instruction, progressive examples, a meaningful checkpoint, practice evidence, revision scheduling, interview linkage, and at least one project connection. A shared catalog guide is useful coverage but not final authored depth.
