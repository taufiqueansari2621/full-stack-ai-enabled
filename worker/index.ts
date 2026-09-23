import { authenticate } from "./auth";
import { HttpError, apiError, json, type Route } from "./http";
import { authRoutes } from "./routes/auth";
import { progressRoutes } from "./routes/progress";
import { profileRoutes } from "./routes/profile";
import { workspaceRoutes } from "./routes/workspace";
import { aiRoutes } from "./routes/ai";
import { portfolioRoutes } from "./routes/portfolio";
import { certificateRoutes } from "./routes/certificates";
import type { Env } from "./types";

const routes: Route[] = [
  {
    method: "GET",
    pattern: "/api/health",
    async handler({ env }) {
      const databaseStartedAt = Date.now();
      const database = await env.DB.prepare("SELECT 1 AS ok").first<{
        ok: number;
      }>();
      return json({
        status: "ok",
        database: database?.ok === 1 ? "connected" : "unavailable",
        databaseLatencyMs: Date.now() - databaseStartedAt,
      });
    },
  },
  ...authRoutes,
  ...progressRoutes,
  ...profileRoutes,
  ...workspaceRoutes,
  ...aiRoutes,
  ...portfolioRoutes,
  ...certificateRoutes,
];

const SECURITY_HEADERS = {
  "content-security-policy":
    "default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self' data: https://fonts.gstatic.com; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; worker-src 'self'",
  "cross-origin-opener-policy": "same-origin",
  "referrer-policy": "strict-origin-when-cross-origin",
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};

const RUNNER_CONTENT_SECURITY_POLICY =
  "default-src 'none'; connect-src 'none'; script-src 'self' 'unsafe-eval'";

type LogLevel = "info" | "warn" | "error";

function operationalLog(
  level: LogLevel,
  event: string,
  fields: Record<string, string | number | boolean | null>,
) {
  const entry = JSON.stringify({
    service: "forge-ai-engineering",
    event,
    timestamp: new Date().toISOString(),
    ...fields,
  });
  if (level === "error") console.error(entry);
  else if (level === "warn") console.warn(entry);
  else console.info(entry);
}

async function handleApi(request: Request, env: Env, requestId: string) {
  const url = new URL(request.url);
  const route = routes.find(
    (candidate) =>
      candidate.method === request.method && candidate.pattern === url.pathname,
  );
  if (!route) return apiError(404, "NOT_FOUND", "API route not found.");
  try {
    const user = await authenticate(request, env);
    if (route.auth && !user)
      return apiError(401, "AUTH_REQUIRED", "Log in to continue.");
    return await route.handler({ request, requestId, env, url, user });
  } catch (error) {
    if (error instanceof HttpError)
      return apiError(error.status, error.code, error.message);
    operationalLog("error", "api_unhandled_error", {
      requestId,
      method: request.method,
      route: route.pattern,
      errorType: error instanceof Error ? error.name : "UnknownError",
    });
    return apiError(
      500,
      "INTERNAL_ERROR",
      "Forge could not complete that request.",
    );
  }
}

export default {
  async fetch(request: Request, env: Env) {
    const requestId = crypto.randomUUID();
    const startedAt = Date.now();
    const url = new URL(request.url);
    const apiRequest = url.pathname.startsWith("/api/");
    let response: Response;
    try {
      response = apiRequest
        ? await handleApi(request, env, requestId)
        : await env.ASSETS.fetch(request);
    } catch (error) {
      operationalLog("error", "worker_unhandled_error", {
        requestId,
        method: request.method,
        route: apiRequest ? url.pathname : "static_asset",
        errorType: error instanceof Error ? error.name : "UnknownError",
      });
      response = apiRequest
        ? apiError(
            500,
            "INTERNAL_ERROR",
            "Forge could not complete that request.",
          )
        : new Response("Forge is temporarily unavailable.", { status: 503 });
    }
    const durationMs = Date.now() - startedAt;
    if (apiRequest) {
      const route =
        routes.find(
          (candidate) =>
            candidate.method === request.method &&
            candidate.pattern === url.pathname,
        )?.pattern ?? "unmatched_api_route";
      operationalLog(durationMs >= 1_000 ? "warn" : "info", "api_request", {
        requestId,
        method: request.method,
        route,
        status: response.status,
        durationMs,
        authenticated: request.headers.has("cookie"),
      });
      if (
        response.status >= 400 &&
        route.startsWith("/api/auth/") &&
        route !== "/api/auth/logout"
      )
        operationalLog("warn", "authentication_failed", {
          requestId,
          method: request.method,
          route,
          status: response.status,
        });
      if (response.status >= 500 && route === "/api/ai")
        operationalLog("error", "ai_request_failed", {
          requestId,
          status: response.status,
          durationMs,
        });
    }
    const secured = new Response(response.body, response);
    for (const [name, value] of Object.entries(SECURITY_HEADERS))
      secured.headers.set(name, value);
    if (url.pathname === "/runner-worker.js")
      secured.headers.set(
        "content-security-policy",
        RUNNER_CONTENT_SECURITY_POLICY,
      );
    secured.headers.set("x-request-id", requestId);
    secured.headers.set("server-timing", `forge;dur=${durationMs}`);
    return secured;
  },
};
