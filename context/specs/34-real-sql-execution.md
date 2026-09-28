# Real SQL execution

Replace keyword-matched examples with SQLite WASM in a disposable browser worker.
Each run starts with the documented three-table teaching dataset; multiple
statements in one script share that database, allowing real indexes and
commit/rollback experiments. It never connects to production D1.

Support all ten existing topics, real syntax errors, input-dependent rows,
SQLite query plans, measured execution time, empty results, and explicit output
limits. Terminate workers on deadline, cancellation, navigation, and completion.
Bound query length, statement count, rows, cell size, and SQLite heap/pages.
Disallow database attachment, extension loading, and user PRAGMAs. Fetch the
same-origin runtime only on Run; permit WASM compilation only in its worker CSP.

Verify changed WHERE filters, joins, CTEs, window functions, index plans,
commit/rollback, syntax failures, output bounds, cancellation, and timeout
recovery in tests and a real browser. Preserve other labs and mobile layouts.
