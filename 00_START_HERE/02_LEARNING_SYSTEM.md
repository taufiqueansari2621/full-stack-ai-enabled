# Learning and Revision System

This system converts study time into skills you can retrieve during real engineering work and interviews.

## The learning loop

Use the same loop for every topic:

1. **Map:** write what the concept solves and what you already know.
2. **Learn:** use one primary explanation; avoid opening many courses.
3. **Recall:** close the source and explain the concept from memory.
4. **Build:** create the smallest working implementation.
5. **Break:** introduce edge cases, invalid input, latency, and failure.
6. **Test:** automate the expected behavior and important failures.
7. **Teach:** give a two-minute explanation and a deeper ten-minute version.
8. **Connect:** add it to a project or compare it with an alternative.

## Notes format

Keep one note per concept with these fields:

```md
# Topic

## One-sentence definition
## Mental model
## Small example
## Common mistakes
## Trade-offs and alternatives
## Where I used it
## Five interview questions
## Review dates
```

Notes should be short enough to review. Code, test cases, and explanations matter more than copied theory.

## Spaced revision

Review each important concept after:

- 1 day: recall the definition and example;
- 3 days: solve or implement without notes;
- 7 days: answer interview questions aloud;
- 14 days: use it in a different context;
- 30 days: explain trade-offs and production failures;
- 60 days: mixed recall with related concepts.

If recall fails, do not restart the course. Rebuild the smallest example, correct the note, and schedule the next review.

## Weekly deliverables

Every week must produce:

- one concept explanation;
- two or more meaningful code commits;
- one tested project increment;
- five DSA problems from one pattern, including one repeat;
- one system-design or architecture sketch;
- ten short interview answers;
- one written reflection: `worked / failed / change next week`.

## DSA method

For each problem:

1. clarify inputs, constraints, and examples;
2. state the brute-force approach and complexity;
3. identify the reusable pattern;
4. code while explaining invariants;
5. test normal, boundary, and adversarial cases;
6. record the mistake—not the entire solution;
7. repeat after 2, 7, and 21 days.

Track patterns, not only problem count. A useful target is 150 deeply understood problems plus repeats rather than 500 memorized answers.

## Project learning log

For every meaningful implementation session, capture:

```md
Goal:
Decision made:
Alternative rejected and why:
Bug or uncertainty:
Test/measurement:
Next smallest step:
```

This log later becomes excellent material for project deep-dives and behavioral interviews.

## Monthly checkpoint

At the end of every four weeks:

- rebuild one core feature without the tutorial;
- run a 45-minute mixed technical mock;
- audit GitHub README, tests, demo, and commit quality;
- measure roadmap completion using evidence, not hours;
- remove low-value resources and reduce unfinished work;
- choose the next month's single showcase milestone.

## When you get stuck

Use this escalation order:

1. reduce the problem to a minimal reproduction;
2. read the error and inspect actual inputs/outputs;
3. check official documentation;
4. compare a working and failing case;
5. ask for a hint that explains the gap;
6. write the final explanation in your own words.

AI can review, question, generate edge cases, and explain alternatives. Do not accept generated code until you can explain it, test it, and identify its failure modes.

