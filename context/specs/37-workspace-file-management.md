# Workspace file management

Support creating files in nested folders, renaming/moving files or whole folders,
and explicitly confirmed file deletion with an undo action. Folders are derived
from paths; empty folders are not persisted. Never overwrite a destination or
rewrite source imports automatically. Preserve open tabs and the active selection
when paths move; choose an existing file when the active file is deleted.

Match the existing API limits: 1–12 files, 80-character relative paths, 120,000
characters per file, and 512,000 serialized UTF-8 bytes. Reject traversal,
absolute paths, reserved prototype names, empty path segments, and file/folder
collisions. Keep operation logic pure, validate before mutation, and surface
errors without changing files. Delete undo preserves subsequent edits and refuses
to overwrite a recreated file. Clear stale execution results for file operations.

Verify domain limits/collisions/undo and actual browser create, move, cancel,
delete, undo, refresh persistence, keyboard controls, and narrow layouts.

## Semantic assistance

An explicit Suggest at cursor / check code action uses the installed TypeScript
language service in the disposable compiler worker. Infer local JavaScript and
TypeScript symbols and ES2022 members, offer at most 40 matching names, and show
at most 30 syntax/semantic diagnostics. No source is executed or uploaded; package
types and browser API declarations are outside this bounded mode. A ten-second
deadline and 120,000-character cap apply. Hide results after source/path changes;
apply completion replacement spans without replacing unrelated source.

Reference: https://github.com/microsoft/TypeScript/wiki/Using-the-Language-Service-API
