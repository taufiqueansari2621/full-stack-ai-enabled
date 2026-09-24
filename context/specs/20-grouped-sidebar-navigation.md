# Grouped Sidebar Navigation

## Outcome

The global Forge sidebar presents the large workspace map as clear Learn,
Practice, Build, Review, and Career groups while preserving every route, active
state, due-review count, learner status, weekly goal, mobile drawer, and focused
learning behavior.

## Requirements

- Keep one typed source of truth for navigation labels, icons, and route IDs.
- Render semantic, labelled navigation groups in this order: Learn, Practice,
  Build, Review, Career, then Help.
- Mark decorative navigation icons as hidden from assistive technology.
- Keep the navigation region independently scrollable at short viewport heights
  so learner and weekly-goal controls remain reachable.
- Do not render the global sidebar inside focused learning mode.
- Preserve mobile drawer closing and desktop active-route behavior.

## Verification

- TypeScript, ESLint, and production build
- Browser assertion for group order, navigation label, and scroll behavior
- Existing 90 responsive workspace checks and six focused lesson checks
- Live production verification after deployment
