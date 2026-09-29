# Editor and evidence integrity

## Accepted behavior

- JavaScript, TypeScript, JSON, HTML, and CSS formatting uses Prettier parsers
  in a disposable module worker, loaded only after a Format action. Invalid or
  unsupported source stays unchanged; edits made during formatting take priority.
- Syntax highlighting uses escaped React text and a synchronized editable
  overlay. Language snippets insert at the current selection. These are snippets,
  not semantic autocomplete or a language server.
- Every existing quick check has metadata. Failed later attempts revoke passing
  state. An explanation must be authored and saved to advance beyond passing;
  repetition alone cannot award mastery.
- Notes, practice attempts, review schedules, quiz/interview results, completed
  topics, mastery artifacts, and project-task completions have indexed D1 rows.
  Migration 0010 backfills them without altering the original sync snapshots.
  Triggers project changed collections in the same database transaction.
- Snapshot and workspace revisions are checked inside the SQL write. Stale
  first saves and stale updates both receive 409, preserving the accepted write.

## Verification

- Real SQLite tests apply every migration, backfill existing data, isolate users
  with matching client IDs, check reset/deletion, and reject stale writes.
- Formatter tests cover template-string preservation, TypeScript syntax,
  invalid input, and unsupported Python.
- `npm run test:editor` exercises actual browser formatting, cursor insertion,
  syntax alignment, all quick-check pages, and four viewport widths. Set
  `FORGE_EDITOR_TEST_URL` to run the same checks on the live release.
- The existing full browser regression and mandatory `npm test` gate remain.

## Limits

The version-1 sync snapshot remains the compatible write contract. Projections
are queryable records, not independent conflicting sources of truth. Imported
evidence and client quiz scores are learner-reported evidence, not a secure
server judge. Standalone TypeScript and real SQL execution are now separate
verified units; framework previews and richer AI evaluation remain unfinished.
