import {
  HttpError,
  assertSameOrigin,
  json,
  readJsonObject,
  type Route,
} from "../http";

type ProgressRow = { stateJson: string; revision: number; updatedAt: string };

export const progressRoutes: Route[] = [
  {
    method: "GET",
    pattern: "/api/progress",
    auth: true,
    async handler({ env, user }) {
      const row = await env.DB.prepare(
        "SELECT state_json AS stateJson, revision, updated_at AS updatedAt FROM progress_snapshots WHERE user_id = ?",
      )
        .bind(user!.id)
        .first<ProgressRow>();
      if (!row) return json({ state: null, revision: 0, updatedAt: null });
      return json({
        state: JSON.parse(row.stateJson),
        revision: row.revision,
        updatedAt: row.updatedAt,
      });
    },
  },
  {
    method: "PUT",
    pattern: "/api/progress",
    auth: true,
    async handler({ request, env, user }) {
      assertSameOrigin(request);
      const body = await readJsonObject(request, 550_000);
      const state = body.state;
      const expectedRevision = body.revision;
      if (
        !state ||
        typeof state !== "object" ||
        Array.isArray(state) ||
        (state as { version?: unknown }).version !== 1
      )
        throw new HttpError(
          400,
          "INVALID_PROGRESS",
          "Progress must be a Forge version 1 state object.",
        );
      if (!Number.isInteger(expectedRevision) || Number(expectedRevision) < 0)
        throw new HttpError(
          400,
          "INVALID_REVISION",
          "A non-negative revision is required.",
        );
      const stateJson = JSON.stringify(state);
      if (new TextEncoder().encode(stateJson).byteLength > 512_000)
        throw new HttpError(
          413,
          "PROGRESS_TOO_LARGE",
          "Progress exceeds the 512 KB limit.",
        );
      const current = await env.DB.prepare(
        "SELECT revision FROM progress_snapshots WHERE user_id = ?",
      )
        .bind(user!.id)
        .first<{ revision: number }>();
      const revision = current?.revision ?? 0;
      if (revision !== expectedRevision)
        return json(
          {
            error: {
              code: "REVISION_CONFLICT",
              message: "Cloud progress changed. Reload before saving.",
            },
            revision,
          },
          409,
        );
      const nextRevision = revision + 1;
      const now = new Date().toISOString();
      await env.DB.prepare(
        `INSERT INTO progress_snapshots (user_id, state_json, revision, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET state_json = excluded.state_json,
           revision = excluded.revision, updated_at = excluded.updated_at`,
      )
        .bind(user!.id, stateJson, nextRevision, now)
        .run();
      return json({ revision: nextRevision, updatedAt: now });
    },
  },
];
