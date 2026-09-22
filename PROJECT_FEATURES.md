# Forge — Complete Features and Project Details

## Project Summary

Forge is a self-guided, local-first technical learning platform for becoming a production-ready full-stack AI engineer. It combines a structured 52-week curriculum with lessons, practice, projects, revision, interview preparation, progress tracking, and AI-assisted learning in one responsive web application.

The platform is designed to answer six questions for the learner:

1. Where am I now?
2. What should I learn next?
3. Why does this topic matter?
4. How should I practise it?
5. Where will I use it in a real project?
6. How close am I to interview readiness?

The core learning loop is:

```text
Learn -> Understand -> Visualize -> Practice -> Build -> Debug
      -> Explain -> Review -> Interview -> Master
```

## Current Product Scale

- 52-week engineering roadmap
- 17 curriculum phases
- 684 navigable topics
- React, Angular, and combined frontend learning paths
- 34 progressive project briefs
- 8 guided portfolio project experiences in the application
- 10,260 interview questions
- 74 trusted learning resources
- Easy, Medium, and Hard practice for every visible curriculum topic
- Responsive support from 320px mobile screens to large desktop displays

## Main Application Areas

Forge provides 13 primary learner workspaces:

1. **Home** — daily mission, current progress, weak areas, reviews, and recommended next action.
2. **Lessons** — structured learning content and complete topic lessons.
3. **Learning Path** — the complete curriculum displayed as cards or an interactive flow.
4. **Resources** — official documentation, courses, practice sites, projects, interview material, and role roadmaps.
5. **Practice** — topic drills and coding or reasoning exercises at three difficulty levels.
6. **Quizzes** — assessments, question attempts, scoring, and completion records.
7. **Projects** — progressive builds, milestones, tasks, acceptance criteria, and saved project work.
8. **Interview Prep** — technical, coding, system-design, behavioral, and project interview practice.
9. **My Notes** — notes, mistakes, flashcards, snippets, and learner-created study material.
10. **Review** — spaced-repetition tasks and targeted revision.
11. **My Progress** — learning activity, topic completion, evidence, and progress summaries.
12. **Certificates** — certificates unlocked through qualifying assessment results.
13. **AI Tutor** — a transparent, locally trained retrieval assistant based on selected curriculum and learner notes.

## Learning Features

### Curriculum and Roadmap

- A visual curriculum organized by phase, module, and topic.
- Card view and interactive-tree view backed by the same curriculum data.
- Prerequisites and topic relationships.
- Learner-selected React, Angular, or combined frontend paths.
- Four job-goal roadmap options, including a DSA-focused route.
- Progress totals that adapt to the selected framework path.
- Deep links for major application routes.
- Current topic highlighting and navigation between related course topics.

### Complete Lessons

- Full-page, distraction-free learning mode.
- Continuous topic chapters instead of disconnected content fragments.
- Beginner, technical, practical, advanced, and interview-oriented depth.
- Plain-English explanations with professional technical vocabulary.
- Analogies, mental models, diagrams, code examples, common mistakes, debugging guidance, testing advice, and interview connections.
- A responsive course-topic rail that is sticky on desktop and swipeable on smaller screens.
- Learner-controlled hide/show behavior for the topic rail.
- Optional full-screen browser mode.
- A clear Back action that restores the previous learning context.
- Long examples and code wrap safely without causing page-level horizontal scrolling.

### Interactive Example Lab

Every supported topic can include three kinds of examples:

- Normal case
- Unusual or edge case
- Failure case

The learner must predict the result before revealing it. After the reveal, Forge shows the expected behavior and explanation, asks a follow-up question, and allows the learner to save a reflection. Saved records are isolated by learner, lesson, and example case.

Saving an example awards first-save time and XP credit, but it does not falsely mark the topic as mastered. Revising the same response updates the existing record instead of duplicating it.

### Deep Practice and Mastery Studio

- Foundation, guided, applied, debugging, and production-evidence levels.
- Sequential skill-level progression.
- One focused task at a time.
- Clear success checklists.
- Guidance reduces as the learner advances.
- Learner explanations and saved work provide evidence beyond passive completion.
- Mastery is intended to combine understanding, recall, coding, project use, and interview performance.

### Practice and Assessments

- Easy, Medium, and Hard practice for all visible topics.
- Quick checks, predictions, debugging, coding, explanation, and real-world challenges.
- Learner-scoped answers that can be revised later.
- Assessment attempt history and scoring.
- Foundation course assessment experience.
- Certificate eligibility based on qualifying results rather than navigation alone.
- Event-loop visualization and other interactive reasoning exercises.

## Review, Retention, and Knowledge Features

