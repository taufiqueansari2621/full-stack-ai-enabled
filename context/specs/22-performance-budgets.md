# Performance Budgets

## Outcome

Forge keeps heavy workspaces and learning content out of the initial page and
turns release-size expectations into a failing CI gate.

## Architecture

- Keep workspace, advanced labs, portfolio, resources, topic lessons, search,
  notifications, topic practice, and interview academy behind dynamic imports.
- Keep search and other broad result surfaces bounded instead of rendering the
  entire curriculum or question bank at once.
- Cache versioned static curriculum/application assets through the existing
  service worker and avoid authenticated API caching.
- Debounce cloud progress and workspace saves.
- Do not load Monaco or another editor engine on the homepage; the current
  lightweight editor remains inside the lazy workspace chunk.

## Enforced production budgets

- Entry JavaScript: 500 KiB raw or less.
- Entry CSS: 160 KiB raw or less.
- Largest lazy JavaScript chunk: 140 KiB raw or less.
- Total JavaScript: 800 KiB raw or less.

`npm run verify:bundle` reads the hashed Vite entry references from the built
HTML and fails when a budget is exceeded. `npm test` and CI run the check after
the production build.
