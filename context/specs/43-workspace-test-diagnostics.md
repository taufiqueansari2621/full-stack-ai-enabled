# Public workspace test diagnostics

The JS and standalone TypeScript sum exercise shows each authored public case,
pass/fail/not-run state, input, expected and actual result, and bounded error
details. Counts derive from the cases, never independently trusted Worker totals.
Missing functions and thrown cases explain their failure. Syntax errors, worker
errors, malformed output and deadline termination explicitly show cases not run.
No static claim of expected output for unrelated Node/Python projects.

Validate and bound the untrusted worker message before rendering; terminate on
malformed responses. Keep output and execution limits and stale-run protection.
Version the Worker URL protocol so old offline-cache entries cannot mix with a
new application message format; verify an intentionally stale cached runner.
Public browser cases are readable and tamperable, not a private judge or a
server-authoritative assessment. Unsupported languages retain honest unavailable
states. No user code runs in the app API process, no dependencies or paid service.

Verify correct/partially correct solutions, thrown/missing functions, syntax
errors, oversized/malformed messages, timeouts/recovery, JS/TS parity, responsive
and accessible rendered diagnostics, lint/build and existing regression gates.
