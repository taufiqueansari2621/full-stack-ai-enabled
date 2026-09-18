# Unit 15: Interactive Professional Lessons

## Goal

Turn long generated lessons into a clear, varied learning experience that
teaches, demonstrates, asks the learner to predict, and connects the topic to
real work without repeating the same example.

## Learning Experience

- Keep the continuous Complete Lesson and course-topic-only navigation.
- Give each generated section a distinct job: explain, show a process, guide a
  build, debug, test, improve safety and speed, use in real work, and prepare
  for an interview.
- Never repeat the same example merely to fill several sections.
- Add an interactive example lab to every catalog lesson with normal,
  unusual, and failure cases.
- Require a prediction before revealing the expected result and explanation.
- Save completed example cases per learner and topic without treating them as
  automatic topic completion.
- Deeply author the reported `npm and package management` lesson from beginner
  setup through lockfiles, scripts, safe updates, debugging, and supply-chain
  safety.

## Responsive Behavior

- Keep the topic rail compact on desktop and make it independently scrollable.
- Let the learner hide or show the rail without leaving the lesson.
- Wrap long teaching examples and code safely within the lesson card.
- Keep the horizontal course-topic rail on tablet and mobile.
- Prevent page-level and component-level horizontal clipping from 320px to
  wide desktop screens.

## Acceptance Criteria

1. `npm and package management` shows distinct, topic-specific lesson parts.
2. Every catalog topic has three interactive example cases with prediction,
   reveal, explanation, and saved completion.
3. Example work survives refresh and remains isolated by learner profile.
4. The course-topic rail can be hidden on desktop and remains usable on mobile.
5. Long example text wraps without hiding content.
6. Existing lesson completion, practice, notes, framework choice, and back
   navigation continue to work.
7. Lint, build, browser smoke, responsive checks, and live Cloudflare
   verification pass.

## Verification

- `npm run lint` passes with no warnings.
- `npm run build` passes and keeps the initial production chunk below Vite's
  size advisory threshold.
- `npm run test:smoke` passes the complete learner workflow, including unique
  npm sections, example prediction/reveal/save, profile persistence, reset,
  course-rail hide/show, 78 primary responsive checks, and six focused lesson
  viewport checks.
- Real Chrome screenshots at 1470×956 and 390×844 confirm the active topic is
  visible, the lesson uses the full canvas, example tabs stack on mobile, and
  long teaching examples remain inside their cards.
- Published to Cloudflare version `088d9b04-f1d1-4c43-ac2f-900e301bd616`.
  The live Chrome audit passed SPA routing, the 11-part npm lesson, three
  interactive cases, official resources, focused mode, course-rail controls,
  console health, and 390px overflow safety.
