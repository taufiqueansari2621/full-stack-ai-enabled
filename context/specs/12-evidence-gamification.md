# Evidence-Based Gamification

## Outcome

Give learners restrained motivation through explainable XP, levels, milestones,
and badges that represent meaningful work rather than page views or repeated
submissions.

## Rules

1. XP is derived from unique stored evidence; aggregate XP in legacy state is
   not authoritative.
2. Repeating the same lesson, challenge, project step, assessment, lab, or
   saved-learning record cannot repeatedly increase derived XP.
3. Badges unlock only from inspectable evidence such as a solved challenge,
   corrected mistake, project work, successful recall, lab evidence, or an
   interview response.
4. Levels use named thresholds and show progress toward the next level.
5. The dashboard explains the source of progress and gives one concrete next
   milestone without manipulative countdowns or loss framing.
6. Existing learner state remains backward-compatible and cloud-syncable.

## Acceptance Criteria

- The dashboard displays current evidence XP, named level, next-level progress,
  unlocked badge count, visible badge requirements, and the next milestone.
- Sidebar and profile settings use the same domain-derived level and XP.
- A repeated attempt for the same challenge does not increase derived XP.
- A correction from an incorrect to a correct attempt unlocks the debugging
  badge.
- No activity is awarded for navigation or opening a page.
- The flow passes lint, production build, browser persistence/reset coverage,
  responsive checks, and production deployment verification.
