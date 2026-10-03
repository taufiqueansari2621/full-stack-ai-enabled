// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { verifyAccountChallenge } from "../worker/turnstile";
import type { Env } from "../worker/types";
import { authRoutes } from "../worker/routes/auth";
import * as rateLimits from "../worker/rateLimit";
const env = {
  TURNSTILE_SITE_KEY: "public",
  TURNSTILE_SECRET_KEY: "private",
} as Env;
const request = new Request("https://forge.test/api/auth/login");
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
it("public config returns only the site key, never the secret, and is not cached", async () => {
  const config = authRoutes.find(
    (route) => route.pattern === "/api/auth/config",
  )!;
  const response = await config.handler({
    env,
    request,
    url: new URL(request.url),
    requestId: "test",
    user: null,
  });
  expect(await response.json()).toEqual({ turnstileSiteKey: "public" });
  expect(response.headers.get("cache-control")).toBe("no-store");
});
it.each(["register", "login", "recover"])(
  "enforces verification before any account database operation for %s",
  async (action) => {
    vi.spyOn(rateLimits, "enforceRateLimit").mockResolvedValue(undefined);
    const prepare = vi.fn(() => {
      throw new Error("Account database should not be touched");
    });
    const route = authRoutes.find(
      (route) => route.pattern === `/api/auth/${action}`,
    )!;
    const request = new Request(`https://forge.test/api/auth/${action}`, {
      method: "POST",
      headers: {
        origin: "https://forge.test",
        "content-type": "application/json",
      },
      body: JSON.stringify({ email: "test@example.invalid" }),
    });
    await expect(
      route.handler({
        env: { ...env, REGISTRATION_MODE: "open", DB: { prepare } },
        request,
        url: new URL(request.url),
        requestId: "test",
        user: null,
      }),
    ).rejects.toMatchObject({ code: "CHALLENGE_REQUIRED" });
    expect(prepare).not.toHaveBeenCalled();
  },
);
it("keeps unconfigured local learning usable without provider requests", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  await verifyAccountChallenge({} as Env, request, undefined, "login");
  expect(fetch).not.toHaveBeenCalled();
});
it("fails closed when a configured site is missing its secret", async () => {
  await expect(
    verifyAccountChallenge(
      { TURNSTILE_SITE_KEY: "public" } as Env,
      request,
      "token",
      "login",
    ),
  ).rejects.toMatchObject({ status: 503, code: "CHALLENGE_UNAVAILABLE" });
});
it.each([undefined, "", 123, "x".repeat(2049)])(
  "rejects invalid or oversized tokens before calling the provider: %s",
  async (token) => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await expect(
      verifyAccountChallenge(env, request, token, "login"),
    ).rejects.toMatchObject({ status: 400 });
    expect(fetch).not.toHaveBeenCalled();
  },
);
it.each([
  { success: false, "error-codes": ["timeout-or-duplicate"] },
  { success: true, hostname: "other.test", action: "login" },
  { success: true, hostname: "forge.test", action: "register" },
  null,
])(
  "rejects failed/replayed, wrong-host, wrong-action or malformed verification: %j",
  async (result) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(result)),
    );
    await expect(
      verifyAccountChallenge(env, request, "token", "login"),
    ).rejects.toMatchObject({ status: 400, code: "CHALLENGE_REJECTED" });
  },
);
it("accepts exact host/action success and sends only required verification fields with a deadline", async () => {
  const fetch = vi.fn(async () =>
    Response.json({ success: true, hostname: "forge.test", action: "login" }),
  );
  vi.stubGlobal("fetch", fetch);
  await verifyAccountChallenge(env, request, "token", "login");
  const options = (
    fetch.mock.calls as unknown as [string, RequestInit][]
  )[0][1];
  expect(JSON.parse(options.body as string)).toEqual({
    secret: "private",
    response: "token",
  });
  expect(options.signal).toBeInstanceOf(AbortSignal);
});
it.each(["network", "http", "json"])(
  "fails closed with safe messages on %s provider failure",
  async (failure) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        if (failure === "network")
          throw new Error("private provider diagnostics");
        return new Response("not-json", {
          status: failure === "http" ? 500 : 200,
        });
      }),
    );
    await expect(
      verifyAccountChallenge(env, request, "token", "login"),
    ).rejects.toMatchObject({ status: 503, code: "CHALLENGE_UNAVAILABLE" });
  },
);