- Spaced-repetition review queue.
- Review completion records.
- Weak-skill identification and targeted practice recommendations.
- Notes, flashcards, bookmarks, code snippets, architecture decisions, and mistake journal.
- Knowledge entries saved to the active local learning profile.
- Review and learning history retained between browser sessions.
- Learner reset removes that profile's saved learning records.

## AI Tutor

- Local retrieval-based tutor that searches curriculum content and learner-added sources.
- Learners can add notes tagged as AI Tutor sources.
- Answers show source labels for transparency.
- Tutor sources are learner-scoped, persist locally, and are removed by profile reset.
- The tutor is designed behind a boundary that can later connect to a hosted model.
- AI output is treated as guidance to evaluate, not unquestionable truth.
- AI output does not directly change durable learner data or execute actions without validation and confirmation.

## Project Features

The repository contains 34 project briefs that progress from small frontend exercises to a production-style industrial AI capstone.

Project support includes:

- Project catalog and filtering.
- Guided portfolio project experiences.
- Milestones, dependencies, and individual tasks.
- Acceptance criteria and completion checklists.
- Saved project progress and learner notes.
- Architecture, API, database, testing, deployment, Git, and documentation guidance.
- Project scorecards and portfolio evidence.
- Progressive mentor hints instead of immediately revealing full solutions.
- Clearly labeled Start, Continue, and Open project actions.
- Meaningful project icons and accessible controls.

The recommended main project path is:

```text
P01 Responsive Portfolio
 -> P05 Intelligent Search Dashboard
 -> P12 Typed API SDK
 -> P16 Enterprise Dashboard
 -> P25 Multi-tenant SaaS
 -> P30 AI Support Copilot
 -> P31 Enterprise RAG
 -> P33 AI Evaluation Platform
 -> P34 Industrial AI Capstone
```

## Interview Academy

- 10,260 questions across the curriculum.
- Technical question practice.
- Coding interview practice.
- System-design interviews.
- Behavioral interviews.
- Project deep-dive interviews.
- Full-stack, frontend, backend, DSA, system-design, and AI/ML coverage.
- Difficulty-aware answer expectations.
- Feedback on correctness, depth, clarity, examples, testing, verification, risks, trade-offs, and alternatives.
- Guidance for structured behavioral answers using responsibility, action, result, and reflection.
- Saved interview attempts and learner-specific history.

## Curriculum Coverage

### Foundations

- Computer science fundamentals
- Git and Linux
- HTML and CSS
- JavaScript from fundamentals to internals
- Advanced TypeScript

### Frontend Engineering

- Angular core concepts, RxJS, architecture, performance, and testing
- React mental models, state, architecture, performance, and production practices
- Angular and React comparison material
- Accessibility and responsive design

### Backend Engineering

- Node.js
- REST APIs
- Authentication, authorization, validation, and API security
- PostgreSQL and database design
- Redis and caching
- Queues and background jobs
- Realtime systems using WebSockets or Server-Sent Events

### DSA and System Design

- Beginner, intermediate, and advanced DSA patterns
- Low-level design
- High-level design
- Scalability and distributed-system fundamentals
- Cloud and DevOps concepts

### AI Engineering

- Python and data work
- Mathematics for machine learning
- Machine learning
- Deep learning
- LLM engineering
- Retrieval-augmented generation
- Tool-using AI agents
- AI evaluation, security, observability, and MLOps
- Quality, latency, token, and cost measurement
- Prompt-injection and permission-boundary testing

### Career and Portfolio

- Profile positioning
- Resume guidance
- Application system
- GitHub presentation
- Case studies
- Behavioral preparation
- Portfolio-ready project reports

## Local Profiles and Data Persistence

Forge currently works without an account or backend. Local Learning Profiles separate multiple learners using the same browser, but they are not authentication.

The application stores learner-specific data in versioned browser `localStorage`, including:

- Progress and completions
- Practice answers and attempts
- Example predictions and reflections
- Notes and mistakes
- Project milestones and saved work
- Review activity
- Interview attempts
- Framework preference
- Theme preference

Logging out and returning to a local profile restores its data. Resetting a profile clears that learner's saved records. Browser storage is not intended for secrets or authoritative production assessment data.

## User Experience and Accessibility

- Dark and light themes, with dark as the default visual identity.
- Theme preference saved locally.
- Premium developer-tool visual style with calm, information-rich layouts.
- Responsive sidebar on desktop and modal navigation drawer on mobile.
- Focused lesson mode removes unrelated navigation and controls.
- Minimum usable touch targets for important controls.
- Accessible names for icon-only controls.
- Decorative icons hidden from assistive technology where appropriate.
- Keyboard- and screen-reader-friendly pressed states and labels.
- Responsive validation across desktop, tablet, and mobile viewports.
- No page-level horizontal overflow in supported learner flows.
- Plain-language learner-facing copy throughout the application.

## Technology Stack

