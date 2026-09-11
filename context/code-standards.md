# Code Standards

## General

- Fix root causes instead of hiding failures.
- Keep each module focused on one responsibility.
- Prefer explicit, readable domain names over abbreviations.
- Avoid speculative abstractions; extract a reusable pattern after it appears more than once.
- Preserve unrelated user changes and keep feature changes scoped.
- Document decisions and trade-offs, not obvious syntax.

## TypeScript

- Keep strict mode enabled.
- Do not use `any`. Parse `unknown` at external boundaries.
- Model finite states with unions instead of unrelated booleans.
- Use stable identifiers rather than titles or array positions for persisted entities.
- Keep domain calculations pure and testable.
- Type component props explicitly and keep them narrower than the full domain object.

## React

- Use function components and hooks.
- Do not return values from effects unless the value is an intentional cleanup function.
- Keep derived values out of state; calculate them or memoize expensive computation.
- Effects synchronize with external systems. Do not use them for ordinary event handling.
- Keep feature state near the feature until it must be shared.
- Use semantic HTML before adding ARIA.
- Every interactive control must be keyboard accessible and have an accessible name.
- Add an error boundary at the application level before introducing remote data.

## Components

- Reusable primitives belong in `src/components/ui` and contain no Forge domain rules.
- Feature components belong with their feature.
- Use composition instead of large prop matrices.
- A page component orchestrates sections; it should not contain persistence or scoring algorithms.
- Empty, loading, error, disabled, success, and destructive states must be visually distinct.

## Data and Domain

- Access data through repository interfaces so local data can later be replaced by APIs.
- Version persisted browser state and provide safe defaults for invalid or old values.
- Mastery, review scheduling, XP, and readiness rules belong in pure domain modules.
- Store raw evidence and derive aggregate scores; do not store only the aggregate.
- Use ISO timestamps at storage/API boundaries and format them only for presentation.

## Styling

- Use semantic CSS custom properties from `ui-context.md`.
- Do not introduce new raw color values inside feature selectors.
- Use the shared spacing, radius, shadow, and typography scales.
- Keep selectors shallow and class-based.
- Design mobile behavior with the feature, not as a later patch.
- Respect `prefers-reduced-motion` and never rely on color alone to communicate state.

The existing single stylesheet contains legacy raw values from the visual prototype. Migrate touched sections to tokens incrementally; do not rewrite the entire stylesheet as part of an unrelated feature.

## Files

- Components: `PascalCase.tsx`.
- Hooks: `useName.ts`.
- Domain/data utilities: `camelCase.ts`.
- Tests: colocated `*.test.ts` or `*.test.tsx`.
- Prefer named exports for reusable modules; a route/page may use a default export.

## Verification

Before declaring a feature complete:

1. Exercise the user flow in a real browser.
2. Confirm no console errors or React warnings.
3. Check keyboard navigation and visible focus.
4. Check at approximately 375px, 768px, 1280px, and 1440px.
5. Run `npm run lint`.
6. Run `npm run build`.
7. Run relevant automated tests after the test suite is introduced.

