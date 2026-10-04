# Progress Tracker

## 2026-10-04 — Gmail verification and email recovery

- Added fixed-host TLS Gmail submission using the existing server-only
  `GMAIL_APP_PASSWORD` secret; no secret values read or paid provider enabled.
- Additive migration 0012 is applied locally and remotely after production
  Time Travel bookmark
  `0000003f-00000000-000050fa-86b23018ccb0292c5f9a9773b6b04f8c`.
  Tokens are hashed, expiring, purpose-bound and atomically single-use. Password
  reset revokes sessions and rotates recovery codes; old code recovery remains.
- Added authenticated verification status/resend, verification on registration,
  Turnstile-protected anonymous reset requests/confirmation, atomic owner/hour
  and global/day email caps, fixed canonical fragment links and explicit
  confirmation. Reset mail runs in waitUntil to avoid exposing SMTP timing.
- Local full gate passes: 32 Node + 145 Vitest tests, lint, strict build and
  bundle budgets (entry 471.1 KiB; total 763.0 KiB; CSS 149.1 KiB).
  Actual local Worker Chrome tests pass verification, scanner-safe visits,
  fragment stripping, expiry, replay, reset, revoked session, new-password
  login, keyboard and 375/768/1280/1440px layouts. Synthetic fixtures removed.
- Broad account smoke reached AI lab execution but failed on an upstream
  non-JSON Cloudflare response; that full AI regression is not a pass.
  Provider SMTP acceptance, inbox receipt and human production email/Turnstile
  acceptance remain unverified at this checkpoint. Deployment follows.
- Optional OAuth registrations and an approved isolated private multi-language
  judge remain external prerequisites; the whole product is not claimed 100%.
- Implementation `d2ef7f9` is pushed; Worker
  `260b63c8-7af8-4107-8460-3e958dd64acd` is deployed. Live public/PWA/offline
  and account challenge rejection checks pass. The one-message SMTP probe
  returned `503 MAIL_UNAVAILABLE`, not provider acceptance. Its exact synthetic
  account and cascading records were removed; no existing learner was used.
- Follow-up validates app-password structure without exposing its value and
  logs only allowlisted failure-stage codes for future troubleshooting, never
  provider replies, addresses, tokens or credentials. No automatic mail retry.
  Local test repeat runs isolate synthetic IP quotas; the legitimate ten/hour
  consume limit had blocked a repeat run. Inbox delivery is still not complete.

## 2026-10-04 — Managed recovery drill

- Created an unbound synthetic-only D1 database and applied all eleven current
  migrations. Actual Cloudflare Time Travel restore returned the fictional
  account, profile, note, completed topic and workspace; seven triggers,
  foreign-key check, quick_check and a post-restore projection write passed.
  Restore plus checks: 9,738ms. See the exact bookmarks and correction history
  in `docs/operations/release-2026-10-04-recovery.md`.
- Guarded operator script rejects production/name/UUID/account mismatches,
  nonempty tables and incomplete output. Dedicated binding-free configuration
  targets only a validated UUID. No production learner records or exports,
  billing change, app deployment or production migration.
- Scratch UUID `af3efec1-361e-48ee-b4dc-c81574d8be60` remains unbound with only
  fictional fixtures, pending exact-ID cleanup. Earlier empty bootstrap tables
  and the incorrect fictional fixture were removed only from this scratch DB.
- Live production/public/PWA/offline/security-header/browser regression passes;
  existing visual application and Worker release are unchanged. Local full gate
  passes: 32 Node + 128 Vitest tests, lint, strict production build and all bundle
  budgets. Git synchronization is retried at handoff; prior documentation-only
  push was blocked by macOS credential access.
- Email needs authorized sending (Gmail OAuth/transport or verified provider),
  optional OAuth needs registered clients, and private Python/backend judging
  needs an approved isolated host. These external integrations are not complete.

## 2026-10-03 — Opt-in field performance monitoring

- Added default-off browser-local Settings consent, lazy standard web-vitals
  measurements, credential-free bounded reporting and immediate opt-out.
- Same-origin strict collector logs only coarse client-reported measurements,
  using existing IP-hash quotas; no metric table, migration or paid service.
