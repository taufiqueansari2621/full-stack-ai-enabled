# Browser TypeScript playground

Type-check and compile a bounded standalone TypeScript script in a disposable
compiler worker using the installed TypeScript compiler and bundled ES2022
standard-library declarations. No learner source is evaluated by the compiler.
Reject modules/package imports and JSX with a clear scope message; these belong
to the separate framework/package preview boundary. Surface line/column syntax
and semantic diagnostics and never execute code with errors.

Successful output runs through the existing network-disabled JavaScript worker
with its 1.5-second execution deadline and visible exercise tests. Compiler
loading/typechecking has a separate ten-second deadline and 120 KB input cap.
Load compiler assets only on a TypeScript run, with a separate explicit budget.
Expose a typed exercise without overwriting the learner's existing files.

Test valid typed functions, incompatible assignments, syntax errors, missing
names, imports, output preservation, and actual browser execution/recovery.

Discard asynchronous execution results when the active file or workspace files
change during compilation/execution, so old passing results cannot certify new
code. Verified with `npm test`, `npm run test:editor`, and the live editor and
Cloudflare verification suites on Worker `7ef90281-2270-474d-82fb-ce2983367e32`.
