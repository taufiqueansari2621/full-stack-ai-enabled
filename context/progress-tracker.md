# Progress Tracker

## 2026-09-19 — Cloudflare account migration

- Moved the live Forge deployment from the Valorled Cloudflare account to `taufiqueansari895@gmail.com`.
- New live URL: `https://forge-ai-engineering.taufiqueansari895.workers.dev`.
- New Cloudflare version: `1e9fbfb3-2048-458f-a186-a6080d7f80c6`.

## 2026-09-19 — Trainable tutor and professional workspace upgrade

- Added a private local RAG-style Forge Tutor over the complete curriculum plus learner-added training sources, with visible grounding and honest out-of-data fallback.
- Added consistent themed inputs so lesson textareas no longer render as white browser controls in dark mode.
- Added optional focused-learning navigation from the left edge and top-right, plus browser full-screen mode; course topics remain independently collapsible.
- Added DSA & Coding Interviews as a complete role roadmap option.
- Added switchable card and clickable flow/tree learning-path views.
- Expanded the project workshop from four to eight portfolio projects and added actionable guidance/evidence checklists.
- Verified lint, production build, and the full browser smoke suite including 78 primary responsive checks and six focused lesson viewport checks.
- Deployed to Cloudflare as version `eae7e35d-57f4-46e7-980b-5c26ef2a29ea`; live SPA, deep lesson, focused navigation, project controls, console health, and 390px overflow verification passed.

Update this file after every meaningful verified implementation change.

## Current Phase

- Phase 2: Verified local-first learning system.

## Current Goal

- Make every primary learner journey useful, persistent, and testable without requiring an account or backend.

## Completed

