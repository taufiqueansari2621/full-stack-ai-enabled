# Interview Preparation Operating System

Interview preparation runs alongside the roadmap. Do not wait until the projects are complete.

## Round map

| Round | Evidence to build | Practice files |
|---|---|---|
| JavaScript/TypeScript | language internals, async reasoning, coding utilities | [JS/TS](01_JS_TS.md) |
| Angular | RxJS, rendering, architecture, testing, performance | [Angular](02_ANGULAR.md) |
| React | rendering, effects, state, performance, testing | [React](03_REACT.md) |
| Backend | Node, APIs, databases, security, distributed failures | [Backend](04_BACKEND.md) |
| Coding/DSA | pattern recognition, correctness, complexity, communication | [DSA](05_DSA.md) |
| System design | requirements, estimates, data, APIs, scale, reliability | [System design](06_SYSTEM_DESIGN.md) |
| AI/ML | data, evaluation, RAG, agents, safety, operations | [AI/ML](07_AI_ML.md) |
| Project deep-dive | decisions, failures, metrics, ownership | [Project deep-dive](08_PROJECT_DEEP_DIVE.md) |
| Behavioral | concise STAR stories with reflection | [Behavioral](09_BEHAVIORAL.md) |

## Weekly loop

- Monday: five rapid concept questions.
- Tuesday: one 45-minute coding problem.
- Wednesday: explain one project decision on a whiteboard.
- Thursday: one frontend/backend/AI domain drill.
- Friday: revise misses using active recall.
- Saturday: one realistic mock and written feedback.
- Sunday: repeat failed questions and update the question bank.

## Technical answer framework

Use **D-M-E-T-P**:

1. **Definition:** answer the question directly.
2. **Mental model:** explain what happens internally.
3. **Example:** use minimal code or a concrete scenario.
4. **Trade-offs:** include alternatives and failure modes.
5. **Project:** connect the idea to measured work you performed.

## Coding interview framework

1. Restate the problem and clarify constraints.
2. Work through an example and boundary cases.
3. Explain brute force before optimizing.
4. Name the pattern and invariant.
5. State time and space complexity.
6. Implement in small, testable steps.
7. Dry-run normal and adversarial inputs.
8. Discuss production concerns if relevant.

## System-design framework

Use the same order every time:

```text
requirements -> scale estimates -> API -> data model -> high-level design
-> critical path -> bottlenecks -> reliability/security -> observability -> trade-offs
```

Spend the first minutes narrowing scope. Prefer a simple design that meets stated requirements, then evolve it as scale or reliability needs change.

## AI system-design additions

Always address:

- why AI is required and what the baseline is;
- offline and online quality metrics;
- data provenance, permissions, and freshness;
- prompt/model/version management;
- hallucination, injection, and unsafe tool use;
- latency/cost budgets, caching, fallbacks, and human review;
- monitoring for quality drift and feedback loops.

## Project deep-dive preparation

Prepare a 2-minute, 10-minute, and 30-minute version of each showcase project. Be ready to draw its architecture from memory and answer:

- What user problem and measurable outcome drove it?
- What did you personally own?
- What alternatives did you reject and why?
- What was the hardest failure and how did you diagnose it?
- What evidence shows quality, security, or performance?
- What fails first at 10x traffic or data?
- What would you change with another month?

## Behavioral story bank

Prepare eight reusable stories: ownership, ambiguity, failure, conflict, influence, urgent delivery, technical excellence, and learning. For each, write:

```text
Situation (10%) -> Task (10%) -> Actions and decisions (60%)
-> Result with evidence (15%) -> Reflection (5%)
```

## Readiness criteria

You are application-ready when, across three consecutive weeks, you can:

- solve two medium problems in 45 minutes with clear communication;
- complete a 45-minute design with justified trade-offs;
- score at least 80% on mixed domain recall;
- deliver a project deep-dive without notes;
- tell six concise behavioral stories;
- recover constructively when you do not know an answer.