- 27 Node tests + 128 Vitest tests pass. Lint, production builds, bundle gates
  and npm audit pass (zero vulnerabilities). Entry JS 465.9 KiB, total app JS
  757.8 KiB; separate vitals chunk 5.26 kB raw.
- Production-style Chrome emitted real native INP/CLS samples accepted by the
  local Worker. Default off, reload-to-enable, cookie/referrer omission, strict
  payload keys, keyboard checkbox, immediate opt-out, persisted off and
  375/768/1280/1440px layout passed without page errors. Existing full learner
  regression also passed 90 responsive and six focused lesson checks.
- Spec 44 and runbook document sampling, provider metadata, Free log limits
  and December pricing re-check. These samples do not prove population p75.
- Implementation commit `2f93d12` is pushed and deployed on Worker
  `1bcfdffb-8d3d-4aca-9c21-28b2c4f81040`. Live native LCP/INP/CLS each received
  HTTP 200, and filtered tail confirmed the custom event without exposing
  request metadata. Live public/PWA/offline and Turnstile checks pass.
- Screenshot review caught inherited modal styles; a scoped follow-up adds
  horizontal checkbox layout and readable 14/12px copy, guarded by actual
  computed-style browser assertions. Final follow-up version recorded below.
  Commit `770608f` is pushed and final Worker
  `ef1afda1-ced2-43db-b951-cc6653cbe792` is live. Final production browser flow,
  opt-out, readable text/horizontal checkbox and all four widths pass; refreshed
  screenshot captured. Transient network push/upload failures resolved on
  retry; no data or billing change. CSS 148.4 KiB remains within budget.
  Email sender, optional OAuth, isolated private judge and D1 restore drill
  remain separate work; no claim of 100% completion.

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
- Deployed evidence analytics and the skill matrix as Cloudflare Worker version `cbc0b1fa-c2f0-406d-b857-959f6d44d521`; the strengthened feature suite and live SPA/console/mobile audit both pass.
- Replaced the static search dialog with a lazy multi-source index over authored lessons, all catalog topics, projects, interview topics, the trusted resource catalog, learner notes and code snippets, and saved lab evidence.
- Added eight Cmd/Ctrl+K commands for continuing learning, opening the workspace, starting review, asking Forge AI, creating a project, opening notes, practising weak skills, and starting an interview without pulling the heavy search datasets into the initial bundle.
- Replaced the fake notification badge with evidence-derived notifications for due reviews, active project milestones, stale SQL evidence, and an old saved lesson position; the notification center explains each next step and remains empty when nothing needs attention.
- Deployed global search, command actions, and evidence notifications as Cloudflare Worker version `fcb76b0a-f948-4b6d-952f-6276857b8b3f`; the complete interaction suite and live SPA/console/mobile audit pass.
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
- Rebuilt My Notes as Notes 2.0 with safe Markdown and fenced-code rendering, editable comma-separated tags, topic/project links, search, favorite filtering, flashcard conversion, review-queue actions, and authenticated note-aware Forge AI requests.
- Added distinct learner-scoped review records for concept and flashcard conversions, preserved local-profile isolation, and verified Notes 2.0 through lint, a production build, and the complete browser regression suite with 90 responsive workspace checks and six focused lesson viewport checks.
- Added installable PWA metadata and a same-origin service worker with a versioned app-shell cache, network-first navigation fallback, stale-while-revalidate static assets, automatic activation, and safe exclusion of authenticated API traffic.
- Added global offline status for local and authenticated learners, preserved edits through the existing learner-scoped cache, stopped failing sync retry loops, retried pending progress on reconnect, and exposed explicit use-cloud/keep-device conflict recovery actions.
- Verified the offline status and all existing learner workflows through lint, a production build, and the complete browser regression suite before deployment.
- Added a pure evidence-gamification domain that derives XP from unique solves, lessons, project steps, reviews, assessments, explanations, labs, interviews, and certificates instead of trusting a mutable aggregate.
- Added seven named progression levels, six inspectable badges, next-level progress, and a concrete next milestone to the dashboard, sidebar, and learner profile without rewarding page views or repeated submissions.
- Verified correction-based badge unlocking, repeated-success XP protection, logout/login persistence, learner reset, and responsive dashboard rendering in the complete browser suite.
- Added an application-level render error boundary with a calm recovery screen, saved-work reassurance, and a reload action; the browser suite now proves the fallback with an isolated localhost-only crash probe.
- Added privacy-conscious structured Worker telemetry with correlation IDs, route/status/duration fields, slow-route warnings, failed-authentication events, AI failure events, and unhandled-error classification without logging request bodies or learner content.
- Added D1 latency to health checks, Server-Timing and request-correlation response headers, a restrictive production CSP, HSTS, cross-origin opener protection, and persisted Cloudflare logs/traces with query-string redaction.
- Moved dynamic learner-code compilation out of the main application policy and into a dedicated external runner Worker whose response alone permits evaluation; the runner disables network APIs and remains bounded by termination and output limits.
- Routed static assets through the Worker so production security and correlation headers cover the application shell instead of only API responses.
- Added a requirement-by-requirement Forge 2.0 completion audit that distinguishes verified, partial, and pending capabilities and records the external provider inputs required for the remaining scope.
- Added focused Node unit tests for evidence-derived gamification, request JSON/origin boundaries, password hashing, secure session cookies, and D1 migration ordering/critical tables.
- Added a GitHub Actions quality workflow and a single `npm test` gate covering unit tests, ESLint, strict Worker/client TypeScript, and the Vite production build; all nine focused tests and the complete local quality gate pass.
- Added a canonical `/api/v1` namespace while retaining every `/api` compatibility path, API version/discovery headers, and a machine-readable OpenAPI 3.1 contract that covers every registered Worker route and method.
- Expanded the focused suite to 12 tests with API-version normalization, OpenAPI route-coverage, and cacheable contract checks; added live verification for the version header, discovery link, and production contract.
- Added an operator runbook for release gates, sensitive D1 exports, isolated restore drills, schema-compatible Worker rollback, incident triage, and API compatibility policy.
- Deployed the versioned API and operational hardening unit as Cloudflare Worker version `d0122bf7-ccbd-487c-a7cc-cb15a15ed9ae`; the live PWA/security/contract/browser audit and full authenticated account, AI, workspace, portfolio, certificate, recovery, sync, and authorization lifecycle both pass.
- Reorganized the global sidebar into a primary Home destination and semantic Learn, Practice, Build, Prepare, Personal, and Help groups from one typed route source; added independent short-viewport scrolling, assistive-technology-safe icons, and browser assertions without changing focused learning or mobile drawer behavior.
- Deployed and verified the grouped sidebar as Cloudflare Worker version `1f707c45-0ff9-4c84-ac38-78b145ca3e8e`; the complete local regression and live OpenAPI/security/PWA/navigation/lesson/project/mobile audit both pass.
- Added a shared keyboard-focus boundary to settings, search, notifications, note forms, project creation, and workspace version history, including deterministic initial focus, bidirectional Tab wrapping, Escape close, and opener focus restoration.
- Added browser assertions for dialog focus containment/restoration while preserving every existing learner workflow, 90 responsive checks, and six focused lesson checks.
- Deployed and verified accessible dialog focus as Cloudflare Worker version `5cf5db66-5674-4a30-95b1-19e5a3dcb620`; the production gate proves focus containment and restoration alongside all existing OpenAPI, security, PWA, navigation, lesson, project, console, and mobile checks.
- Added a dependency-free production bundle gate that resolves the hashed Vite entry files and enforces raw-size ceilings for entry JavaScript, entry CSS, the largest lazy JavaScript chunk, and total JavaScript; `npm test` and CI now fail on a regression.
- Aligned the grouped sidebar with the original product brief: standalone Home followed by Learn, Practice, Build, Prepare, Personal, and Help, while preserving every route and accessibility behavior.
- Deployed and verified the navigation/performance release as Cloudflare Worker version `5b8ca2fc-7423-48dd-8513-c9fbf8557271`; entry JavaScript is 451.3 KiB, entry CSS 145.6 KiB, the largest lazy chunk 111.3 KiB, and total JavaScript 681.8 KiB, all below their enforced budgets.
- Turned every specified coding-workspace AI response action into a real operation: simpler, deeper, example, quiz, practice, related lesson, copy, and regenerate; added explicit request cancellation and unmount abort without weakening server-side context, rate, or usage controls.
- Deployed the complete AI response-action unit as Cloudflare Worker version `beab97d0-431c-4689-8c9f-4dfdae375e40`; both the public production gate and authenticated lifecycle with a real Workers AI answer and all eight visible actions pass.
- Added a typed `CodeRunner` boundary with a constrained `BrowserRunner`, an explicit `RemoteSandboxRunner` for Python/Node/TypeScript, file-derived language selection, and focused tests proving unsupported languages never fall through to fake or primary-Worker execution.
- Expanded New Project to capture description and goals and generate Blank, HTML/CSS/JavaScript, React, Angular, Node.js, Full Stack, Python, and AI/RAG starter workspaces.
- Deployed the runner/project-creation unit as Cloudflare Worker version `defe54da-252d-4cae-b661-d0effa2f16df`; the public production gate and authenticated lifecycle verify the exact starter list, description/goals fields, isolated JavaScript tests, cloud persistence/history, AI, privacy, certificates, recovery, and authorization.
- Added Vitest DOM coverage for the application recovery boundary and a focused Forge API repository suite that verifies authenticated JSON workspace persistence and structured unauthorized failures.
- Expanded the mandatory `npm test` and CI quality gate to run all 14 Node unit/API/security/migration/runner tests plus four repository/component tests, ESLint, strict client/Worker builds, and production bundle budgets. The full gate passes locally.
- Deployed and live-verified the testing-architecture release as Cloudflare Worker version `4df78778-8421-4417-9502-1cc74c1455d0`; production PWA/offline, OpenAPI, security headers, sidebar, dialog focus, gamification, deep lessons, interactive examples, project controls, focused learning, console health, and mobile-overflow gates pass.
- Added legitimate embedded video learning for matching lessons using YouTube's privacy-enhanced domain, with direct-source fallbacks and CSP restricted to that frame host.
- Normalized every resource record with topic, difficulty, duration, resource type, last-reviewed date, and quality status; added reviewed JavaScript, event-loop, Cloudflare Workers, and Workers AI videos without copying third-party media.
- Expanded component tests and the complete browser regression to verify resource metadata, video embedding, responsive rendering, and fallback links. All 14 Node tests, six Vitest tests, lint, strict builds, bundle budgets, and the full browser suite pass locally.
- Deployed and live-verified video learning as Cloudflare Worker version `6e0544c9-602d-4829-9716-1ed4a2f3d96c`; the production gate proves the restricted frame CSP, privacy-enhanced Event Loop embed, reviewed metadata, direct fallback, PWA/offline behavior, security headers, deep lessons, focused learning, console health, and mobile-overflow safety.
- Added a typed, test-enforced state matrix for every dynamic product surface, recording loading, empty, error, retry, and appropriate offline behavior with concrete UI evidence.
- Reworked public portfolios into explicit loading, unavailable/private, offline, temporary-server-error, retry, and ready states with request cleanup, accessible announcements, preserved privacy, and reduced-motion-safe feedback.
- Expanded the focused gate to 14 Node tests plus 10 Vitest repository/component/state tests; lint, strict builds, and production bundle budgets pass.
- Deployed and live-verified the dynamic-state release as Cloudflare Worker version `7d56d90a-3150-4c4d-82d8-71e8cdcf6dec`; the production gate proves the public-profile unavailable state alongside video CSP, PWA/offline, API/security, focused-learning, project, console, and mobile checks.
- Re-audited the exact Forge 2.0 wording and corrected three over-scoped statuses: AI Tutor 2.0, evidence-based personalization, and incremental frontend refactoring are complete without requiring unrequested streaming/Vectorize, a separate recommendation microservice, or a risky wholesale source rewrite.
- Rebuilt the DSA visualizer around a typed 13-trace domain covering every structure and algorithm named in the brief: arrays, linked lists, stacks, queues, hash maps, trees, graphs, sorting, binary search, recursion, BFS, DFS, and dynamic programming.
- Added Previous, Next, Play, Pause, and Reset behavior plus explicit data-structure state, variables, call stack, current operation, time, and space; focused catalog tests and the full responsive browser suite pass.
- Deployed and live-verified the complete DSA visualizer as Cloudflare Worker version `ae46d889-7388-47f5-8462-43ddc2e3260d`; production proves all 13 traces and controls alongside the complete PWA, API, security, lesson, video, project, console, and mobile gate.
- Expanded System Design into all seven specified practice scenarios with typed briefs and connected starter flows: URL Shortener, Chat, Notifications, E-commerce, Video, Search, and AI RAG.
- Preserved the complete 12-component palette, added accessible node removal and scenario reset behavior, and enforced all scaling, availability, consistency, security, failure, cost, and trade-off prompts through focused tests and the full browser suite.
- Deployed and live-verified the complete System Design lab as Cloudflare Worker version `81fb07da-f767-40c8-b30a-8660feee8cf8`; production proves all seven scenarios, 12 components, connected starter flows, and explanation prompts within the full release gate.
- Expanded SQL Lab into ten inspectable topics—SELECT, WHERE, JOIN, GROUP BY, subqueries, CTEs, window functions, indexes, transactions, and query optimization—with an editable query, three-table schema, bounded validation, tabular results, explanations, and query plans.
- Added focused SQL domain tests plus local and production browser assertions for exact topic/schema coverage and real query-result state. All 14 Node tests, 16 Vitest tests, lint, strict builds, bundle budgets, and the complete responsive browser regression pass.
- Deployed and live-verified the complete SQL Lab as Cloudflare Worker version `5dd0e1d4-e970-4a7a-9f2d-8f28d61d374e`; production proves all ten topics, schema inspection, query execution, results, explanations, and plans within the full release gate.
- Expanded the AI engineering workspace into all nine labs named in the brief: Prompt, Embedding Explorer, Chunking, Semantic Search, Vector Retrieval, RAG Pipeline, Tool Calling, Agent Workflow, and Evaluation.
- Added bounded, inspectable experiments with explicit pipeline steps, challenges, results, and latency, token usage, retrieval quality, context size, model cost, and evaluation score telemetry. Focused tests and both browser gates enforce exact coverage.
- Deployed and live-verified the complete AI/RAG Lab as Cloudflare Worker version `cac994e3-c382-446a-9f0d-8a51df77e90d`; production proves all nine labs, experiment execution, telemetry, evidence workflow, and responsive behavior.
- Completed the project workspace contract with a project-specific brief covering all 16 required engineering sections, dedicated tasks, documentation and retrospective guidance, progress, and the existing linked files/editor/preview/tests/AI/snapshot/export environment.
- Added typed project-brief coverage tests and browser assertions for the complete section set. All 14 Node tests, 21 Vitest tests, lint, strict builds, bundle budgets, the full local regression, and the production gate pass.
- Deployed and live-verified the complete project workspace as Cloudflare Worker version `7f5d5e61-e375-428e-b5e8-fa74eb3fe324`.

