import {
  HttpError,
  apiError,
  assertSameOrigin,
  json,
  readJsonObject,
  type Route,
} from "../http";
import {
  hashPassword,
  randomToken,
  readSessionToken,
  sessionCookie,
  sha256,
  verifyPassword,
} from "../security";
import type { AuthUser, Env } from "../types";

type UserRow = AuthUser & { passwordHash: string; passwordSalt: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME = /^[a-z0-9][a-z0-9_-]{2,29}$/;

function field(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function createSession(env: Env, userId: string, request: Request) {
  const token = randomToken();
  const id = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString();
  await env.DB.prepare(
    "INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(id, userId, await sha256(token), expiresAt, new Date().toISOString())
    .run();
  return sessionCookie(request, token);
}

export const authRoutes: Route[] = [
  {
    method: "POST",
    pattern: "/api/auth/register",
    async handler({ request, env }) {
      assertSameOrigin(request);
      if (env.REGISTRATION_MODE !== "open")
        return apiError(
          503,
          "REGISTRATION_CLOSED",
          "Account registration is not open yet.",
        );
      const body = await readJsonObject(request);
      const email = field(body.email).toLowerCase();
      const fullName = field(body.fullName);
      const username = field(body.username).toLowerCase();
      const password = typeof body.password === "string" ? body.password : "";
      if (!EMAIL.test(email) || email.length > 254)
        throw new HttpError(
          400,
          "INVALID_EMAIL",
          "Enter a valid email address.",
        );
      if (fullName.length < 2 || fullName.length > 80)
        throw new HttpError(
          400,
          "INVALID_NAME",
          "Name must be between 2 and 80 characters.",
        );
      if (!USERNAME.test(username))
        throw new HttpError(
          400,
          "INVALID_USERNAME",
          "Username must be 3–30 lowercase letters, numbers, dashes, or underscores.",
        );
      if (password.length < 10 || password.length > 128)
        throw new HttpError(
          400,
          "WEAK_PASSWORD",
          "Password must be between 10 and 128 characters.",
        );
      const duplicate = await env.DB.prepare(
        "SELECT id FROM users WHERE email = ? OR id IN (SELECT user_id FROM profiles WHERE username = ?)",
      )
        .bind(email, username)
        .first();
      if (duplicate)
        return apiError(
          409,
          "ACCOUNT_EXISTS",
          "That email or username is already registered.",
        );
      const userId = crypto.randomUUID();
      const now = new Date().toISOString();
      const passwordRecord = await hashPassword(password);
      await env.DB.prepare(
        "INSERT INTO users (id, email, password_hash, password_salt, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
        .bind(userId, email, passwordRecord.hash, passwordRecord.salt, now, now)
        .run();
      try {
        await env.DB.prepare(
          "INSERT INTO profiles (user_id, full_name, username, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        )
          .bind(userId, fullName, username, now, now)
          .run();
      } catch (error) {
        await env.DB.prepare("DELETE FROM users WHERE id = ?")
          .bind(userId)
          .run();
        throw error;
      }
      const cookie = await createSession(env, userId, request);
      return json({ user: { id: userId, email, fullName, username } }, 201, {
        "set-cookie": cookie,
      });
    },
  },
  {
    method: "POST",
    pattern: "/api/auth/login",
    async handler({ request, env }) {
      assertSameOrigin(request);
      const body = await readJsonObject(request);
      const email = field(body.email).toLowerCase();
      const password = typeof body.password === "string" ? body.password : "";
      const user = await env.DB.prepare(
        `SELECT u.id, u.email, u.password_hash AS passwordHash, u.password_salt AS passwordSalt,
                p.full_name AS fullName, p.username
         FROM users u JOIN profiles p ON p.user_id = u.id WHERE u.email = ?`,
      )
        .bind(email)
        .first<UserRow>();
      if (
        !user ||
        !(await verifyPassword(password, user.passwordSalt, user.passwordHash))
      )
        return apiError(
          401,
          "INVALID_CREDENTIALS",
          "Email or password is incorrect.",
        );
      const cookie = await createSession(env, user.id, request);
      return json(
        {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            username: user.username,
          },
        },
        200,
        { "set-cookie": cookie },
      );
    },
  },
  {
    method: "POST",
    pattern: "/api/auth/logout",
    async handler({ request, env }) {
      assertSameOrigin(request);
      const token = readSessionToken(request);
      if (token)
        await env.DB.prepare(
          "UPDATE sessions SET revoked_at = ? WHERE token_hash = ?",
        )
          .bind(new Date().toISOString(), await sha256(token))
          .run();
      return json({ ok: true }, 200, {
        "set-cookie": sessionCookie(request, "", 0),
      });
    },
  },
  {
    method: "GET",
    pattern: "/api/me",
    auth: true,
    async handler({ user }) {
      return json({ user });
    },
  },
];