- Started the Forge 2.0 production foundation with a repository audit and a root `ARCHITECTURE.md` covering current and target architecture, migration, database/API design, security, AI, and isolated code-runner boundaries.
- Created the `forge-production` Cloudflare D1 database in the authenticated Forge account and added a first normalized migration for accounts, profiles, hashed sessions, progress snapshots, and activity events.
- Added a modular Worker API entry point that preserves Static Assets/SPA routing while providing health, registration, login, logout, current-user, and revision-controlled progress endpoints.
- Added password hashing, hashed opaque sessions, secure production cookies, same-origin mutation checks, request limits, consistent API errors, ownership derived from authenticated sessions, and response security headers.
- Kept the existing local learner experience unchanged until the authenticated UI, explicit import consent, offline caching, and conflict resolution can ship together as a tested vertical slice.
- Applied the initial migration to the remote `forge-production` D1 database and deployed Worker version `df02a222-278d-4e85-8aa8-a65d9780f860` with the API and existing SPA assets.
- Added the production account interface, authenticated-session restoration, explicit local-progress import, debounced cloud saves, offline messaging, and revision-conflict protection while retaining local profiles as an offline/migration path.
- Added D1-backed registration, login, and recovery rate limits plus one-time recovery codes stored only as hashes and rotated after use; registration can now open with a usable recovery path.
- Added a real-browser account suite covering registration, session creation, recovery-code delivery, explicit progress import, cloud reads, logout authorization, password recovery, recovery-code rotation, and login with the replacement password.
- Added a seven-step cloud onboarding flow for career goal, experience, React/Angular choice, study time, target outcome, six-area diagnostic assessment, and a personalized roadmap summary.
- Added authenticated profile APIs and D1 fields for onboarding preferences, server-scored diagnostics, recommended starting phase, daily mission, and weekly target without converting self-reported experience into mastery.
- Deployed and verified personalized onboarding as Cloudflare Worker version `6959231b-c983-4292-a036-b17bcfcc8741`; both the production account lifecycle and existing learner regression audit pass.
- Added a lazy `/workspace` browser IDE with a multi-file explorer, tabs, line numbers, challenge instructions, progressive hints, console output, visible tests, problems, sandboxed HTML/CSS/JavaScript preview, reset, local autosave, and JSON export.
- Added a disposable JavaScript Web Worker runner with bounded console output, removed network capabilities where supported, a 1.5-second termination deadline, execution timing, expected-versus-actual output, and three real behavior tests.
- Added authenticated D1 workspace persistence with file/path validation, 512 KB total limits, debounced saves, local fallback, saved-state feedback, and revision conflict protection.
- Extended the production account browser suite to solve the coding challenge, pass all tests, and prove the edited workspace reached the authenticated cloud record.
- Deployed and verified the browser workspace as Cloudflare Worker version `c1e4f2d5-866e-4958-817c-4a5ae3788888`; the production lifecycle test proves code execution, test results, D1 autosave, account recovery, and authorization while the existing live learner audit remains clean.
- Added a provider-independent Forge AI boundary with a Cloudflare Workers AI adapter, authenticated `/api/ai` route, validated modes and hint levels, bounded explicit context, same-origin enforcement, and a 20-request-per-hour learner limit.
- Added D1 conversations, messages, and usage telemetry with model, mode, bounded context labels, input/output character counts, and latency; model credentials and bindings remain entirely server-side.
- Connected the workspace AI panel with Explain, Hint, Debug, Review Code, and Quiz modes, five progressive teaching levels, an active-file consent toggle, exact context disclosure, and follow-up actions.
- Deployed Forge AI as Cloudflare Worker version `6fb94668-9987-4166-b96b-239b683a1e2f`; the production lifecycle received a real guiding response from `@cf/meta/llama-3.1-8b-instruct-fast`, recorded model/mode/character/latency telemetry, and passed the existing UI audit.
- Connected every project card to the real coding workspace and added new-project starters for browser web apps, Node.js, Python, and AI/RAG work, with readable README and Forge project metadata files.
- Added immutable D1 workspace snapshots with user-derived ownership, bounded file validation, 20-version history, named saves, and one-click restore; signed-out reads are denied.
- Deployed the project workspace and version-history unit as Cloudflare Worker version `83c7ea16-709d-47ae-810d-f3a6267348bc`; production browser tests prove workspace execution, D1 autosave, snapshot creation, contextual AI, recovery, and authorization, and the responsive live audit passes.
- Replaced the synthetic mastery percentage with six understandable states—Not started, Learning, Practicing, Applied, Review due, and Strong—derived from visible lesson, practice, artifact, project, interview, and retention evidence.
- Added a real spaced-review schedule to learner state: incorrect coding answers, weak quiz topics, and low interview results become due work; Again, Hard, Good, and Easy recall ratings calculate the next interval and persist through local and authenticated cloud progress.
- Added backward-compatible cloud hydration for older progress snapshots, a due-now review queue, upcoming-review feedback, optional practice links, responsive recall controls, and browser coverage for creation, rescheduling, profile restoration, and reset.
- Deployed evidence mastery and spaced reviews as Cloudflare Worker version `6fb88920-ab68-4eed-b14a-67495171f96e`; both the live responsive audit and authenticated account/cloud-sync lifecycle pass against the exact release.
- Added a lazy Advanced Labs workspace with step-driven array sorting, binary search, BFS, and recursion visualizations; visible operation, step, time, and space state; and reusable previous/next/reset controls.
- Added a system-design canvas with twelve production components and ordered connections, an in-browser SQL schema/query/results challenge, and a RAG pipeline explorer showing chunks, retrieved context, token estimates, and grounding quality.
- Added learner-scoped lab evidence with update-without-duplication behavior, XP/time credit, local and authenticated cloud-sync compatibility, mastery evidence integration, reset coverage, and responsive verification across all four labs.
- Deployed Advanced Labs as Cloudflare Worker version `1a973791-8598-451d-8eda-cb7307d16838`; the exact live artifact passed SPA routing, console-health, focused-learning, and 390px overflow verification.
- Added a lazy Portfolio workspace that gathers visible project milestones, challenge results, advanced-lab case studies, skill evidence, and earned certificates into an editable preview without exposing private notes, source code, progress records, or AI conversations.
- Added authenticated D1 portfolio drafts and explicit publish/unpublish controls. Public `/u/:username` profiles read only the bounded published projection; usernames come from the authenticated server profile and unpublished or unknown profiles return 404.
- Added lifecycle coverage for opt-in publishing, anonymous reads, authenticated draft denial after logout, continued visibility while published, and immediate public removal after unpublishing; responsive coverage now includes 90 primary workspace combinations.
- Fixed a production privacy regression found by the lifecycle test: public profiles now use `no-store` responses so unpublishing revokes anonymous visibility immediately instead of leaving a 60-second browser cache. The corrected release is Cloudflare Worker version `1b60d243-e04f-443b-8ced-c7ac3ef3c673`, and both the full account/privacy lifecycle and live UI audit pass.
- Moved authenticated Foundation certificates behind a D1 credential service. The Worker verifies synchronized lesson, assessment, correct-practice, project-milestone, and mastery-artifact evidence before generating an immutable server credential ID.
- Added authenticated credential listing, idempotent issuance, public `/certificate/:id` verification with the exact evidence summary, and UI requirements that match the server gate while preserving offline certificates as explicitly local records.
- Deployed and verified server-backed credentials as Cloudflare Worker version `4fcdb78b-b66b-480c-9535-5d40e8d8d6d1`; the production lifecycle proves progress sync, evidence verification, issuance, and anonymous credential lookup.
- Replaced arbitrary Progress-page multipliers with eight meaningful measures: recorded study time, completed topics, strong topics, practice attempts and accuracy, unique solved problems, project milestones, review retention, and interview attempts with rubric average.
- Added a seven-day evidence activity chart and a clickable ten-skill matrix for JavaScript, TypeScript, React, Node.js, PostgreSQL/SQL, DSA, System Design, Python, Machine Learning, and RAG/AI Systems.
- Every skill state is derived from its exact lessons, practice, projects, labs, interviews, mastery artifacts, and due reviews; selecting a skill reveals those records and routes to a relevant next action without claiming mastery from self-report or decorative precision.
- Deployed the account and cloud-sync release as Cloudflare Worker version `cf899c43-ce1d-4144-a8cf-dcfa6de08945`; the complete account lifecycle and existing responsive learner experience pass against production D1 and Workers.

