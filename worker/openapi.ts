import { json, type Route } from "./http.ts";

const jsonContent = (schema: Record<string, unknown>) => ({
  "application/json": { schema },
});

const errorResponses = {
  "400": { $ref: "#/components/responses/BadRequest" },
  "401": { $ref: "#/components/responses/Unauthorized" },
  "409": { $ref: "#/components/responses/Conflict" },
  "429": { $ref: "#/components/responses/RateLimited" },
  "500": { $ref: "#/components/responses/InternalError" },
};

function operation(
  operationId: string,
  summary: string,
  tag: string,
  options: {
    authenticated?: boolean;
    mutating?: boolean;
    parameters?: unknown[];
    requestSchema?: Record<string, unknown>;
    successStatus?: "200" | "201";
    successDescription?: string;
  } = {},
) {
  const successStatus = options.successStatus ?? "200";
  return {
    operationId,
    summary,
    tags: [tag],
    ...(options.authenticated ? { security: [{ sessionCookie: [] }] } : {}),
    ...(options.parameters ? { parameters: options.parameters } : {}),
    ...(options.requestSchema
      ? {
          requestBody: {
            required: true,
            content: jsonContent(options.requestSchema),
          },
        }
      : {}),
    responses: {
      [successStatus]: {
        description: options.successDescription ?? "Successful response.",
        content: jsonContent({ type: "object" }),
      },
      ...errorResponses,
    },
    ...(options.mutating
      ? {
          description:
            "Same-origin request required. Retried writes must preserve the revision or use the operation's naturally idempotent resource key.",
        }
      : {}),
  };
}

const objectBody = {
  type: "object",
  additionalProperties: true,
};

const query = (name: string, description: string) => ({
  name,
  in: "query",
  required: true,
  description,
  schema: { type: "string", minLength: 1 },
});

