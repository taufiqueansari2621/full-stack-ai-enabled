# Code Runner Boundary and Project Starters

## Outcome

Forge provides a typed execution boundary for progressively adding languages,
keeps safe JavaScript execution in the dedicated browser Worker, and refuses to
pretend that Python, Node.js, or TypeScript ran when a secure remote sandbox has
not been configured.

## Runner architecture

- `CodeRunner` defines the request, result, supported-language, and execution
  contract.
- `BrowserRunner` is the only currently executable adapter. It runs constrained
  JavaScript in `/runner-worker.js` with network APIs disabled, a 1.5-second
  parent-enforced timeout, deterministic tests, and bounded output.
- `RemoteSandboxRunner` is the explicit boundary for Python, Node.js, and
  TypeScript. Until a separately isolated service and cost/network/package
  policy exist, it returns a clear unavailable result and never runs code in the
  application Worker.
- Language selection derives from the active file and project files instead of
  trusting a client-provided runner name.

## Project creation

The project creator accepts name, description, and goals and generates editable,
exportable starter files for Blank, HTML/CSS/JavaScript, React, Angular, Node.js,
Full Stack, Python, and AI/RAG projects.

## Verification

- Focused tests verify language routing and honest remote-sandbox behavior.
- The authenticated production lifecycle verifies every starter choice and the
  description/goals fields before exercising JavaScript execution and cloud
  persistence.
- Existing CSP, timeout, output, responsive, and authorization gates remain.
