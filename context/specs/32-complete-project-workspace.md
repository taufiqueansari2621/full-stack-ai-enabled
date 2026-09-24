# Complete Project Workspace

## Outcome

Each guided project is a working engineering environment rather than a static
instruction card. The project surface owns its brief, structured planning,
tasks, evidence, and progress; its linked coding workspace owns files, editing,
preview, tests, AI mentoring, cloud snapshots, and export.

## Brief coverage

The project brief explicitly covers problem, requirements, user stories,
architecture, data model, API design, security requirements, accessibility,
performance requirements, milestones, tasks, acceptance criteria, tests,
deployment, documentation, and retrospective.

## Verification

- `tests/project-workspace.test.ts` enforces all 16 sections and
  project-specific guidance.
- The local browser regression opens P05, verifies all 16 rendered sections,
  then completes a task and confirms persisted progress.
- The production browser gate verifies the same complete brief against the
  deployed Worker.
- Verified production version:
  `7f5d5e61-e375-428e-b5e8-fa74eb3fe324`.
