# Unit 12: Focused Learning Shell

## Goal

Give lessons the full application canvas and remove duplicate navigation while
the learner is actively studying.

## Behavior

- Entering any authored or catalog lesson activates Learning Focus Mode.
- Hide the global Forge sidebar, top bar, search, settings, and floating mentor
  while focus mode is active.
- Keep one lesson sidebar containing only course topics or lessons.
- Do not show a second subtask/chapter picker in the sidebar; the full lesson
  remains a continuous document.
- Preserve the visible lesson back action so the learner can return to the
  exact roadmap phase and recover the global workspace shell.
- On narrow screens, convert the course-topic sidebar into a compact horizontal
  rail above the lesson rather than forcing two narrow columns.

## Acceptance Criteria

1. Catalog lessons show no global `.sidebar`, `.topbar`, or floating mentor.
2. Authored lessons show the six course lessons instead of chapter/subtask
   navigation in the lesson sidebar.
3. Leaving the lesson restores global navigation immediately.
4. Desktop lesson content uses the released sidebar width.
5. Focus mode has no document-level horizontal overflow at 1440, 1280, 1024,
   768, 390, or 320 pixels in light and dark themes.
6. Lint, production build, and isolated browser smoke checks pass.

## Verification

- `npm run lint` — passed.
- `npm run build` — passed; initial JavaScript chunk remains below Vite's size advisory.
- `npm run test:smoke` — passed 78 primary responsive checks and six focused catalog-lesson viewport checks.
- Real Chrome screenshots reviewed at 1440px desktop and 390px mobile in dark/light themes.