## In Progress

- October 3 manual acceptance: after the live sign-in screenshot was provided
  and Forge opened in the user's normal Chrome browser, the user reported
  "succeeds" for the instructed security-check/account test. Record this as
  user-reported successful manual acceptance, separate from automated provider
  rendering/rejection checks. Human challenge testing is no longer a blocker;
  no claim is made that every registration/recovery variant was manually tested.
  Email/provider setup and private multi-language judging remain incomplete.

- October 3 public test diagnostics: JS/TS workspace cases now show input,
  expected/actual results, bounded errors and pass/fail/not-run states. Worker
  payload validation rejects malformed/oversized results before UI state;
  counts derive from the three public cases. A versioned runner URL prevents
  stale offline cache entries mixing message protocols. 27 Node + 91 Vitest
  tests, lint/build/budgets, full responsive learning regression, dedicated local
  diagnostic cases and production-style editor/TypeScript regression pass.
  Early browser attempts exposed a test label/lazy-mount timing mismatch and a
  development-server compiler timeout; corrected diagnostics and built-runtime
  checks pass. Live diagnostics (including intentionally stale cached runner),
  public/PWA/security regression and managed-widget/missing-token checks pass
  on Worker `b057958b-3d8d-40ca-9619-5b5c0dca7a99`. No migration, provider,
  inference call or paid service. Audit remains 58 complete, 3 partial areas;
  private judging, provider credentials/email sender, and human challenge
  completion are not claimed. See the release record for unresolved inputs.

