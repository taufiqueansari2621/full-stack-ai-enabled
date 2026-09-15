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

## In Progress

- None. The next unit is ready to begin.

## Next Up

1. Decompose legacy prototype-only components out of `src/App.tsx`.
2. Add focused component and state-repository tests alongside the browser smoke coverage.
3. Design the account-sync migration while keeping the local-first experience available offline.

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

- Latest verified state: `npm run lint`, `npm run build`, and `npm run test:smoke` pass.
- Headless Chrome confirmed the core learning workflows and local persistence work at desktop and mobile widths.
- Preserve the current visual identity while improving architecture and real behavior.
