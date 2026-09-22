export type AccountUser = {
  id: string;
  email: string;
  fullName: string;
  username: string;
};

export type CloudProfile = {
  fullName: string;
  username: string;
  goal: string | null;
  framework: "react" | "angular" | "both" | null;
  dailyMinutes: number | null;
  difficulty: string | null;
  experience: string | null;
  target: string | null;
  diagnosticScore: number | null;
  recommendedPhase: string | null;
  onboardingComplete: boolean;
};

type ApiErrorBody = { error?: { code?: string; message?: string } };

export class ForgeApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...init,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const data = (await response.json()) as T & ApiErrorBody;
  if (!response.ok)
    throw new ForgeApiError(
      response.status,
      data.error?.code ?? "REQUEST_FAILED",
      data.error?.message ?? "Forge could not complete that request.",
    );
  return data;
}

export const forgeApi = {
  session: () => request<{ user: AccountUser | null }>("/api/me"),
  register: (input: {
    email: string;
    password: string;
    fullName: string;
    username: string;
  }) =>
    request<{ user: AccountUser; recoveryCode: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  login: (input: { email: string; password: string }) =>
    request<{ user: AccountUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  recover: (input: { email: string; recoveryCode: string; password: string }) =>
    request<{ ok: true; recoveryCode: string }>("/api/auth/recover", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  profile: () => request<{ profile: CloudProfile }>("/api/profile"),
  saveOnboarding: (input: {
    goal: string;
    experience: string;
    framework: string;
    dailyMinutes: number;
    target: string;
    difficulty: string;
    diagnosticAnswers: Record<string, string>;
  }) =>
    request<{ profile: CloudProfile; plan: Record<string, unknown> }>(
      "/api/profile",
      { method: "PUT", body: JSON.stringify(input) },
    ),
  progress: () =>
    request<{ state: unknown; revision: number; updatedAt: string | null }>(
      "/api/progress",
    ),
  saveProgress: (state: unknown, revision: number) =>
    request<{ revision: number; updatedAt: string }>("/api/progress", {
      method: "PUT",
      body: JSON.stringify({ state, revision }),
    }),
  workspace: () =>
    request<{
      files: Record<string, string> | null;
      activePath: string | null;
      revision: number;
      updatedAt: string | null;
    }>("/api/workspaces/default"),
  saveWorkspace: (
    files: Record<string, string>,
    activePath: string,
    revision: number,
  ) =>
    request<{ revision: number; updatedAt: string }>(
      "/api/workspaces/default",
      {
        method: "PUT",
        body: JSON.stringify({ files, activePath, revision }),
      },
    ),
  askAi: (input: {
    mode: string;
    message: string;
    level: number;
    context: Record<string, unknown>;
  }) =>
    request<{
      conversationId: string;
      response: string;
      provider: string;
      model: string;
      contextIncluded: string[];
      actions: string[];
    }>("/api/ai", { method: "POST", body: JSON.stringify(input) }),
};
