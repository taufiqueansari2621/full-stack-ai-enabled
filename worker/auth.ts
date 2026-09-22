import type { AuthUser, Env } from "./types";
import { readSessionToken, sha256 } from "./security";

type SessionRow = AuthUser & { expiresAt: string };

export async function authenticate(
  request: Request,
  env: Env,
): Promise<AuthUser | null> {
  const token = readSessionToken(request);
  if (!token) return null;
  const tokenHash = await sha256(token);
  const row = await env.DB.prepare(
    `SELECT u.id, u.email, p.full_name AS fullName, p.username, s.expires_at AS expiresAt
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     JOIN profiles p ON p.user_id = u.id
     WHERE s.token_hash = ? AND s.revoked_at IS NULL`,
  )
    .bind(tokenHash)
    .first<SessionRow>();
  if (!row || Date.parse(row.expiresAt) <= Date.now()) return null;
  return {
    id: row.id,
    email: row.email,
    fullName: row.fullName,
    username: row.username,
  };
}
