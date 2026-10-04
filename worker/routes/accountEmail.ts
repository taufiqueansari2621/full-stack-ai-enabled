import { HttpError, json, readJsonObject, type Route } from "../http";
import { hashPassword, randomToken, sha256 } from "../security";
import { enforceRateLimit } from "../rateLimit";
import { verifyAccountChallenge } from "../turnstile";
import { mailConfigured, sendAccountMail } from "../mail/gmail";
import { mailAddress } from "../mail/smtp";
import type { Env } from "../types";

type EmailOwner = { id: string; email: string; verified: string | null };
function sameOrigin(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    throw new HttpError(
      403,
      "ORIGIN_REJECTED",
      "Cross-origin mutation rejected.",
    );
}

export async function issueAccountEmail(
  env: Env,
  owner: EmailOwner,
  purpose: "verify" | "reset",
) {
  if (!mailConfigured(env))
    throw new HttpError(
      503,
      "MAIL_UNAVAILABLE",
      "Email delivery is unavailable. Use your saved recovery code or retry later.",
    );
  const now = new Date().toISOString();
  const seconds = Math.floor(Date.now() / 1000);
  const ownerQuota = await env.DB.prepare(
    `INSERT INTO account_mail_limits(user_id,purpose,window_started_at,attempts) VALUES(?,?,?,1)
    ON CONFLICT(user_id,purpose) DO UPDATE SET
      attempts = CASE WHEN window_started_at <= ? THEN 1 ELSE attempts + 1 END,
      window_started_at = CASE WHEN window_started_at <= ? THEN excluded.window_started_at ELSE window_started_at END
    WHERE window_started_at <= ? OR attempts < 3 RETURNING user_id`,
  )
    .bind(
      owner.id,
      purpose,
      seconds,
      seconds - 3600,
      seconds - 3600,
      seconds - 3600,
    )
    .first();
  if (!ownerQuota)
    throw new HttpError(
      429,
      "MAIL_LIMIT",
      "Too many email requests. Wait an hour before trying again.",
    );
  const quota = await env.DB.prepare(
    `INSERT INTO account_mail_quota(day, attempts) VALUES (?, 1)
    ON CONFLICT(day) DO UPDATE SET attempts = attempts + 1 WHERE attempts < 100 RETURNING day`,
  )
    .bind(now.slice(0, 10))
    .first();
  if (!quota)
    throw new HttpError(
      429,
      "MAIL_LIMIT",
      "Email limit reached. Retry tomorrow or use your saved recovery code.",
    );
  await env.DB.prepare("DELETE FROM account_email_tokens WHERE expires_at <= ?")
    .bind(now)
    .run();
  await env.DB.prepare("DELETE FROM account_mail_quota WHERE day < ?")
    .bind(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10))
    .run();
  const token = randomToken();
  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO account_email_tokens(id,user_id,token_hash,purpose,created_at,expires_at) VALUES(?,?,?,?,?,?)",
  )
    .bind(
      id,
      owner.id,
      await sha256(token),
      purpose,
      now,
      new Date(
        Date.now() + (purpose === "verify" ? 86400000 : 1800000),
      ).toISOString(),
    )
    .run();
  try {
    await sendAccountMail(env, owner.email, purpose, token);
  } catch (error) {
    await env.DB.prepare("DELETE FROM account_email_tokens WHERE id = ?")
      .bind(id)
      .run();
    throw error;
  }
}

