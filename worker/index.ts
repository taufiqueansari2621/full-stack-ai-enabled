import { authenticate } from "./auth";
import { HttpError, apiError, json, type Route } from "./http";
import { authRoutes } from "./routes/auth";
import { progressRoutes } from "./routes/progress";
import type { Env } from "./types";

const routes: Route[] = [
  {
    method: "GET",
    pattern: "/api/health",
    async handler({ env }) {
      const database = await env.DB.prepare("SELECT 1 AS ok").first<{
        ok: number;
      }>();
      return json({
        status: "ok",
        database: database?.ok === 1 ? "connected" : "unavailable",
      });
    },
  },
  ...authRoutes,
  ...progressRoutes,
];

const SECURITY_HEADERS = {
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};

async function handleApi(request: Request, env: Env) {
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
    return await route.handler({ request, env, url, user });
  } catch (error) {
    if (error instanceof HttpError)
      return apiError(error.status, error.code, error.message);
    console.error("Unhandled API error", error);
    return apiError(
      500,
      "INTERNAL_ERROR",
      "Forge could not complete that request.",
    );
  }
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const response = url.pathname.startsWith("/api/")
      ? await handleApi(request, env)
      : await env.ASSETS.fetch(request);
    const secured = new Response(response.body, response);
    for (const [name, value] of Object.entries(SECURITY_HEADERS))
      secured.headers.set(name, value);
    return secured;
  },
};
