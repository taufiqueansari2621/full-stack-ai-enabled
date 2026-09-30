# Free browser framework previews

Compile local JSX/TSX/TypeScript modules in a disposable TypeScript worker;
execute only in an opaque-origin iframe with allow-scripts, never allow-same-origin.
Bundle pinned React and Angular runtimes as separate on-demand static assets.
No containers, external package CDN, network package install at runtime, or
server-side execution. Support relative workspace modules and an explicit
framework package allowlist; reject missing/unapproved imports before execution.
Transpilation provides syntax diagnostics, not a full framework typecheck or AOT.

React uses automatic JSX transformation. Angular uses standalone JIT with
workspace templateUrl/styleUrls inlined by a TypeScript AST transformation.
Support a bounded 12-file/512KB project, 10-second compiler deadline, surfaced
compile/runtime errors, explicit Build/Stop, and stale-result rejection.
Never automatically run learner edits. Existing HTML preview remains separate.

The iframe blocks account DOM/storage access, fetch, forms, popups, and top
navigation. Browser previews are not a server-grade CPU/memory sandbox or a
private judge. A blocking learner loop may require closing the preview tab;
do not promise a hard execution deadline. No private cases or authoritative scores.

Verify actual React state updates and Angular signal/template updates, local
imports and styles, syntax/import errors and recovery, parent isolation and
network policy, responsive controls, on-demand asset budgets, and live release.