export const accountEmailRoutes: Route[] = [
  {
    method: "GET",
    pattern: "/api/auth/email",
    auth: true,
    async handler({ env, user }) {
      const row = await env.DB.prepare(
        "SELECT email, email_verified_at AS verified FROM users WHERE id = ?",
      )
        .bind(user!.id)
        .first<EmailOwner>();
      return json({
        email: row?.email,
        verifiedAt: row?.verified ?? null,
        deliveryConfigured: mailConfigured(env),
      });
    },
  },
  {
    method: "POST",
    pattern: "/api/auth/email/verify/request",
    auth: true,
    async handler({ env, user, request }) {
      sameOrigin(request);
      await enforceRateLimit(env, request, "email-verify", user!.id, 3, 3600);
      const row = await env.DB.prepare(
        "SELECT id,email,email_verified_at AS verified FROM users WHERE id = ?",
      )
        .bind(user!.id)
        .first<EmailOwner>();
      if (!row) throw new HttpError(401, "UNAUTHENTICATED", "Sign in again.");
      if (!row.verified) await issueAccountEmail(env, row, "verify");
      return json({ ok: true });
    },
  },
  {
    method: "POST",
    pattern: "/api/auth/email/reset/request",
    async handler({ env, request, waitUntil }) {
      sameOrigin(request);
      const body = await readJsonObject(request, 4096);
      const email =
        typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      await enforceRateLimit(env, request, "email-reset-ip", "", 5, 3600);
      await verifyAccountChallenge(
        env,
        request,
        body.turnstileToken,
        "recover",
      );
      if (!mailAddress(email))
        throw new HttpError(
          400,
          "INVALID_EMAIL",
          "Enter a valid email address.",
        );
      await enforceRateLimit(env, request, "email-reset", email, 3, 3600);
      const row = await env.DB.prepare(
        "SELECT id,email,email_verified_at AS verified FROM users WHERE email = ?",
      )
        .bind(email)
        .first<EmailOwner>();
      if (row?.verified) {
        const submission = issueAccountEmail(env, row, "reset").catch(
          () => undefined,
        );
        // SMTP duration must not disclose whether an account exists.
        if (waitUntil) waitUntil(submission);
        else await submission;
      }
      return json({
        ok: true,
        message:
          "If this is a verified account, a reset email will arrive. Otherwise use your saved recovery code.",
      });
    },
  },
  {
    method: "POST",
    pattern: "/api/auth/email/consume",
    async handler({ env, request }) {
      sameOrigin(request);
      const body = await readJsonObject(request, 4096);
      await enforceRateLimit(env, request, "email-consume", "", 10, 3600);
      const token = typeof body.token === "string" ? body.token : "";
      const purpose = body.purpose;
      if (
        !/^[A-Za-z0-9_-]{43}$/.test(token) ||
        (purpose !== "verify" && purpose !== "reset")
      )
        throw new HttpError(
          400,
          "INVALID_LINK",
          "This link is invalid or expired. Request a new email.",
        );
      let passwordHash: string | null = null;
      let passwordSalt: string | null = null;
      let recoveryCode: string | null = null;
      let recoveryHash: string | null = null;
      if (purpose === "reset") {
        await verifyAccountChallenge(
          env,
          request,
          body.turnstileToken,
          "recover",
        );
        const password = typeof body.password === "string" ? body.password : "";
        if (password.length < 10 || password.length > 128)
          throw new HttpError(
            400,
            "WEAK_PASSWORD",
            "Password must be between 10 and 128 characters.",
          );
        const result = await hashPassword(password);
        passwordHash = result.hash;
        passwordSalt = result.salt;
        recoveryCode = randomToken(24);
        recoveryHash = await sha256(recoveryCode);
      }
      const consumed = await env.DB.prepare(
        `UPDATE account_email_tokens SET used_at=?, reset_password_hash=?, reset_password_salt=?, recovery_code_hash=?
      WHERE token_hash=? AND purpose=? AND used_at IS NULL AND expires_at > ? RETURNING id`,
      )
        .bind(
          new Date().toISOString(),
          passwordHash,
          passwordSalt,
          recoveryHash,
          await sha256(token),
          purpose,
          new Date().toISOString(),
        )
        .first();
      if (!consumed)
        throw new HttpError(
          400,
          "INVALID_LINK",
          "This link is invalid, expired, or already used. Request a new email.",
        );
      return json({ ok: true, ...(recoveryCode ? { recoveryCode } : {}) });
    },
  },
];
