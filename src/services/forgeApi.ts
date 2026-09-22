export type AccountUser = {
  id: string;
  email: string;
  fullName: string;
  username: string;
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
  progress: () =>
    request<{ state: unknown; revision: number; updatedAt: string | null }>(
      "/api/progress",
    ),
  saveProgress: (state: unknown, revision: number) =>
    request<{ revision: number; updatedAt: string }>("/api/progress", {
      method: "PUT",
      body: JSON.stringify({ state, revision }),
    }),
};
