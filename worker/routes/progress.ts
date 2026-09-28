import {
  HttpError,
  assertSameOrigin,
  json,
  readJsonObject,
  type Route,
} from "../http";
import { SAVE_PROGRESS_SQL } from "../repositories/snapshotSql";
import { validateProgress } from "../progressValidation";

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
      const invalid = validateProgress(state);
      if (invalid) throw new HttpError(400, "INVALID_PROGRESS", invalid);
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
      if (
        !Number.isSafeInteger(expectedRevision) ||
        Number(expectedRevision) < 0
      )
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
      const now = new Date().toISOString();
      const saved = await env.DB.prepare(SAVE_PROGRESS_SQL)
        .bind(user!.id, stateJson, expectedRevision, now)
        .first<{ revision: number; updatedAt: string }>();
      if (saved) return json(saved);
      const current = await env.DB.prepare(
        "SELECT revision FROM progress_snapshots WHERE user_id = ?",
      )
        .bind(user!.id)
        .first<{ revision: number }>();
      const revision = current?.revision ?? 0;
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
    },
  },
];
