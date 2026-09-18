# Forge — Project Overview

## Overview

Current product surfaces include a trainable local retrieval tutor, card and interactive-tree roadmap views, four job-goal roadmaps including DSA, a 10,260-question Interview Academy, and eight guided portfolio projects with architecture, testing, deployment, and decision evidence.

Forge is a self-guided technical learning platform that helps one learner progress from web fundamentals to a job-ready full-stack AI engineer. It combines structured lessons, visual explanations, deliberate practice, production-style projects, spaced repetition, AI-guided coaching, and interview simulation in one coherent learning loop.

The product must continuously answer: **Where am I, what should I learn next, why does it matter, how do I practise it, where will I use it, and how close am I to interview readiness?**

## Primary User

The initial user is an independent developer following the repository's 52-week curriculum. They need structure, feedback, accountability, and evidence of mastery without relying on a traditional instructor.

## Product Principles

1. Measure mastery, not content consumption.
2. Connect every concept to practice, projects, and interviews.
3. Prefer active recall and implementation over passive reading.
4. Guide learners progressively; do not reveal complete solutions immediately.
5. Make current state and the next useful action visible everywhere.
6. Treat AI output as something to evaluate, not automatically trust.
7. Keep the interface calm, professional, and usable despite deep functionality.

## Core Learning Loop

```text
Learn → Understand → Visualize → Practice → Build → Debug
      → Explain → Review → Interview → Master
```

## Core User Flow

1. The learner opens the dashboard and sees current progress, due reviews, weak skills, and today's mission.
2. They continue the recommended lesson at a selected depth: beginner, technical, practical, advanced, or interview.
3. They complete a visual or prediction exercise and explain the concept in their own words.
4. The platform records evidence against multiple mastery dimensions.
5. They apply the concept in a project milestone with acceptance criteria and progressive hints.
6. The spaced-repetition queue schedules targeted recall based on performance and elapsed time.
7. Interview mode tests the concept and the related project under realistic constraints.
8. The dashboard recommends the next lesson, review, practice set, or project task.

## Features

### Learning

- Interactive 17-phase, 684-topic roadmap with learner-selected React and Angular specializations, prerequisites, and progress.
- Full Learning Mode pages with continuous concept chapters, explanations, analogies, diagrams, examples, mistakes, and assessments.
- A distraction-free learning shell that gives lessons the full viewport, keeps a clear route back, and shows only course topics in its responsive lesson rail.
- Interactive example labs for every topic with normal, unusual, and failure cases; learners predict before revealing the result, explain what they learned, and save each case.
- Topic Mastery Studios that move from foundation through guided, applied, debugging, and production evidence.
- Visual execution tools for algorithms, data structures, browser/runtime behavior, and system architecture.
- Mixed practice: quick checks, predictions, debugging, coding, explanations, and real-world challenges.
- A curriculum-wide Easy, Medium, and Hard practice lab with learner-scoped artifacts for every visible topic.
- A 74-resource academy with official documentation, trusted courses, practice, projects, interviews, and role roadmaps.

### Projects

- 34 progressive project briefs from fundamentals to an industrial AI capstone.
- Milestones, dependencies, tasks, acceptance criteria, and project scorecards.
- Architecture, API, database, testing, deployment, Git, and documentation workspaces.
- AI project mentor that uses progressive guidance rather than automatic solutions.

### Retention and Mastery

- Spaced-repetition review queue.
- Mastery calculated across understanding, recall, coding, project usage, and interview performance.
- Weakness detection with targeted remediation plans.
- Notes, flashcards, bookmarks, code snippets, architecture decisions, and mistake journal.

### Interview and Career

- Technical, coding, system-design, behavioral, and project-specific interview modes.
- Scored feedback for correctness, communication, depth, structure, and trade-off awareness.
- Career readiness dashboard and portfolio-ready project reports.

## Scope

### Current MVP Scope

- Responsive dashboard and navigation.
- Visual roadmap backed by representative curriculum data.
- One complete multi-level JavaScript lesson and interactive event-loop visualization.
- Project catalog and detailed capstone presentation.
- Review queue with completion interactions.
- Question-by-question interview simulation.
- Persistent quick checks, curriculum-wide topic drills, knowledge, progress, and mentor workspaces.
- Light/dark theme stored locally.
- Reproducible Cloudflare Workers Static Assets deployment with SPA deep-route support.

### Next Product Scope

- Decompose the single application file into feature modules.
- Introduce a typed local data layer and durable learner state.
- Connect the repository's complete curriculum and all project Markdown content.
- Implement real question grading, mastery calculation, and review scheduling.
- Add an executable code playground in a safe worker or sandbox.
- Add authentication, server persistence, and an AI-provider abstraction after the local product model stabilizes.

### Explicitly Out of Scope for the Current MVP

- Payments, subscriptions, teams, and organization administration.
- Arbitrary untrusted code execution on the application server.
- Claims that static demo scores represent actual learner ability.
- Autonomous AI actions that change learner data without confirmation.
- Native mobile applications.
- A production multi-tenant backend before the learning model is validated locally.

## Success Criteria

1. A first-time user can identify their current state and next action within ten seconds.
2. Every primary navigation item opens a useful, non-broken experience.
3. A learner can move from lesson to visualization, practice, project, review, and interview without losing context.
4. Progress comes from recorded evidence rather than only a completed checkbox.
5. The interface works from 320px mobile width through large desktop layouts.
6. `npm run lint` and `npm run build` pass with no browser console errors.
7. Future AI and backend integrations can be introduced behind typed boundaries without rewriting presentation components.
