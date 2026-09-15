# Unit 02: Curriculum Hierarchy and Roadmap Navigation

## Goal

Represent the complete Full-Stack + AI journey as an ordered, typed phase/module/topic catalog and make the roadmap a functional curriculum entry point.

## Behavior

- Show all 16 prerequisite-ordered career phases.
- Open every phase into a module and topic view.
- Calculate phase and overall populated-course progress from learner completions.
- Open topics that have complete lessons and satisfy prerequisites.
- Disable unavailable topics with an explicit reason.
- Preserve a valid primary workspace URL across refreshes.

## Verification

- Roadmap phase and real lesson navigation work in the browser smoke flow.
- Local progress and reset behavior remain intact.
- Mobile layout has no horizontal overflow.
- Lint and production build pass.
