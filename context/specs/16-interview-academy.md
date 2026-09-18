# Unit 16: Interview Academy

## Goal

Replace the four-question JavaScript demo with a complete interview-preparation
workspace built from every topic in the Forge roadmap.

## Question Bank

- Cover all 684 catalog topics, including both React and Angular.
- Provide 15 questions for every topic: five interview formats at Beginner,
  Intermediate, and Advanced levels.
- Expose 10,260 questions without adding 10,260 copied records to the initial
  application bundle.
- Every generated question has a stable ID, role, phase, module, topic,
  difficulty, format, answer guide, hint, and follow-up question.

## Learning Experience

- Search and filter by role, roadmap area, difficulty, and interview format.
- Browse manageable pages instead of rendering the whole bank at once.
- Start 5-question quick practice, 10-question mock interviews, or 20-question
  full loops from the active filters.
- Allow one-question practice directly from a bank card.
- Require a written answer before scoring.
- Clearly label scoring as a built-in structure check, not a claim of semantic
  correctness or a replacement for human feedback.
- After submission, show strengths, missing answer elements, a strong-answer
  outline, and a follow-up prompt.
- Save question ID, topic, level, format, answer, score, and feedback per local
  learner profile.
- Provide history, average/best score, and weak-topic review.

## Responsive and Accessible Behavior

- Use named buttons and text labels for important actions.
- Keep filters usable as stacked controls on small screens.
- Keep question cards and session content within the viewport from 320px up.
- Preserve visible keyboard focus and 44px touch targets.

## Acceptance Criteria

1. The academy reports exactly 10,260 questions across 684 topics.
2. React, Angular, JavaScript, TypeScript, Python, DSA, backend, databases,
   system design, AI/ML, LLM, RAG, agents, DevOps, career, and production topics
   can be found through search or roadmap-area filters.
3. Role, area, difficulty, and format filters update the real result count.
4. Quick, mock, full-loop, and single-question sessions work.
5. Answer structure is scored, explained, and persisted with question metadata.
6. Attempt history and weak-topic summaries survive logout/login and reset with
   the learner profile.
7. The feature is lazy-loaded and does not materially grow the initial bundle.
8. Lint, build, browser smoke, responsive checks, visual review, and live
   Cloudflare verification pass.
