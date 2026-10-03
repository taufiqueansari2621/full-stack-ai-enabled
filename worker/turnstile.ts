import { HttpError } from "./http";
import type { Env } from "./types";

export async function verifyAccountChallenge(
  env: Env,
  request: Request,
  token: unknown,
  action: string,
) {
  if (!env.TURNSTILE_SITE_KEY) return;
  if (!env.TURNSTILE_SECRET_KEY)
    throw new HttpError(
      503,
      "CHALLENGE_UNAVAILABLE",
      "Account verification is temporarily unavailable. Please retry later.",
    );
  if (typeof token !== "string" || !token || token.length > 2048)
    throw new HttpError(
      400,
      "CHALLENGE_REQUIRED",
      "Complete the security check and try again.",
    );
  let result: unknown;
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          secret: env.TURNSTILE_SECRET_KEY,
          response: token,
        }),
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!response.ok) throw new Error("Provider unavailable");
    result = await response.json();
  } catch {
    throw new HttpError(
      503,
      "CHALLENGE_UNAVAILABLE",
      "Security check could not be verified. Refresh the check and retry.",
    );
  }
  if (
    !result ||
    typeof result !== "object" ||
    !("success" in result) ||
    result.success !== true ||
    !("hostname" in result) ||
    result.hostname !== new URL(request.url).hostname ||
    !("action" in result) ||
    result.action !== action
  )
    throw new HttpError(
      400,
      "CHALLENGE_REJECTED",
      "Security check expired or was rejected. Complete a new check and retry.",
    );
}
