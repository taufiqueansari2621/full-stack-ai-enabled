# Accessible Dialog Focus

## Outcome

Every Forge dialog keeps keyboard focus inside while open, closes consistently
with Escape, starts on a useful control, and restores focus to the control that
opened it.

## Requirements

- Share one reusable dialog-focus hook across settings, search, notifications,
  note editing, project creation, and workspace version history.
- Move initial focus only after the dialog mounts and preserve the opener for
  restoration.
- Wrap forward Tab from the last enabled visible control to the first.
- Wrap Shift+Tab from the first control to the last.
- Close on Escape without also triggering unrelated global shortcuts.
- Preserve click-outside and explicit close-button behavior.
- Give every dialog an accessible name through `aria-label` or
  `aria-labelledby`.

## Verification

- Browser coverage opens global search from its trigger and proves initial
  focus, both wrap directions, Escape close, and opener restoration.
- Existing smoke coverage exercises every dialog-bearing workspace.
- TypeScript, React lint rules, production build, 90 responsive checks, and six
  focused-lesson checks remain green.
