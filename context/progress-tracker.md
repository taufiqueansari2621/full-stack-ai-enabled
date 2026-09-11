# Progress Tracker

Update this file after every meaningful verified implementation change.

## Current Phase

- Phase 1: Interactive local-first product prototype.

## Current Goal

- Convert the visually complete prototype into a maintainable application with real local learning state and complete primary navigation experiences.

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

## In Progress

- None. The next unit is ready to begin.

## Next Up

1. Unit 01: decompose the application shell and add a global error boundary.
2. Unit 02: introduce domain types and a versioned learner-state repository.
3. Unit 03: replace placeholder practice, knowledge, progress, and mentor views with complete local experiences.

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
- Only theme preference is persisted; other progress values are illustrative.
- Several navigation workspaces are informative placeholders rather than complete workflows.
- No automated component or domain tests exist yet.

## Session Notes

- Latest verified state: `npm run lint` and `npm run build` pass.
- Headless Chrome confirmed that the dashboard mounts after the startup fix.
- Preserve the current visual identity while improving architecture and real behavior.

