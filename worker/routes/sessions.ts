import {
  assertSameOrigin,
  HttpError,
  json,
  readJsonObject,
  type Route,
} from "../http";
import { readSessionToken, sha256 } from "../security";

export const sessionRoutes: Route[] = [
  {
    method: "GET",
    pattern: "/api/auth/sessions",
    auth: true,
    async handler({ env, user, request }) {
      const hash = await sha256(readSessionToken(request) ?? "");
      const result = await env.DB.prepare(
        `SELECT id, created_at AS createdAt,
        expires_at AS expiresAt, (token_hash = ?1) AS isCurrent FROM sessions
        WHERE user_id = ?2 AND revoked_at IS NULL AND expires_at > ?3
        ORDER BY isCurrent DESC, created_at DESC, id DESC LIMIT 51`,
      )
        .bind(hash, user!.id, new Date().toISOString())
        .run<{
          id: string;
          createdAt: string;
          expiresAt: string;
          isCurrent: number;
        }>();
      const rows = result.results ?? [];
      return json({
        sessions: rows.slice(0, 50).map(({ isCurrent, ...row }) => ({
          ...row,
          current: isCurrent === 1,
        })),
        truncated: rows.length > 50,
      });
    },
  },
  {
    method: "POST",
    pattern: "/api/auth/sessions/revoke",
    auth: true,
    async handler({ env, user, request }) {
      assertSameOrigin(request);
      const body = await readJsonObject(request, 1024);
      if (body.scope !== "others" && body.scope !== "session")
        throw new HttpError(
          400,
          "INVALID_SCOPE",
          "Choose one session or all other sessions.",
        );
      if (
        body.scope === "session" &&
        (typeof body.id !== "string" || !/^[a-zA-Z0-9-]{1,100}$/.test(body.id))
      )
        throw new HttpError(400, "INVALID_SESSION", "Choose a valid session.");
      const hash = await sha256(readSessionToken(request) ?? "");
      await env.DB.prepare(
        `UPDATE sessions SET revoked_at = ?1
        WHERE user_id = ?2 AND token_hash != ?3 AND revoked_at IS NULL
        AND (?4 = 'others' OR id = ?5)`,
      )
        .bind(
          new Date().toISOString(),
          user!.id,
          hash,
          body.scope,
          body.scope === "session" ? body.id : "",
        )
        .run();
      return json({ ok: true });
    },
  },
];
