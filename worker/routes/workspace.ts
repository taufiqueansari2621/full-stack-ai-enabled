import {
  HttpError,
  assertSameOrigin,
  json,
  readJsonObject,
  type Route,
} from "../http";

type WorkspaceRow = {
  filesJson: string;
  activePath: string;
  revision: number;
  updatedAt: string;
};

function validateFiles(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new HttpError(
      400,
      "INVALID_FILES",
      "Workspace files must be an object.",
    );
  const entries = Object.entries(value);
  if (entries.length < 1 || entries.length > 12)
    throw new HttpError(
      400,
      "INVALID_FILES",
      "A workspace supports 1–12 files.",
    );
  for (const [path, content] of entries) {
    if (!/^[a-zA-Z0-9_.\-/]{1,80}$/.test(path) || path.includes(".."))
      throw new HttpError(
        400,
        "INVALID_PATH",
        "A workspace file path is invalid.",
      );
    if (typeof content !== "string" || content.length > 120_000)
      throw new HttpError(
        400,
        "INVALID_FILE",
        "Each file must be text under 120 KB.",
      );
  }
  const serialized = JSON.stringify(value);
  if (new TextEncoder().encode(serialized).byteLength > 512_000)
    throw new HttpError(
      413,
      "WORKSPACE_TOO_LARGE",
      "Workspace exceeds 512 KB.",
    );
  return serialized;
}

export const workspaceRoutes: Route[] = [
  {
    method: "GET",
    pattern: "/api/workspaces/default",
    auth: true,
    async handler({ env, user }) {
      const row = await env.DB.prepare(
        "SELECT files_json AS filesJson, active_path AS activePath, revision, updated_at AS updatedAt FROM workspaces WHERE user_id = ?",
      )
        .bind(user!.id)
        .first<WorkspaceRow>();
      if (!row)
        return json({
          files: null,
          activePath: null,
          revision: 0,
          updatedAt: null,
        });
      return json({
        files: JSON.parse(row.filesJson),
        activePath: row.activePath,
        revision: row.revision,
        updatedAt: row.updatedAt,
      });
    },
  },
  {
    method: "PUT",
    pattern: "/api/workspaces/default",
    auth: true,
    async handler({ request, env, user }) {
      assertSameOrigin(request);
      const body = await readJsonObject(request, 550_000);
      const filesJson = validateFiles(body.files);
      const activePath =
        typeof body.activePath === "string" ? body.activePath : "";
      const files = JSON.parse(filesJson) as Record<string, string>;
      if (!(activePath in files))
        throw new HttpError(
          400,
          "INVALID_ACTIVE_FILE",
          "Select a file in this workspace.",
        );
      const expectedRevision = Number(body.revision);
      if (!Number.isInteger(expectedRevision) || expectedRevision < 0)
        throw new HttpError(
          400,
          "INVALID_REVISION",
          "A non-negative revision is required.",
        );
      const current = await env.DB.prepare(
        "SELECT revision FROM workspaces WHERE user_id = ?",
      )
        .bind(user!.id)
        .first<{ revision: number }>();
      const revision = current?.revision ?? 0;
      if (revision !== expectedRevision)
        return json(
          {
            error: {
              code: "REVISION_CONFLICT",
              message: "Workspace changed on another device.",
            },
            revision,
          },
          409,
        );
      const nextRevision = revision + 1;
      const updatedAt = new Date().toISOString();
      await env.DB.prepare(
        `INSERT INTO workspaces (user_id, files_json, active_path, revision, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET files_json = excluded.files_json,
           active_path = excluded.active_path, revision = excluded.revision, updated_at = excluded.updated_at`,
      )
        .bind(user!.id, filesJson, activePath, nextRevision, updatedAt)
        .run();
      return json({ revision: nextRevision, updatedAt });
    },
  },
  {
    method: "GET",
    pattern: "/api/workspace-snapshots",
    auth: true,
    async handler({ env, user }) {
      const result = await env.DB.prepare(
        "SELECT id, label, active_path AS activePath, created_at AS createdAt FROM workspace_snapshots WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
      )
        .bind(user!.id)
        .run<{
          id: string;
          label: string;
          activePath: string;
          createdAt: string;
        }>();
      return json({ snapshots: result.results ?? [] });
    },
  },
  {
    method: "POST",
    pattern: "/api/workspace-snapshots",
    auth: true,
    async handler({ request, env, user }) {
      assertSameOrigin(request);
      const body = await readJsonObject(request, 550_000);
      const filesJson = validateFiles(body.files);
      const label = typeof body.label === "string" ? body.label.trim() : "";
      const activePath =
        typeof body.activePath === "string" ? body.activePath : "";
      const files = JSON.parse(filesJson) as Record<string, string>;
      if (label.length < 1 || label.length > 80)
        throw new HttpError(
          400,
          "INVALID_SNAPSHOT_LABEL",
          "Snapshot label must be 1–80 characters.",
        );
      if (!(activePath in files))
        throw new HttpError(
          400,
          "INVALID_ACTIVE_FILE",
          "Snapshot active file is invalid.",
        );
      const snapshot = {
        id: crypto.randomUUID(),
        label,
        activePath,
        createdAt: new Date().toISOString(),
      };
      await env.DB.prepare(
        "INSERT INTO workspace_snapshots (id, user_id, label, files_json, active_path, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
        .bind(
          snapshot.id,
          user!.id,
          label,
          filesJson,
          activePath,
          snapshot.createdAt,
        )
        .run();
      return json({ snapshot }, 201);
    },
  },
  {
    method: "GET",
    pattern: "/api/workspace-snapshot",
    auth: true,
    async handler({ env, user, url }) {
      const id = url.searchParams.get("id") ?? "";
      const row = await env.DB.prepare(
        "SELECT id, label, files_json AS filesJson, active_path AS activePath, created_at AS createdAt FROM workspace_snapshots WHERE id = ? AND user_id = ?",
      )
        .bind(id, user!.id)
        .first<{
          id: string;
          label: string;
          filesJson: string;
          activePath: string;
          createdAt: string;
        }>();
      if (!row)
        throw new HttpError(404, "SNAPSHOT_NOT_FOUND", "Snapshot not found.");
      return json({
        snapshot: {
          id: row.id,
          label: row.label,
          files: JSON.parse(row.filesJson),
          activePath: row.activePath,
          createdAt: row.createdAt,
        },
      });
    },
  },
];