- October 3 toolchain hardening: pinned Wrangler 4.147.0 and updated its locked
  runtime dependencies plus brace-expansion 5.0.12. Full npm audit now reports
  zero vulnerabilities, resolving all four prior development-tool findings.
  Reverified 21 Node + 91 Vitest tests, lint, strict builds, bundle budgets,
  Wrangler deploy dry run, and local real session-revocation/security browser
  flows. No broad audit fix, application dependency update, migration or new
  production deployment was needed; live security release remains unchanged.

- October 3: free hostname-restricted managed Turnstile is deployed as Worker
  `eeab0d3c-bb95-4c39-ac1f-f870e526b5cd`. Registration, login and recovery enforce
  bounded tokens, exact host/action checks and a ten-second provider deadline;
  failures close safely. Secrets are stored directly in Cloudflare, never source
  or browser config. The account UI handles load, expiry, retry, cleanup and
  fresh tokens after every attempt. Local gate: 21 Node + 91 Vitest tests,
  lint/build/budgets, mock-client browser checks and full responsive regression
  pass. Live real widget rendering, missing-token rejection on all three routes,
  four account viewport widths, PWA/public/security and framework-isolation
  regressions pass. Human challenge completion is not asserted. Email delivery
  is deferred per user until a sender domain is available; optional OAuth and
  a private multi-language judge remain incomplete. Audit stays 58 complete,
  3 partial broad areas. No paid services, database migration or AI calls.

