import type { AuthUser, Env } from "./types";

export type RequestContext = {
  request: Request;
  env: Env;
  url: URL;
  user: AuthUser | null;
};

export type Route = {
  method: string;
  pattern: string;
  auth?: boolean;
  handler: (context: RequestContext) => Promise<Response>;
};

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

export function json(data: unknown, status = 200, headers?: HeadersInit) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...headers },
  });
}

export function apiError(status: number, code: string, message: string) {
  return json({ error: { code, message } }, status);
}

export async function readJsonObject(request: Request, maxBytes = 64_000) {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > maxBytes)
    throw new HttpError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes)
    throw new HttpError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
  try {
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error("Expected an object");
    return value as Record<string, unknown>;
  } catch {
    throw new HttpError(400, "INVALID_JSON", "Send a valid JSON object.");
  }
}

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    throw new HttpError(
      403,
      "ORIGIN_REJECTED",
      "Cross-origin mutation rejected.",
    );
}
