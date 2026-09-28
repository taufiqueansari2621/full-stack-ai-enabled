// Compare and swap is part of the write, not a preceding SELECT. A stale caller
// receives no RETURNING row even if another device writes at the same instant.
export const SAVE_PROGRESS_SQL = `
INSERT INTO progress_snapshots (user_id, state_json, revision, updated_at)
SELECT ?1, ?2, ?3 + 1, ?4
WHERE ?3 = 0 OR EXISTS (SELECT 1 FROM progress_snapshots WHERE user_id = ?1 AND revision = ?3)
ON CONFLICT(user_id) DO UPDATE SET state_json = excluded.state_json,
  revision = excluded.revision, updated_at = excluded.updated_at
WHERE progress_snapshots.revision = ?3
RETURNING revision, updated_at AS updatedAt`;

export const SAVE_WORKSPACE_SQL = `
INSERT INTO workspaces (user_id, files_json, active_path, revision, updated_at)
SELECT ?1, ?2, ?3, ?4 + 1, ?5
WHERE ?4 = 0 OR EXISTS (SELECT 1 FROM workspaces WHERE user_id = ?1 AND revision = ?4)
ON CONFLICT(user_id) DO UPDATE SET files_json = excluded.files_json,
  active_path = excluded.active_path, revision = excluded.revision, updated_at = excluded.updated_at
WHERE workspaces.revision = ?4
RETURNING revision, updated_at AS updatedAt`;