- September 30 framework previews: real local React JSX/TSX and Angular
  standalone JIT previews now render and update state/signals in an opaque
  iframe. Local module/style/template resolution, package allowlisting,
  compile errors, rebuild/stop, stale-output removal, and parent/fetch isolation
  pass the dedicated local browser suite at four widths. 21 Node + 70 Vitest
  tests, lint/build/budgets pass. No production dependency advisories reported.
  No containers, external package CDN, paid services, or AI calls were used.
  Canonical static URL redirect handling was corrected before release.
  Deployed as Worker `20b3723e-ab8b-4cb3-ac1b-5cd6306da450`; dedicated live
  React/Angular and public/PWA/security checks pass, as does the complete local
  responsive regression. Preview documents/assets bypass service-worker caching.
  Full npm audit reports four dev-tool findings; production-only audit is clean.

- September 30 free-only continuation: Git push succeeded and all six prior
  commits are synchronized through `f4a566d`. Added bounded owner-scoped active
  session listing and confirmed targeted/all-other revocation, protecting the
  current session. Existing D1 schema only, no paid service or migration.
  Local gate: 21 Node + 66 Vitest tests, lint/build/budgets and dedicated browser
  checks pass, including actual second-context denial after revocation and four
  viewport widths. No AI inference is invoked by the dedicated session suite.
  Deployed as Worker `34af2a52-addc-40c8-8694-1bf011d5489f`; live session
  revocation and public/PWA/security regressions pass. Audit remains 57 complete,
  4 partial chapters; this closes a security subtask, not all provider gaps.

