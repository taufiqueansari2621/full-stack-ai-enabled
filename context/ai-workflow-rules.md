# AI Development Workflow Rules

These rules apply to AI-assisted development of Forge. They are project context, not permission to override the user's current request or repository-level instructions.

## Approach

- Read the six context files before substantial implementation or architecture work.
- Work from the ordered build plan and one scoped feature specification at a time.
- Preserve the core learning loop and mastery-first product principles.
- Deliver the smallest end-to-end result that can be verified in the browser.

## Scoping

- Keep one user outcome and one primary system boundary per implementation unit.
- Split work that combines UI, persistence, AI integration, and infrastructure unless an end-to-end slice requires a thin change in each.
- Do not add speculative packages or services.
- Do not replace working visual behavior during an unrelated refactor.
- Do not implement payments, organizations, or production multi-tenancy without explicit scope expansion.

## Handling Ambiguity

- Resolve ambiguity against `project-overview.md`, architecture invariants, and existing behavior.
- Record a consequential unresolved decision in `progress-tracker.md`.
- Ask the user only when the choice changes product scope, external systems, cost, security posture, or data handling.
- Make and document reversible implementation assumptions when they do not materially change intent.

## Implementation

- Inspect the current feature and its dependencies before editing.
- Prefer root-cause fixes and typed boundaries.
- Use seeded or local implementations behind the same interface planned for remote data.
- Never treat generated text, model output, or persisted JSON as trusted input.
- Keep AI coaching progressive: ask, hint, explain, then reveal only when appropriate.

## Protected and Generated Content

- Do not edit `node_modules/` or `dist/`.
- Do not commit secrets, environment-specific configuration, caches, or build artifacts.
- Preserve curriculum Markdown unless the task explicitly changes curriculum content.
- Do not overwrite user project artifacts or roadmap documents during application refactors.

## Documentation

- Update `architecture.md` before or with an architectural boundary change.
- Update `ui-context.md` when adding a design token or reusable visual pattern.
- Update `project-overview.md` when feature scope changes.
- Update `progress-tracker.md` after meaningful verified implementation.
- Add a feature spec before a unit that requires substantial new product behavior.

## Verification Gate

Do not mark a unit complete until:

1. Its acceptance criteria are met.
2. The flow renders in a real browser with no console errors.
3. Keyboard and responsive behavior have been checked.
4. Relevant automated tests pass.
5. `npm run lint` passes.
6. `npm run build` passes.
7. Architecture invariants remain true.
8. The progress tracker reflects the actual state.

## Git Hygiene

- Review the diff before committing.
- Keep commit messages outcome-oriented.
- Do not rewrite history, force-push, or discard unrelated changes.
- Push only when requested or when continuing an explicitly authorized push workflow.

