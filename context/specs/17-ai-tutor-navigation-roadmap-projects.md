# AI Tutor, Learning Controls, Roadmap Views, and Project Lab

## Goal

Replace the remaining demo-like areas with useful, local-first learning tools while preserving the Forge visual system and responsive behavior.

## Delivered

- Trainable browser-local retrieval tutor indexing all curriculum topics and learner-provided sources.
- Source labels and a clear general-guidance fallback when training material does not match.
- Dark/light themed native inputs, including lesson prediction textareas.
- Focused-learning controls: course-topic toggle, hoverable left-edge menu, top-right menu, and browser full-screen toggle.
- DSA & Coding Interviews career roadmap.
- Card and interactive flow/tree views for the 17-stage roadmap.
- Eight portfolio projects spanning beginner frontend through production AI/ML.
- Project guidance for overview, architecture, testing, deployment, and decision logs.

## Trust boundary

The local tutor is retrieval-based and does not pretend to be a generative foundation model. It is private, fast, trainable with pasted text, and grounded with visible source labels. Unmatched questions receive clearly labeled general guidance. A hosted open-weight model can later replace the response composer without changing the knowledge-base UI.

## Verification

- `npm run lint`
- `npm run build`
- `npm run test:smoke`
- `npm run verify:cloudflare` against version `eae7e35d-57f4-46e7-980b-5c26ef2a29ea`