- September 30 project/interview records: additive migration 0011, owner-scoped
  paginated read repositories, stable new interview-session IDs, and a lazy
  cloud-records view are implemented. Legacy answers remain individual records.
  Local verification passes 21 Node + 60 Vitest tests, lint, strict builds,
  bundle budgets, and the full responsive browser regression. The account suite
  passed after restarting the overnight local Worker connection. Migration 0011
  is applied remotely after recording a managed recovery bookmark (no export).
  Worker `3bc0694e-d9e1-4b4c-98a6-2e8111912201` passes production public/PWA/
  security checks and authenticated account/AI/records/mobile checks. Audit:
  57 complete, 4 partial areas; GitHub authentication remains a push blocker.

- September 29 AI decisions: implemented authenticated plan/answer/evaluate,
  schema-constrained read-only tool choice, evidence-empty abstention, explicit
  stop, and groundedness review with exact quote-presence checks. Local baselines
  remain available. Local tests pass 18 Node + 57 Vitest, lint/build/budgets,
  full responsive browser regression, and real-model account checks. Plain JSON
  initially failed output validation; schema constraints on the existing fast
  model pass. An alternate model returned a provider error and was not retained.
  Production release `c86797cc-a4ae-4dfd-b91d-9c3bf112b16b` passes public
  PWA/security/route checks and authenticated real-model checks for embeddings,
  RAG with claim review, tool selection, agent answers, and evaluation. Preserved
  offline-baseline coverage brings the local gate to 18 Node + 57 Vitest tests.
  Audit: 56 complete, 5 partial. No new services or database migrations.

