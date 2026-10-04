import type { LabAction, LabModelResult } from "../domain/aiLabProtocol";
import type {
  RecordPage,
  SavedProject,
  SavedInterviewSession,
  SavedInterviewAnswer,
} from "../domain/learningRecords";

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

export type PublicPortfolio = {
  username: string;
  fullName: string;
  published: boolean;
  about: string;
  skills: { name: string; evidence: string }[];
  projects: { id: string; title: string; progress: number; stack: string[] }[];
  caseStudies: { title: string; summary: string; evidence: string }[];
  certificates: {
    credentialId: string;
    certificateId: string;
    issuedAt: string;
    score: number;
  }[];
  updatedAt: string;
};
export type VerifiedCertificate = {
  credentialId: string;
  certificateId: string;
  score: number;
  issuedAt: string;
  fullName: string;
  username: string;
  evidence: {
    lessons: number;
    assessmentScore: number;
    correctPractice: number;
    projectMilestones: number;
    masteryArtifacts: number;
  };
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
  let data: T & ApiErrorBody;
  try {
    data = (await response.json()) as T & ApiErrorBody;
  } catch {
    throw new ForgeApiError(
      response.ok ? 502 : response.status,
      "UNREADABLE_RESPONSE",
      "Forge received an unreadable service response. Retry later; no result was accepted.",
    );
  }
  if (!response.ok)
    throw new ForgeApiError(
      response.status,
      data.error?.code ?? "REQUEST_FAILED",
      data.error?.message ?? "Forge could not complete that request.",
    );
  return data;
}

export const forgeApi = {
  emailStatus: (signal?: AbortSignal) =>
    request<{
      email: string;
      verifiedAt: string | null;
      deliveryConfigured: boolean;
    }>("/api/auth/email", { signal }),
  sendVerification: () =>
    request<{ ok: true }>("/api/auth/email/verify/request", {
      method: "POST",
      body: "{}",
    }),
  requestEmailReset: (email: string, turnstileToken: string) =>
    request<{ ok: true; message: string }>("/api/auth/email/reset/request", {
      method: "POST",
      body: JSON.stringify({ email, turnstileToken }),
    }),
  consumeEmail: (input: {
    token: string;
    purpose: "verify" | "reset";
    password?: string;
    turnstileToken?: string;
  }) =>
    request<{ ok: true; recoveryCode?: string }>("/api/auth/email/consume", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  accountSecurityConfig: (signal?: AbortSignal) =>
    request<{ turnstileSiteKey: string | null }>("/api/auth/config", {
      signal,
    }),
  activeSessions: (signal?: AbortSignal) =>
    request<{
      sessions: {
        id: string;
        createdAt: string;
        expiresAt: string;
        current: boolean;
      }[];
      truncated: boolean;
    }>("/api/auth/sessions", { signal }),
  revokeSessions: (
    input: { scope: "others" } | { scope: "session"; id: string },
  ) =>
    request<{ ok: true }>("/api/auth/sessions/revoke", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  projectRecords: (after = "", signal?: AbortSignal) =>
    request<RecordPage<SavedProject>>(
      `/api/learning-records?kind=projects&after=${encodeURIComponent(after)}`,
      { signal },
    ),
  interviewSessions: (after = "", signal?: AbortSignal) =>
    request<RecordPage<SavedInterviewSession>>(
      `/api/learning-records?kind=interviews&after=${encodeURIComponent(after)}`,
      { signal },
    ),
  interviewAnswers: (id: string, after = "", signal?: AbortSignal) =>
    request<RecordPage<SavedInterviewAnswer>>(
      `/api/learning-records/interview?id=${encodeURIComponent(id)}&after=${encodeURIComponent(after)}`,
      { signal },
    ),
  labInference: (
    action: LabAction,
    input: string,
    source: string,
    signal?: AbortSignal,
  ) =>
    request<LabModelResult & { model: string; latencyMs: number }>(
      "/api/ai/lab",
      {
        method: "POST",
        body: JSON.stringify({ action, input, source }),
        signal,
      },
    ),
  embedTexts: (texts: string[], signal?: AbortSignal) =>
    request<{ vectors: number[][]; model: string; latencyMs: number }>(
      "/api/ai/embeddings",
      { method: "POST", body: JSON.stringify({ texts }), signal },
    ),
  session: () => request<{ user: AccountUser | null }>("/api/me"),
  register: (input: {
    email: string;
    password: string;
    fullName: string;
    username: string;
    turnstileToken?: string;
  }) =>
    request<{ user: AccountUser; recoveryCode: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  login: (input: {
    email: string;
    password: string;
    turnstileToken?: string;
  }) =>
    request<{ user: AccountUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  recover: (input: {
    email: string;
    recoveryCode: string;
    password: string;
    turnstileToken?: string;
  }) =>
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
  askAi: (
    input: {
      mode: string;
      message: string;
      level: number;
      context: Record<string, unknown>;
    },
    signal?: AbortSignal,
  ) =>
    request<{
      conversationId: string;
      response: string;
      provider: string;
      model: string;
      contextIncluded: string[];
      actions: string[];
    }>("/api/ai", {
      method: "POST",
      body: JSON.stringify(input),
      signal,
    }),
  workspaceSnapshots: () =>
    request<{
      snapshots: {
        id: string;
        label: string;
        activePath: string;
        createdAt: string;
      }[];
    }>("/api/workspace-snapshots"),
  createWorkspaceSnapshot: (input: {
    label: string;
    files: Record<string, string>;
    activePath: string;
  }) =>
    request<{
      snapshot: {
        id: string;
        label: string;
        activePath: string;
        createdAt: string;
      };
    }>("/api/workspace-snapshots", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  workspaceSnapshot: (id: string) =>
    request<{
      snapshot: {
        id: string;
        label: string;
        files: Record<string, string>;
        activePath: string;
        createdAt: string;
      };
    }>(`/api/workspace-snapshot?id=${encodeURIComponent(id)}`),
  portfolio: () =>
    request<{ portfolio: PublicPortfolio | null }>("/api/portfolio"),
  savePortfolio: (
    input: Omit<PublicPortfolio, "username" | "fullName" | "updatedAt">,
  ) =>
    request<{ portfolio: PublicPortfolio }>("/api/portfolio", {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  publicPortfolio: (username: string) =>
    request<{ portfolio: PublicPortfolio }>(
      `/api/public-profile?username=${encodeURIComponent(username)}`,
    ),
  certificates: () =>
    request<{ certificates: VerifiedCertificate[] }>("/api/certificates"),
  issueCertificate: () =>
    request<{ certificate: VerifiedCertificate }>("/api/certificates/issue", {
      method: "POST",
    }),
  verifyCertificate: (id: string) =>
    request<{ certificate: VerifiedCertificate }>(
      `/api/certificate?id=${encodeURIComponent(id)}`,
    ),
};
