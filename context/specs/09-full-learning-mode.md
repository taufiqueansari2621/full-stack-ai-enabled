# Unit 09: Full Learning Mode

## Goal

Open every catalog topic and authored foundation lesson directly as one
complete learning page instead of requiring a second subtopic/task selection.

## Experience

- Topic selection opens Full Learning Mode immediately.
- All concept chapters appear in their intended sequence on the same page.
- Foundation lessons expose their complete goal, vocabulary, tutorials,
  mistakes, exercises, knowledge check, and interview revision continuously.
- Each chapter contains an explanation, concrete example, and immediate task.
- The page continues into visual models, Deep Dive, Mastery Studio, deliberate
  practice, checkpoint, notes, interview preparation, and revision.
- Previous and Next move between complete topics rather than internal chapters.
- The related-topic rail remains available for phase-level orientation.
- Authored lessons opened from a roadmap phase provide an in-app back control
  that restores that exact phase page; direct lesson visits fall back safely to
  the complete roadmap.

## Acceptance Criteria

1. No catalog or foundation lesson renders the former internal topic picker.
2. Authored topics render every authored chapter; generated topics render every
   generated concept chapter.
3. Selecting a related topic opens its complete learning page directly.
4. The learner's position records Full Learning Mode rather than a selected
   internal chapter.
5. Keyboard access, mobile layouts, and topic completion remain functional.
6. Lint, build, and the isolated-origin browser smoke test pass.
7. Returning from an authored lesson restores the phase/module page that
   launched it instead of losing roadmap context.
