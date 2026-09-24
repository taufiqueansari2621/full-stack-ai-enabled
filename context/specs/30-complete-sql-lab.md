# Complete SQL Lab

## Outcome

Forge provides an interactive, bounded SQL learning workspace for every topic
named in the Forge 2.0 brief. Learners inspect a three-table schema, edit a
lesson query, run it, inspect tabular output, and connect the output to an
explanation and query plan.

## Topic coverage

- SELECT
- WHERE
- JOIN
- GROUP BY
- Subqueries
- Common table expressions
- Window functions
- Indexes
- Transactions
- Query optimization

## Execution boundary

The current engine is deliberately deterministic and limited to authored
teaching datasets. It validates the required concept in the learner query and
never implies that arbitrary SQL ran against production D1. A future isolated
SQLite runtime can implement the same interface without changing the lesson UI.

## Verification

- `tests/sql-lab.test.ts` enforces exact topic coverage and accepted/rejected
  query behavior.
- `scripts/smoke.mjs` verifies the ten topics, three schema tables, execution,
  results, explanation, and plan in the complete responsive regression.
- `scripts/verify-cloudflare.mjs` repeats the critical assertions against the
  deployed Worker.
- Verified production version:
  `5dd0e1d4-e970-4a7a-9f2d-8f28d61d374e`.
