# Unit 14: Plain-English Experience

## Goal

Make every active Forge workspace understandable to a learner who is starting
from zero, without removing advanced technical content or changing its meaning.

## Writing Rules

- Use familiar words for product actions: `saved work`, not `artifact`;
  `course`, not `curriculum`; `score guide`, not `rubric`.
- Keep required technical terms such as DNS, API, React, RAG, and Big O, but
  explain each term in the lesson before expecting the learner to use it.
- Prefer short sentences, active voice, and one clear action per instruction.
- Say what the learner should do and what success looks like.
- Avoid motivational claims that hide how progress is calculated.
- Use the same words for the same actions across lessons, practice, projects,
  quizzes, interviews, and progress.

## Scope

- Welcome, local profiles, navigation, search, settings, and dashboard.
- Roadmap and framework choice.
- Authored and generated lesson shells, Deep Dive, and skill-level work.
- Practice, notes, projects, interviews, reviews, progress, quizzes,
  certificates, and Resource Academy.
- Shared phase descriptions and generated task instructions.

## Acceptance Criteria

1. Primary navigation uses direct labels a new learner can understand.
2. Active pages avoid unexplained product jargon such as `artifact`,
   `evidence`, `rubric`, `calibration`, and `falsifiable`.
3. Advanced technical names remain accurate and are taught in context.
4. All existing interactions, stored IDs, route IDs, and completion rules stay
   unchanged.
5. Desktop and mobile layouts have no new overflow or console errors.
6. Lint, production build, smoke tests, and a plain-language copy audit pass.

## Verification

- `npm run build` passes.
- `npm run lint` passes with no warnings.
- `npm run test:smoke` passes the complete local learner flow, 78 primary
  responsive checks, six focused lesson viewport checks, and the plain-English
  phrase audit.
- Cloudflare production verification passes for the root, direct SPA routes,
  lazy-loaded resources, focused learning shell, browser console, and 390px
  mobile overflow.