- Created and published the 52-week curriculum and 34-project ladder.
- Built the responsive Forge application shell and dashboard.
- Added dark/light theme persistence.
- Added the interactive roadmap.
- Added a multi-level event-loop lesson with lesson, visualization, and practice tabs.
- Added project catalog and capstone presentation.
- Added review queue interactions.
- Added a question-by-question interview simulation.
- Added representative practice, knowledge, progress, and mentor surfaces.
- Diagnosed and fixed the React Strict Mode startup crash.
- Verified lint, production build, and real-browser dashboard rendering.
- Added project-specific Six-File Context documentation and build plan.
- Added a versioned local learner-state repository with defensive browser storage recovery.
- Replaced representative practice, knowledge, progress, mentor, project, interview, review, and lesson surfaces with usable local workflows.
- Added persistent challenge attempts, notes, review completion, project milestones, interview feedback, XP, and activity tracking.
- Added global search, settings, theme selection, progress reset, notifications, and responsive interaction states.
- Added an end-to-end browser smoke test that covers persistence, navigation, practice, notes, projects, reviews, interviews, search, and mobile overflow.
- Verified lint, production build, and browser smoke test after the functional learning-system implementation.
- Added first-visit onboarding and explicit Local Learning Profiles with configurable level, goal, study time, and pace.
- Added multi-profile login/logout with learner-isolated progress records and zeroed, evidence-based starting state.
- Added persisted lesson position so continue-learning restores the saved lesson depth, workspace tab, and visualization step.
- Personalized the dashboard, navigation, and settings from the active profile and clarified browser-only data boundaries.
- Added a six-day, content-rich beginner course covering computer foundations, the web, HTML, accessibility, CSS, and JavaScript.
- Added per-day goals, prerequisites, estimates, tutorials, code examples, mistakes, exercises, challenges, quizzes, interview prompts, revision notes, and saved completion progression.
- Changed reset into a verified learner-scoped “Reset all & start over” flow that clears all evidence and returns immediately to Day 1 without affecting other profiles.
- Replaced fixed dashboard mastery, streak, lesson-count, and current-stage claims with values derived from the active learner's stored activity.
- Added a typed 16-phase curriculum catalog with 50+ modules and 200+ prerequisite-ordered topics from orientation through job preparation.
- Made every roadmap phase open a real module/topic view; populated unlocked topics navigate into their lessons and unavailable topics explain why they are disabled.
- Replaced roadmap-level fake progress and week claims with completion-derived values and real curriculum counts.
- Added stable primary workspace paths so `/roadmap`, `/learn`, `/practice`, and other main views survive refresh.
- Audited welcome, dashboard, roadmap, and lesson screens in real Chrome screenshots across light and dark themes.
- Added theme-specific accessible accent tokens for light surfaces, improved muted-text contrast, enlarged action labels/targets, strengthened disabled controls, and fixed the invisible dark-mode lesson Reset button.
- Removed prerequisite gates from every roadmap phase and topic so learners can explore the complete curriculum freely without awarding completion or mastery.
- Added navigable topic overview pages for not-yet-expanded lessons, with phase context, module position, adjacent topics, and working module navigation instead of locked or dead controls.
- Audited curriculum coverage: 280 catalog topics, 6 deeply authored lessons, and 274 former outline-only gaps.
- Replaced all 274 outline-only pages with guided topic lessons containing phase-specific mental models, examples, production/quality guidance, deliberate practice, checkpoints, notes, completion, and previous/next navigation.
- Updated phase and overall roadmap progress to include stable IDs for every catalog topic and verified a formerly uncovered TypeScript lesson in the browser flow.
- Expanded the shared 280-topic lesson experience with explicit beginner, intermediate, advanced, and professional teaching layers.
- Added accessible concept-flow diagrams, common-mistake and professional-practice comparisons, graded practice framing, four interview levels, and durable revision summaries to every guided catalog lesson.
- Added topic-specific instructional records for all 13 Orientation, 19 Web Fundamentals, and 32 JavaScript topics.
- Each covered topic now has an accurate definition, concrete importance, ordered mechanics, realistic scenario, focused exercise, and code example where appropriate, layered into the shared beginner-to-professional lesson experience.
- Added dedicated Quizzes and Certificates workspaces to navigation, routes, and global search.
- Added a persistent 10-question foundation assessment with answer review, 80% pass threshold, weak-topic remediation, retry, XP, and attempt history.
- Added an evidence-gated local Foundation Certificate of Completion requiring all six lessons and a passed assessment, with unique credential ID and print / Save PDF support.
- Replaced decorative dashboard activity bars, streak days, skill percentages, and coach claims with values derived from the active learner's stored evidence.
- Added a persistent related-topic navigator to catalog lessons with a clear active state, completion indicators, and phase-wide movement across module boundaries.
- Added selectable in-lesson subtopics with explanations, concrete examples, practice tasks, and Previous/Next controls that advance through subtopics before moving to the next topic.
- Expanded Git and GitHub into 11 professional learning steps and added detailed sequences for the terminal, DNS/HTTP, forms, and JavaScript arrays, with topic-aware learning sequences for the rest of the catalog.
- Added active subtopic navigation and always-available Previous/Next progression to the six foundation lessons so completed lessons are no longer navigation dead ends.
- Persisted the selected catalog or foundation subtopic as the learner's current learning position.
- Replaced the space-heavy Foundation course card list inside authored lessons with a compact lesson-task roadmap covering goals, concepts, every tutorial section, mistakes, exercises, quiz, and revision, with clear active-task highlighting.
- Converted the six foundation lessons from long scrolling documents into focused task pages with a visible task counter, active roadmap state, and page-by-page Previous/Next progression.
- Added deep instructional records for all 18 foundation teaching subtopics, including purpose, analogy, ordered mechanics, visual model, realistic example, practice challenge, and takeaways.
- Expanded responsive browser verification to all 12 primary workspaces at six viewport/theme combinations from 1440px desktop to 320px mobile and confirmed no document-level horizontal overflow.
- Added a four-stage Deep Dive Lab to every catalog topic with prediction-before-explanation, worked models, progressive hints, transfer practice, teach-back, confidence calibration, and durable learning evidence.
- Benchmarked ten major learning platforms and documented the shared professional learning model across diagnosis, active learning, practice, projects, retention, and validation.
- Added a persistent five-level Mastery Studio to every catalog topic, moving from foundation and guided tracing through application, debugging, and production decision records with explicit success criteria.
- Added typed learner-scoped mastery artifacts that can be revised without duplication and do not inflate calculated mastery or replace formal assessment evidence.
- Removed the catalog subtopic-selection interface and replaced it with Full Learning Mode, where every topic opens directly into one continuous sequence of all concept chapters, examples, practice tasks, Deep Dive, Mastery Studio, assessment, and interview preparation.
- Converted all six authored foundation lessons to the same continuous Full Learning Mode, removing their internal task picker while preserving every tutorial, visual model, exercise, quiz, revision item, and lesson-to-lesson control.
- Isolated browser smoke-test storage from normal localhost development profiles by running the destructive reset flow only on the separate `127.0.0.1` origin.
- Added context-aware lesson back navigation: authored lessons return to the exact roadmap phase that opened them, with a safe complete-roadmap fallback for direct or refreshed lesson visits.
- Audited the whole curriculum against a zero-to-professional learning loop and expanded the navigable catalog to 17 phases, 98 modules, and 684 ordered topics.
- Added a learner-scoped React, Angular, or Both choice to Frontend Engineering; the preference persists and limits roadmap/dashboard progress denominators to the selected curriculum.
- Expanded Frontend Engineering to a 39-topic common platform foundation, a 67-topic React specialization, and a 94-topic Angular specialization covering foundations through architecture, production incidents, projects, interviews, and assessment.
- Added a complete Data Structures & Algorithms phase and expanded backend, distributed systems, Python, data engineering, ML, deep learning, DevOps, cloud, SRE, incidents, and senior/principal interview preparation.
- Expanded generated Full Learning Mode lessons across the catalog with mental models, guided implementation, debugging, testing, performance, security, professional practice, and multi-level interview reasoning.
- Documented the curriculum depth audit, the honest distinction between structured coverage and topic-specific authored depth, and the next authoring priorities.
- Deeply researched freeCodeCamp, MDN, The Odin Project, Exercism, Frontend Mentor, GitHub Skills, Google ML Crash Course, Hugging Face Learn, LeetCode, HackerRank, GreatFrontEnd, roadmap.sh, and official technology documentation.
- Added a searchable Resource Academy with 71 attributed official/trusted resources, explicit Official and Free labels, four evidence levels, and Frontend, Full-Stack, and AI Engineer role roadmaps.
- Added relevant official/trusted resources inside every catalog lesson without awarding progress for opening external links.
- Expanded Practice with a second curriculum-wide mode: Easy, Medium, and Hard open-ended drills for every visible topic, producing 2,052 combinations when both frontend frameworks are selected.
- Added learner-scoped topic-practice artifacts that can be revised per topic and difficulty, survive logout/login, and clear with the existing learner reset.
- Lazy-loaded Full Learning Mode, lesson resources, the Resource Academy, and topic drills; the initial production chunk fell from 504.53 kB to 395.78 kB and no longer triggers Vite's size advisory.
- Verified the Resource Academy, Angular lesson resources, Medium drill persistence, reset behavior, and all 13 workspaces across six responsive light/dark viewport checks.
- Added Focused Learning Mode for authored and catalog lessons: the global sidebar, top bar, search/settings chrome, and floating mentor are removed while studying, and the existing lesson Back action restores the exact roadmap context.
- Replaced the authored lesson chapter/subtask outline with a six-topic Foundation course navigator; catalog lessons now label their phase-wide navigator as Course Topics.
- Made course navigation sticky beside lessons on desktop and a compact horizontal swipe rail on tablet/mobile, giving the lesson the full canvas without document-level overflow.
- Updated visual capture tooling for the focused shell and verified both desktop and 390px mobile compositions in real Chrome screenshots.
- Extended browser coverage with focused-shell DOM assertions, six dedicated catalog-lesson viewport checks, and 78 primary responsive light/dark workspace checks.
- Installed Wrangler 4.133.0 and added reproducible Cloudflare Workers Static Assets configuration with explicit single-page-application fallback.
- Published Forge as the independent `forge-ai-engineering` Worker without modifying the existing `valorindia` Pages project or attaching a custom domain.
- Verified the live root, `/learn`, `/roadmap`, and `/resources` routes with HTTP 200 responses and real Chrome checks for React boot, lazy content, focused learning, console errors, and 390px overflow.
- Rewrote every active learner workspace in clear, consistent English, including onboarding, navigation, dashboard, learning path, lessons, deeper practice, skill levels, practice, notes, projects, interviews, review, progress, quizzes, certificates, and resources.
- Replaced unexplained product jargon such as artifact, evidence, rubric, calibration, curriculum-wide, and mastery-facing labels with direct learner actions while preserving required technical vocabulary and all stored IDs and behavior.
- Added a browser-based plain-language regression check and updated all interaction and responsive assertions for the new labels.
- Verified the plain-English experience with a clean production build, zero-warning lint, full persistence workflow, 78 responsive workspace checks, and six focused lesson viewport checks.
- Rebuilt the reported npm lesson as 11 distinct, topic-specific chapters covering the package manifest, runtime and development dependencies, semantic versions, lockfiles, `npm install` versus `npm ci`, scripts, peer dependencies, safe updates, debugging, and supply-chain safety.
- Added a prediction-first Interactive Example Lab to every catalog and authored Foundation lesson with normal, unusual, and failure situations, revealed results, explanations, follow-up questions, saved reflections, and learner-profile isolation.
- Added typed `exampleLabRecords` persistence with first-save XP/time credit, update-without-duplication behavior, logout/login restoration, and learner-reset cleanup without treating saved examples as topic completion.
- Reworked generated lesson chapters so foundation, mental model, process, build, application, debugging, testing, safety/performance, professional, and interview sections serve distinct teaching purposes instead of repeating one generic example.
- Added current-topic auto-focus plus learner-controlled hide/show behavior to both catalog and Foundation course rails, while preserving the horizontal mobile rail and full-width lesson mode.
- Added safe wrapping for long examples and code, and verified the updated lesson visually at 1470px desktop and 390px mobile widths.
- Added current official npm resources for dependency types, reproducible `npm ci` installs, and dependency security; the Resource Academy now contains 74 unique resources.
- Extended the browser smoke workflow to verify npm chapter uniqueness, prediction/reveal/reflection persistence, course-rail controls, logout/login restoration, learner reset, 78 primary responsive checks, and six focused lesson viewport checks.
- Audited project-page controls and replaced repeated folder symbols with meaningful Search, Analytics, Database, and AI icons.
- Corrected the primary project action to show `Start P05` at zero progress and `Continue P05` only after saved work exists.
- Replaced ambiguous arrow-only project-card controls with named `Open project` actions, visible labels, consistent icon sizing, hover feedback, and 44px touch targets.
- Added accessible names to active icon-only menu, close, send, review, project, search, and settings controls; decorative icons are now hidden from assistive technology where touched.
- Made project filters horizontally swipeable on narrow screens and raised their text and touch sizing without introducing page-level overflow.
- Extended the full browser suite to reject any visible button without a text or ARIA name and to verify four distinct project symbols plus labeled 40px-or-larger card actions.