- September 29 editor completion: added create, file/folder rename/move,
  confirmed deletion and non-overwriting undo, plus compiler-backed JS/TS
  semantic suggestions and diagnostics. Corrected the TypeScript shortcut's
  20-file allowance to match the API's 12-file limit. Local verification passes
  18 Node + 46 Vitest tests, lint, strict builds, bundle budgets, the expanded
  real-browser editor flow, and all 90 responsive/six lesson regression checks.
  Deployed as Worker `ee0de99c-dc51-477f-99b9-939395dbea2b`; the expanded live
  editor suite and production PWA/security/route checks pass. Audit: 55 complete,
  6 partial areas. GitHub push remains blocked by missing usable authentication.

- September 29: standalone TypeScript execution and stale-result protection are
  deployed as Worker `7ef90281-2270-474d-82fb-ce2983367e32`. The live editor suite
  verifies compilation, rejected type errors, recovery, and edits during execution;
  the production route/PWA/security suite passes. Local gates pass 18 Node + 38
  Vitest tests, lint, strict builds, and bundle budgets. Audit: 54 complete and 7
  partial areas; this is not a claim of full specification completion.

- Standalone TypeScript compiler unit now passes semantic/syntax diagnostic and
  emission tests, real browser execution, type-error no-execution, recovery,
  responsive editor checks, and preservation of existing project files. The
  production-style Worker/browser test and a development-server rerun both pass;
  the initial development run timed out. Compiler assets load only on demand.

- September 29: deployed input-dependent AI experiments as Worker
  `4faf7405-7a1a-4795-b6b3-dfd912fb1b50`. Production account tests verify actual
  384-dimensional embeddings and grounded generation; public/PWA/security and
  real SQL regressions pass. Local gates pass 18 Node + 35 Vitest tests, lint,
  strict builds, bundle budgets, and the complete responsive browser suite.
- AI experiments now compute chunking, explicit validated read-only tool calls,
  and lexical F1 locally, or use authenticated Workers AI for embeddings,
  cosine-ranked retrieval and generation. Consent, shared quota, input/output
  validation, bounded batches, deadlines, and cancellation are explicit.
  Similarity is not quality; lexical F1 is not factual correctness; unknown
  charges are not fabricated. Autonomous tool selection and broader evaluation
  remain outside this bounded lab release, so the AI chapter stays Partial.

- Real SQL deployed and production-verified on September 28 as Worker
  `4ce762bf-d537-4f2b-b7f2-830ee1e3fbb2`. Dedicated live execution checks and
  public/PWA/security regression both pass. Audit: 53 complete, 8 partial areas.

- Real SQL unit: removed fixed keyword-matched results. SQLite WASM now runs in
  a disposable browser worker against a fresh three-table fixture. All ten
  topics execute, with real results, plans, errors, commit/rollback, bounded
  output, cancellation, and five-second termination. SQL never reaches D1.
- Verified 18 Node and 31 Vitest tests, lint/build/bundle budgets, all-ten-topic
  production-style browser checks, timeout/cancel recovery, four SQL viewport
  widths, and the full 90-responsive/six-focused regression. Runtime assets add
  684.3 KiB only on Run; initial application bundle remains 459.0 KiB.

- September 28 release verification: Worker
  `c3237c93-315f-4745-8cd6-dd825adb60f8` is serving production. Migration 0010
  is now applied remotely (27 commands); all three projection triggers and
  backfilled practice/topic rows were confirmed without reading private records.
- A fresh Cloudflare Time Travel bookmark provided managed recovery without the
  rejected sensitive local export. See `docs/operations/release-2026-09-28.md`.
  No database restore or private export was performed.
- Post-migration public/PWA/security browser checks, editor/project-note checks,
  and authenticated account/AI/recovery/privacy lifecycle all pass. Concurrent
  progress and workspace writes each produce one success and one stale-write
  rejection. The first account check timed out after registration; a rerun with
  explicit registration-response diagnostics passed. All 46 local tests, lint,
  builds, and bundle budgets also passed again.

