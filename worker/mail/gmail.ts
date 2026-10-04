import { submitGmail } from "./smtp";
import { HttpError } from "../http";
import type { Env } from "../types";

export function mailConfigured(env: Env) {
  return /^[A-Za-z0-9]{16}$/.test(
    (env.GMAIL_APP_PASSWORD ?? "").replace(/\s/g, ""),
  );
}
export async function sendAccountMail(
  env: Env,
  recipient: string,
  purpose: "verify" | "reset",
  token: string,
) {
  if (!mailConfigured(env))
    throw new HttpError(
      503,
      "MAIL_UNAVAILABLE",
      "Email delivery is unavailable. Use your saved recovery code or retry later.",
    );
  const origin =
    env.ENVIRONMENT === "development"
      ? "http://localhost:8787"
      : "https://forge-ai-engineering.taufiqueansari895.workers.dev";
  const subject =
    purpose === "verify"
      ? "Verify your Forge email"
      : "Reset your Forge password";
  const text = `${subject}\n\nOpen this link and confirm the action:\n${origin}/account/email#${purpose}=${token}\n\nThis link expires in ${purpose === "verify" ? "24 hours" : "30 minutes"} and can be used once. If you did not request this, ignore this message. Never share this link.\n\nForge`;
  try {
    const { connect } = await import("cloudflare:sockets");
    await submitGmail(
      connect,
      env.GMAIL_APP_PASSWORD!,
      recipient,
      subject,
      text,
    );
  } catch (error) {
    // No SMTP responses, recipient, tokens or credentials enter logs/errors.
    const safeReasons = new Set([
      "MAIL_CONFIGURATION_INVALID",
      "MAIL_TIMEOUT",
      "MAIL_CONNECTION_FAILED",
      "MAIL_REPLY_TOO_LARGE",
      "MAIL_GREETING_REJECTED",
      "MAIL_EHLO_REJECTED",
      "MAIL_AUTH_REJECTED",
      "MAIL_SENDER_REJECTED",
      "MAIL_RECIPIENT_REJECTED",
      "MAIL_DATA_REJECTED",
      "MAIL_SUBMISSION_REJECTED",
    ]);
    const reason =
      error instanceof Error && safeReasons.has(error.message)
        ? error.message
        : "MAIL_TRANSPORT_FAILED";
    console.warn({ event: "account_mail_unavailable", reason });
    throw new HttpError(
      503,
      "MAIL_UNAVAILABLE",
      "Email delivery is unavailable. Use your saved recovery code or retry later.",
    );
  }
}
