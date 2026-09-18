# UI Context

## Learning workspace additions

- Focused lessons expose an optional left-edge hover menu and top-right menu/full-screen controls without reducing the reading canvas.
- Topic navigation has its own Hide/Show control and is independent from global navigation.
- Roadmap selection uses accessible pressed-state controls for Card view and Interactive flow.
- Inputs, selects, and textareas inherit the active theme; dark pages must not show an unstyled white native control.

## Design Direction

Forge should feel like a premium developer tool combined with a focused learning studio: deep navy surfaces, crisp information hierarchy, restrained glow, data-rich panels, and purposeful motion. It should be motivating without looking like a children's game and futuristic without sacrificing legibility.

Both dark and light modes are supported. Dark is the default visual identity.

## Semantic Color Tokens

New UI work should use these names. Existing short token names can be migrated as touched.

| Role | Preferred variable | Current mapping | Dark value |
|---|---|---|---|
| Page background | `--color-bg-base` | `--bg` | `#07101c` |
| Subtle background | `--color-bg-subtle` | `--bg-soft` | `#0a1524` |
| Panel surface | `--color-surface` | `--panel` | `#0d1a2a` |
| Raised surface | `--color-surface-raised` | `--panel-2` | `#101f31` |
| Default border | `--color-border` | `--line` | `#1b2b3f` |
| Strong border | `--color-border-strong` | `--line-2` | `#26394f` |
| Primary text | `--color-text` | `--text` | `#e8f0f8` |
| Muted text | `--color-text-muted` | `--muted` | `#8292a7` |
| Faint text | `--color-text-faint` | `--faint` | `#53647a` |
| Primary action | `--color-accent` | `--teal` | `#5eead4` |
| Primary strong | `--color-accent-strong` | `--teal-dark` | `#2dd4bf` |
| Information | `--color-info` | `--blue` | `#60a5fa` |
| AI/advanced | `--color-ai` | `--violet` | `#a78bfa` |
| Warning | `--color-warning` | `--amber` | `#fbbf24` |
| Success | `--color-success` | `--green` | `#34d399` |
| Error | `--color-error` | `--rose` | `#fb7185` |

## Typography

| Role | Family | Usage |
|---|---|---|
| UI and body | DM Sans | Navigation, labels, body, controls |
| Display | Manrope | Headings, metrics, important titles |
| Code | system monospace | Code editor, output, identifiers |

- Body copy: 14–16px for reading surfaces; compact dashboard metadata may use 11–13px.
- Do not use text below 11px for information a learner must read or act on.
- Use uppercase letter-spaced eyebrow labels only for short section context.
- Limit lesson text width to approximately 70 characters per line.

## Spacing and Radius

| Token | Value | Use |
|---|---:|---|
| `--space-1` | 4px | Tight inline spacing |
| `--space-2` | 8px | Related controls |
| `--space-3` | 12px | Compact padding |
| `--space-4` | 16px | Default gap |
| `--space-6` | 24px | Card padding |
| `--space-8` | 32px | Section spacing |
| `--radius-sm` | 8px | Inputs and compact controls |
| `--radius-md` | 12px | Cards and panels |
| `--radius-lg` | 18px | Feature surfaces and overlays |
| `--radius-round` | 999px | Pills and circular controls |

## Layout Patterns

- Desktop application shell: fixed 248px sidebar, sticky 72px top bar, fluid main canvas.
- Mobile shell: hidden sidebar opened as a modal drawer with scrim; no horizontal page scrolling.
- Focused learning shell: entering an authored or catalog lesson removes the global sidebar, top bar, search, and floating mentor so the lesson owns the full canvas; the visible Back control restores the application shell.
- Course-topic rail: show only peer course topics, never lesson chapters or subtasks; keep it sticky, independently scrollable, hideable, and automatically focused on the current topic on desktop, then convert it to a one-row swipeable strip above the lesson at 900px and below.
- Dashboard: 12-column responsive grid with a dominant next-action card.
- Lesson workspace: topic selection opens one continuous Complete Lesson; secondary concept pickers are avoided and supporting panels may collapse.
- Interactive example lab: present normal, unusual, and failure tabs; require a written prediction before revealing the expected result; then collect a reflection and show saved-case progress.
- Teaching examples and code must wrap inside their cards at narrow widths without hiding content or creating document-level horizontal scrolling.
- Skill builder: use a sequential level rail, one focused task, a plain-language success checklist, and progressively reduced guidance.
- Framework choice: show the shared foundation and React / Angular / Both as three explicit, reversible choices before specialization modules.
- Learning resources: lead with a simple explanation of how resources support practice, then provide role paths, searchable filters, and clearly attributed external cards.
- Topic practice: keep quick checks and open-ended drills as explicit modes; use dependent phase/module/topic selectors and three large difficulty choices.
- Reading content: visually quiet surface with generous line height.
- Lists and tables: retain labels on mobile or convert to stacked cards.
- Modals: centered surface, visible title and close action, focus trap, escape-to-close, restored trigger focus.

## Component Conventions

- Primary action: filled teal, one dominant action per surface.
- Secondary action: raised neutral surface with strong border.
- Tertiary action: text/button treatment, not a second filled action.
- Panels: subtle surface separation and one border; avoid nested glass effects.
- Progress: always include a text value or label in addition to color.
- Locked items: explain prerequisites; do not only reduce opacity.
- Empty states: explain why empty and provide one next action.
- AI content: use violet or teal accent plus explicit AI label; never imitate human certainty.

## Plain-English Product Copy

- Use direct navigation labels such as `Lessons`, `Learning Path`, `My Notes`,
  `Review`, `My Progress`, and `AI Help`.
- Use familiar action words: `saved work`, not `artifact`; `score guide`, not
  `rubric`; `course stage` and `section`, not unexplained internal hierarchy.
- Keep real technical names such as HTTP, RxJS, RAG, Big O, and CI/CD, then
  explain them in the lesson before asking a beginner to use them.
- Prefer short active sentences that tell the learner what to do and what a
  successful result looks like.
- Use the same action labels across workspaces: `Save my work`, `Quick check`,
  `Practice`, and `Completed`.

## Icons

- Use Lucide React only unless a data visualization requires custom SVG.
- Standard sizes: 16px inline, 18–20px controls, 24px section icons.
- Decorative icons are hidden from assistive technology; meaningful icon-only buttons require labels.
- Use a visible action label beside arrows when the destination is not already obvious; reserve icon-only controls for familiar actions such as close, menu, theme, and send.
- Status icons are not styled like buttons. Project and card actions use a text label, a directional icon, and at least a 40px desktop / 44px touch target.

## Motion

- Use 150–250ms transitions for hover, panel, drawer, and state changes.
- Animate learning processes only when the motion explains sequence or state.
- Provide pause/reset for algorithm animations.
- Disable non-essential transforms and smooth scrolling under `prefers-reduced-motion: reduce`.

## Accessibility

- Target WCAG 2.2 AA contrast and interaction behavior.
- Maintain visible keyboard focus.
- Do not communicate mastery, errors, or status by color alone.
- Minimum touch target is 44×44px on touch layouts.
- Charts require text summaries and diagrams require accessible descriptions.