export const OPENAPI_DOCUMENT = {
  openapi: "3.1.0",
  info: {
    title: "Forge Learning API",
    version: "1.0.0",
    description:
      "The production contract for Forge accounts, learning state, workspaces, AI tutoring, portfolios, and certificates. `/api/v1` is canonical; existing `/api` clients remain compatible.",
  },
  servers: [{ url: "/api/v1", description: "Current origin, stable v1" }],
  tags: [
    { name: "Operations" },
    { name: "Authentication" },
    { name: "Profile" },
    { name: "Progress" },
    { name: "Workspace" },
    { name: "AI" },
    { name: "Portfolio" },
    { name: "Certificates" },
  ],
  paths: {
    "/health": {
      get: operation("getHealth", "Check Worker and D1 health", "Operations"),
    },
    "/openapi.json": {
      get: operation(
        "getOpenApiDocument",
        "Read the Forge v1 API contract",
        "Operations",
      ),
    },
    "/auth/register": {
      post: operation(
        "registerAccount",
        "Create an account and session",
        "Authentication",
        {
          mutating: true,
          requestSchema: {
            type: "object",
            required: ["email", "fullName", "username", "password"],
            properties: {
              email: { type: "string", format: "email", maxLength: 254 },
              fullName: { type: "string", minLength: 2, maxLength: 80 },
              username: { type: "string", minLength: 3, maxLength: 30 },
              password: { type: "string", minLength: 10, maxLength: 128 },
            },
            additionalProperties: false,
          },
          successStatus: "201",
        },
      ),
    },
    "/auth/recover": {
      post: operation(
        "recoverAccount",
        "Rotate a password with a recovery code",
        "Authentication",
        { mutating: true, requestSchema: objectBody },
      ),
    },
    "/auth/login": {
      post: operation("login", "Create a session", "Authentication", {
        mutating: true,
        requestSchema: objectBody,
      }),
    },
    "/auth/logout": {
      post: operation(
        "logout",
        "Revoke the current session",
        "Authentication",
        { mutating: true },
      ),
    },
    "/me": {
      get: operation(
        "getSessionUser",
        "Read the current session user",
        "Authentication",
      ),
    },
    "/profile": {
      get: operation("getProfile", "Read onboarding profile", "Profile", {
        authenticated: true,
      }),
      put: operation("updateProfile", "Save onboarding profile", "Profile", {
        authenticated: true,
        mutating: true,
        requestSchema: objectBody,
      }),
    },
    "/progress": {
      get: operation("getProgress", "Read learning state", "Progress", {
        authenticated: true,
      }),
      put: operation("putProgress", "Save learning state", "Progress", {
        authenticated: true,
        mutating: true,
        requestSchema: {
          type: "object",
          required: ["state", "revision"],
          properties: {
            state: { type: "object" },
            revision: { type: "integer", minimum: 0 },
          },
          additionalProperties: false,
        },
      }),
    },
    "/workspaces/default": {
      get: operation(
        "getDefaultWorkspace",
        "Read the default workspace",
        "Workspace",
        { authenticated: true },
      ),
      put: operation(
        "putDefaultWorkspace",
        "Save the default workspace",
        "Workspace",
        {
          authenticated: true,
          mutating: true,
          requestSchema: objectBody,
        },
      ),
    },
    "/workspace-snapshots": {
      get: operation(
        "listWorkspaceSnapshots",
        "List up to 20 newest snapshots",
        "Workspace",
        { authenticated: true },
      ),
      post: operation(
        "createWorkspaceSnapshot",
        "Create an immutable snapshot",
        "Workspace",
        {
          authenticated: true,
          mutating: true,
          requestSchema: objectBody,
          successStatus: "201",
        },
      ),
    },
    "/workspace-snapshot": {
      get: operation(
        "getWorkspaceSnapshot",
        "Read one owned snapshot",
        "Workspace",
        { authenticated: true, parameters: [query("id", "Snapshot ID")] },
      ),
    },
    "/ai": {
      post: operation("askForgeAi", "Ask the contextual tutor", "AI", {
        authenticated: true,
        mutating: true,
        requestSchema: objectBody,
      }),
    },
    "/portfolio": {
      get: operation("getPortfolio", "Read the portfolio draft", "Portfolio", {
        authenticated: true,
      }),
      put: operation(
        "putPortfolio",
        "Save or publish a portfolio",
        "Portfolio",
        {
          authenticated: true,
          mutating: true,
          requestSchema: objectBody,
        },
      ),
    },
    "/public-profile": {
      get: operation(
        "getPublicProfile",
        "Read an explicitly published portfolio",
        "Portfolio",
        { parameters: [query("username", "Published username")] },
      ),
    },
    "/certificates": {
      get: operation(
        "listCertificates",
        "List the learner's credentials",
        "Certificates",
        { authenticated: true },
      ),
    },
    "/certificates/issue": {
      post: operation(
        "issueCertificate",
        "Issue or return the evidence-verified credential",
        "Certificates",
        { authenticated: true, mutating: true },
      ),
    },
    "/certificate": {
      get: operation(
        "verifyCertificate",
        "Verify a public credential",
        "Certificates",
        { parameters: [query("id", "Forge credential ID")] },
      ),
    },
  },
  components: {
    securitySchemes: {
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: "__Host-forge_session",
        description: "HttpOnly, Secure, SameSite=Lax production session.",
      },
    },
    schemas: {
      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: { type: "string" },
              message: { type: "string" },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: true,
      },
    },
    responses: Object.fromEntries(
      [
        ["BadRequest", "Invalid request."],
        ["Unauthorized", "Authentication required."],
        ["Conflict", "Revision or resource conflict."],
        ["RateLimited", "Rate limit exceeded."],
        ["InternalError", "Unexpected service failure."],
      ].map(([name, description]) => [
        name,
        {
          description,
          content: jsonContent({ $ref: "#/components/schemas/Error" }),
        },
      ]),
    ),
  },
} as const;

export const openApiRoutes: Route[] = [
  {
    method: "GET",
    pattern: "/api/openapi.json",
    async handler() {
      return json(OPENAPI_DOCUMENT, 200, {
        "cache-control": "public, max-age=300",
      });
    },
  },
];
