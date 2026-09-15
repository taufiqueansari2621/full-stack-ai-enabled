# Progress Tracker

Update this file after every meaningful verified implementation change.

## Current Phase

- Phase 2: Verified local-first learning system.

## Current Goal

- Make every primary learner journey useful, persistent, and testable without requiring an account or backend.

## Completed

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

## In Progress

- None. The next unit is ready to begin.

## Next Up

1. Fully populate Orientation and Web Fundamentals, then expand JavaScript lesson depth and practice coverage.
2. Decompose legacy prototype-only components out of `src/App.tsx`.
3. Add focused component and state-repository tests alongside the expanded browser smoke coverage.

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
- Local state is intentionally browser-only; account sync, backups, and multi-device conflict handling are future work.
- Browser smoke coverage exists; focused component and state-repository tests are still needed.

## Session Notes

- Latest verified state: profile onboarding, logout/login restoration, learner-scoped persistence, and mobile layout are covered by the browser smoke flow.
- Headless Chrome confirmed the core learning workflows and local persistence work at desktop and mobile widths.
- Preserve the current visual identity while improving architecture and real behavior.