- September 27: corrected the interrupted editor/challenge draft. Parser-based
  worker formatting preserves invalid/unsupported files and concurrent edits;
  syntax overlays and cursor snippets pass the dedicated browser check at
  1440/768/390/320px. Every quick-check screen opens; repeated answers no longer
  award mastery and saved learner explanations are required for Explained.
- Replaced the unused schema draft with eight populated domain projections and
  atomic progress/workspace revision checks. Backfill, isolation, reset, cascade,
  stale-write, and validation tests pass; migration 0010 applies to local D1.
- Current local gates pass: 18 Node tests, 28 Vitest tests, lint, strict builds,
  separate application/formatter bundle budgets, and full browser regression.
  Production migration, deployment, and live verification are recorded above.
- Corrected two previous audit overclaims: SQL and AI/RAG are currently authored
  walkthroughs with fixed example outputs, not real execution engines. They are
  marked Partial and labelled honestly in the interface. Current audit counts:
  52 complete, 9 partial. These counts do not measure engineering effort.
- Replaced the project guidance's toast-only Add entry action with editable,
  persisted notes linked to the project and section; existing progress sync
  carries them across devices.
- The earlier migration blocker is resolved through approved managed recovery
  metadata, not a local export. The production runbook now distinguishes
  additive migrations from destructive maintenance and sensitive exports.

- Closing the remaining repository-controlled Forge 2.0 gaps in risk order; external identity, email, sandbox, and video inputs remain explicitly separated from source-controlled work.

## Next Up

1. Continue topic-specific authoring for shared frontend, React, and Angular lessons, exercises, project artifacts, and assessment banks.
2. Add a constrained code runner and authored topic-linked test/assessment banks.
3. Add freshness metadata, learner bookmarks, and review workflows to the Resource Academy.
4. Decompose legacy prototype-only components out of `src/App.tsx`.
5. Expand the focused test gate with state-repository, load, and AI-evaluation coverage.

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
- Browser, account, production, domain, security-boundary, migration, API-contract, repository, and component coverage exists; state-repository, load, and AI-evaluation breadth can still grow.

## Historical Session Notes

For the current deployed version and September 28 migration verification, see
the release entry under In Progress above. The following notes describe earlier
releases; SQL/AI walkthrough completion claims are superseded by the audit.

- Latest implementation state: evidence-derived XP, levels, badges, and milestones; an installable offline-capable PWA with reconnect/conflict recovery; Notes 2.0 with Markdown/code rendering, tags, links, favorites, flashcards, review actions, and note-aware Forge AI; plus distraction-free Complete Lessons, hideable course-topic navigation, prediction-first interactive examples, deeper practice, five skill levels, React/Angular/Both paths, 684 topics, 74 trusted resources, curriculum-wide three-level topic practice, and plain-English learner copy.
- Headless Chrome confirmed Notes 2.0 persistence and review conversions, the Angular-only path, lesson resources, Resource Academy, Medium practice artifacts, logout/login restoration, clean reset, and every existing learner workflow.
- Lint, production build, all 90 responsive workspace checks, and six focused catalog-lesson viewport checks pass; feature-level lazy loading keeps the initial production chunk below Vite's advisory threshold.
- Production is live at `https://forge-ai-engineering.taufiqueansari895.workers.dev` on Cloudflare version `7f5d5e61-e375-428e-b5e8-fa74eb3fe324`; live Chrome audits confirm versioned OpenAPI discovery, exact-spec grouped and scroll-safe sidebar navigation, trapped/restored dialog focus, correlated health/database timing, main-document, video-frame, and isolated-runner CSP boundaries, security headers, evidence-derived gamification, installable PWA metadata, service-worker registration, cached offline navigation, reconnect-safe authenticated progress sync, accounts, onboarding, personalized roadmaps, global search and commands, evidence notifications, analytics and skill states, spaced reviews, complete project workspaces, 13-trace DSA, seven-scenario system-design, ten-topic SQL, and nine-mode AI engineering labs, Notes 2.0 note-aware AI context, opt-in public portfolios and explicit unavailable states, server-verified certificates, reviewed embedded video learning, typed runner boundaries, isolated code tests, all project starters, cloud workspace snapshots/progress persistence, contextual Forge AI with complete response actions, deep lessons, interactive examples, focused learning, console health, and 390px overflow safety.
- Preserve the current visual identity while improving architecture and real behavior.
