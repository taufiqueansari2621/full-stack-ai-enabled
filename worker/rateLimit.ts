import { HttpError } from "./http";
import { sha256 } from "./security";
import type { Env } from "./types";

export async function enforceRateLimit(
  env: Env,
  request: Request,
  action: string,
  identifier: string,
  limit: number,
  windowSeconds: number,
) {
  const address = request.headers.get("cf-connecting-ip") ?? "local";
  const bucketKey = await sha256(`${action}:${address}:${identifier}`);
  const now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare(
    "SELECT window_started_at AS windowStartedAt, attempt_count AS attemptCount FROM auth_rate_limits WHERE bucket_key = ?",
  )
    .bind(bucketKey)
    .first<{ windowStartedAt: number; attemptCount: number }>();
  if (!row || now - row.windowStartedAt >= windowSeconds) {
    await env.DB.prepare(
      `INSERT INTO auth_rate_limits (bucket_key, window_started_at, attempt_count)
       VALUES (?, ?, 1)
       ON CONFLICT(bucket_key) DO UPDATE SET window_started_at = excluded.window_started_at, attempt_count = 1`,
    )
      .bind(bucketKey, now)
      .run();
    return;
  }
  if (row.attemptCount >= limit)
    throw new HttpError(
      429,
      "RATE_LIMITED",
      "Too many attempts. Wait before trying again.",
    );
  await env.DB.prepare(
    "UPDATE auth_rate_limits SET attempt_count = attempt_count + 1 WHERE bucket_key = ?",
  )
    .bind(bucketKey)
    .run();
}