| Area | Technology |
|---|---|
| Language | TypeScript in strict mode |
| UI | React |
| Build tool | Vite |
| Styling | Plain tokenized CSS |
| Icons | Lucide React |
| Current data | Typed TypeScript curriculum and application data |
| Current persistence | Versioned browser `localStorage` adapters |
| Curriculum source | Independently readable Markdown files |
| Static checks | TypeScript and ESLint |
| Browser testing | Puppeteer-based smoke and responsive checks |
| Production hosting | Cloudflare Workers Static Assets |

The deployed application uses static assets and single-page-application route fallback. It currently has no server-side Worker entry point, database binding, or production secret.

## Setup and Commands

Requirements: a current Node.js and npm installation.

```bash
npm install
npm run dev
```

Available commands:

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create the production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint checks |
| `npm run test:smoke` | Validate major learner journeys in a browser |
| `npm run deploy:cloudflare` | Build and deploy to Cloudflare |
| `npm run verify:cloudflare` | Verify the Cloudflare deployment |

## Production Deployment

Forge is deployed independently as a Cloudflare Worker using Workers Static Assets and SPA fallback routing.

Current documented production URL:

```text
https://forge-ai-engineering.taufiqueansari895.workers.dev
```

The root route and application routes such as `/learn`, `/roadmap`, and `/resources` are configured to load the React application directly.

## Product Principles

- Measure mastery, not content consumption.
- Connect concepts to practice, projects, and interviews.
- Prefer active recall and implementation over passive reading.
- Reveal help progressively instead of giving complete solutions immediately.
- Keep the learner's current state and next useful action visible.
- Evaluate AI output instead of trusting it automatically.
- Preserve a calm, professional interface despite the product's depth.
- Keep all curriculum Markdown independently readable outside the application.

## Current Limitations

- Data is stored only in the current browser; there is no account sync or multi-device backup.
- Local profiles are not secure authentication.
- Mastery, review scheduling, and assessment logic are still evolving toward full domain services.
- The code playground does not yet execute arbitrary learner code in a production sandbox.
- The current tutor is retrieval-based and does not yet use a production AI-provider gateway.
- Some application code remains in a large prototype-era `src/App.tsx` and is being decomposed gradually.
- Focused component tests and state-repository tests still need to be added alongside the browser smoke suite.
- Payments, subscriptions, teams, organization administration, and native mobile apps are outside the current scope.

## Planned Improvements

- Author more topic-specific React, Angular, shared-frontend, assessment, and project content.
- Add a constrained and isolated code runner.
- Add authored, topic-linked test and assessment banks.
- Add resource freshness metadata, bookmarks, and review workflows.
- Continue decomposing legacy application code into feature modules.
- Add focused component and state-repository tests.
- Introduce typed backend boundaries for authentication, synchronized progress, mastery, review scheduling, and AI providers when the local learning model is stable.
- Consider PostgreSQL for learner records, object storage for project artifacts, and a dedicated sandbox for untrusted code.

## Definition of Learning Completion

A topic should only be considered complete when the learner can:

- Explain it without notes at junior and senior depth.
- Implement a small example from a blank file.
- Debug a deliberately broken example.
- Test important success and failure paths.
- Compare alternatives and explain trade-offs.
- Answer interview questions using concrete examples.

A showcase project should include a clear problem, user stories, architecture, data model, validation, loading and error states, tests, security and accessibility checks, measured performance, reproducible setup, deployment, screenshots or a demo, limitations, and future improvements.

## Repository Structure

```text
00_START_HERE/       How to use the roadmap and learning system
01_FOUNDATIONS/      CS, Git/Linux, HTML/CSS, JavaScript, TypeScript
02_ANGULAR/          Angular curriculum
03_REACT/            React curriculum
04_BACKEND/          Node, APIs, security, databases, realtime, queues
05_DSA/              Data structures and algorithms
06_SYSTEM_DESIGN/    Fundamentals, LLD, HLD, cloud, and DevOps
07_AI/               Python, ML, LLMs, RAG, agents, evaluation, MLOps
08_PROJECTS/         34 project briefs
09_INTERVIEW/        Interview preparation material
10_PRODUCT_COMPANY/  Career positioning, resume, and applications
11_PORTFOLIO/        GitHub and case-study guidance
12_PHASES/           Detailed 52-week learning schedule
13_TRACKERS/         Daily, monthly, and definition-of-done trackers
14_FINAL_TARGET/     Final skill matrix and capstone architecture
context/             Product, architecture, UI, workflow, and feature specs
src/                 Forge React application
scripts/             Browser checks and deployment verification
```

## Final Outcome

The roadmap aims to help a learner become capable of building and explaining accessible frontend applications, secure backend services, production databases and realtime systems, AI and RAG services, evaluated tool-using agents, scalable system designs, and a portfolio of tested deployed projects—while also developing the communication and problem-solving ability required for technical interviews.
