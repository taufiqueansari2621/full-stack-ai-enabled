import { HttpError, assertSameOrigin, json, type Route } from "../http";

type CredentialRow = {
  id: string;
  certificateId: string;
  score: number;
  issuedAt: string;
  fullName: string;
  username: string;
  evidenceJson: string;
};
const select = `SELECT cc.id, cc.certificate_id AS certificateId, cc.score, cc.issued_at AS issuedAt,
 p.full_name AS fullName, p.username, cc.evidence_json AS evidenceJson
 FROM certificate_credentials cc JOIN profiles p ON p.user_id = cc.user_id`;
function output(row: CredentialRow) {
  return {
    credentialId: row.id,
    certificateId: row.certificateId,
    score: row.score,
    issuedAt: row.issuedAt,
    fullName: row.fullName,
    username: row.username,
    evidence: JSON.parse(row.evidenceJson),
  };
}

export const certificateRoutes: Route[] = [
  {
    method: "GET",
    pattern: "/api/certificates",
    auth: true,
    async handler({ env, user }) {
      const rows = await env.DB.prepare(
        `${select} WHERE cc.user_id = ? ORDER BY cc.issued_at DESC`,
      )
        .bind(user!.id)
        .run<CredentialRow>();
      return json({ certificates: (rows.results ?? []).map(output) });
    },
  },
  {
    method: "POST",
    pattern: "/api/certificates/issue",
    auth: true,
    async handler({ request, env, user }) {
      assertSameOrigin(request);
      const existing = await env.DB.prepare(
        `${select} WHERE cc.user_id = ? AND cc.certificate_id = 'forge-foundations'`,
      )
        .bind(user!.id)
        .first<CredentialRow>();
      if (existing) return json({ certificate: output(existing) });
      const snapshot = await env.DB.prepare(
        "SELECT state_json AS stateJson FROM progress_snapshots WHERE user_id = ?",
      )
        .bind(user!.id)
        .first<{ stateJson: string }>();
      if (!snapshot)
        throw new HttpError(
          409,
          "EVIDENCE_REQUIRED",
          "Sync your learning evidence before requesting a certificate.",
        );
      let state: Record<string, unknown>;
      try {
        state = JSON.parse(snapshot.stateJson);
      } catch {
        throw new HttpError(
          409,
          "INVALID_EVIDENCE",
          "Learning evidence could not be verified.",
        );
      }
      const lessons = Array.isArray(state.completedLessons)
        ? state.completedLessons.length
        : 0;
      const quizzes = Array.isArray(state.quizResults)
        ? (state.quizResults as { quizId?: string; score?: number }[])
        : [];
      const score = Math.max(
        0,
        ...quizzes
          .filter((item) => item.quizId === "foundation-assessment")
          .map((item) => Number(item.score) || 0),
      );
      const attempts = Array.isArray(state.practiceAttempts)
        ? (state.practiceAttempts as { correct?: boolean }[])
        : [];
      const correctPractice = attempts.filter(
        (item) => item.correct === true,
      ).length;
      const tasks =
        state.projectTasks && typeof state.projectTasks === "object"
          ? Object.values(
              state.projectTasks as Record<string, unknown>,
            ).reduce<number>(
              (total, value) =>
                total + (Array.isArray(value) ? value.length : 0),
              0,
            )
          : 0;
      const artifacts = Array.isArray(state.masteryArtifacts)
        ? state.masteryArtifacts.length
        : 0;
      const evidence = {
        lessons,
        assessmentScore: score,
        correctPractice,
        projectMilestones: tasks,
        masteryArtifacts: artifacts,
      };
      if (
        lessons < 6 ||
        score < 80 ||
        correctPractice < 3 ||
        tasks < 3 ||
        artifacts < 3
      )
        throw new HttpError(
          409,
          "CERTIFICATE_REQUIREMENTS_NOT_MET",
          "Complete lessons, pass the assessment, solve practice, finish project milestones, and submit mastery evidence.",
        );
      const issuedAt = new Date().toISOString();
      const id = `FORGE-FND-${issuedAt.slice(0, 4)}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      await env.DB.prepare(
        "INSERT INTO certificate_credentials (id, user_id, certificate_id, score, evidence_json, issued_at) VALUES (?, ?, 'forge-foundations', ?, ?, ?)",
      )
        .bind(id, user!.id, score, JSON.stringify(evidence), issuedAt)
        .run();
      const row = await env.DB.prepare(`${select} WHERE cc.id = ?`)
        .bind(id)
        .first<CredentialRow>();
      return json({ certificate: output(row!) }, 201);
    },
  },
  {
    method: "GET",
    pattern: "/api/certificate",
    async handler({ env, url }) {
      const id = url.searchParams.get("id") ?? "";
      if (!/^FORGE-FND-\d{4}-[A-F0-9]{8}$/.test(id))
        throw new HttpError(
          404,
          "CERTIFICATE_NOT_FOUND",
          "Certificate not found.",
        );
      const row = await env.DB.prepare(`${select} WHERE cc.id = ?`)
        .bind(id)
        .first<CredentialRow>();
      if (!row)
        throw new HttpError(
          404,
          "CERTIFICATE_NOT_FOUND",
          "Certificate not found.",
        );
      return json({ certificate: output(row) }, 200, {
        "cache-control": "public, max-age=300",
      });
    },
  },
];
