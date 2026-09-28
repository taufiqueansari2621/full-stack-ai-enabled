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

The original keyword-matching walkthrough has been replaced by real SQLite
WASM in a disposable browser worker. Each run resets the teaching dataset;
multiple statements share state within a script. Query plans, results, errors,
and timing come from actual execution, not authored outputs. No SQL reaches D1.
See `34-real-sql-execution.md` for resource and security limits.

## Verification

- `tests/sql-lab.test.ts` enforces exact topic coverage and accepted/rejected
  query behavior.
- `scripts/smoke.mjs` verifies the ten topics, three schema tables, execution,
  results, explanation, and plan in the complete responsive regression.
- `scripts/verify-cloudflare.mjs` repeats the critical assertions against the
  deployed Worker.
- Verified production version:
  `4ce762bf-d537-4f2b-b7f2-830ee1e3fbb2` (real SQLite execution).
- `npm run test:sql` verifies actual execution, all ten topics, cancellation,
  timeout recovery, and responsive layouts. Use `FORGE_SQL_TEST_URL` for live checks.