## In Progress

- None. The next unit is ready to begin.

## Next Up

1. Continue topic-specific authoring for shared frontend, React, and Angular lessons, exercises, project artifacts, and assessment banks.
2. Add a constrained code runner and authored topic-linked test/assessment banks.
3. Add freshness metadata, learner bookmarks, and review workflows to the Resource Academy.
4. Decompose legacy prototype-only components out of `src/App.tsx`.
5. Add focused component and state-repository tests alongside the expanded browser smoke coverage.

## Open Questions

- Which identity provider should be used when account sync becomes necessary?
- Should curriculum Markdown be imported at build time or managed through a future content service?
- Which languages must the first code playground execute?
- Which AI provider and cost ceiling should the production mentor support?
- Is the first deployed version single-user, public beta, or multi-user?

## Architecture Decisions

- Start local-first to validate learning workflows before adding backend complexity.
- Use React, strict TypeScript, Vite, plain tokenized CSS, and Lucide icons.
- Keep the numbered Markdown curriculum independently readable and treat it as content source material.
- Place AI providers, persistence, mastery, review scheduling, and code execution behind explicit typed boundaries.
- Never equate content completion with mastery.
- Never execute learner code in the application process.

## Known Technical Debt

- `src/App.tsx` is intentionally oversized from the prototype and must be decomposed incrementally.
- `src/styles.css` contains prototype-era raw color values and very small metadata type; migrate touched areas to documented tokens and accessible sizing.
- Legacy prototype-only components remain in `src/App.tsx` while the new functional views are incrementally separated in `src/FunctionalPages.tsx`.
- Some feature-specific learning records remain local-first; account progress, onboarding, workspaces, snapshots, and AI usage are cloud-backed with conflict-aware workspace/progress writes.
- Browser smoke coverage exists; focused component and state-repository tests are still needed.

## Session Notes

- Latest implementation state: distraction-free Complete Lessons, hideable course-topic-only navigation, prediction-first interactive examples, deeper practice, five skill levels, React/Angular/Both paths, 684 topics, 74 trusted resources, curriculum-wide three-level topic practice, and plain-English learner copy.
- Headless Chrome confirmed the Angular-only path, lesson resources, Resource Academy, Medium practice artifact, logout/login restoration, clean reset, and every existing learner workflow.
- Lint, production build, all 78 responsive workspace checks, and six focused catalog-lesson viewport checks pass; feature-level lazy loading keeps the initial production chunk below Vite's advisory threshold.
- Production is live at `https://forge-ai-engineering.taufiqueansari895.workers.dev` on Cloudflare version `4fcdb78b-b66b-480c-9535-5d40e8d8d6d1`; live Chrome audits confirm accounts, onboarding, personalized roadmaps, evidence mastery, spaced reviews, DSA/system-design/SQL/RAG labs, opt-in public portfolios, server-verified certificates, isolated code tests, project templates, cloud workspace snapshots/progress persistence, contextual Forge AI, deep lessons, interactive examples, focused learning, console health, and 390px overflow safety.
- Preserve the current visual identity while improving architecture and real behavior.
