import {
  HttpError,
  assertSameOrigin,
  json,
  readJsonObject,
  type Route,
} from "../http";

const goals = new Set([
  "frontend-engineer",
  "full-stack-engineer",
  "ai-engineer",
  "full-stack-ai-engineer",
  "interview-ready",
  "dsa-focus",
]);
const experiences = new Set([
  "complete-beginner",
  "some-programming",
  "junior-developer",
  "mid-level-developer",
  "experienced-developer",
]);
const frameworks = new Set(["react", "angular", "both"]);
const targets = new Set([
  "learn-from-zero",
  "first-developer-job",
  "switch-technology",
  "product-companies",
  "become-ai-engineer",
  "improve-system-design",
  "prepare-interviews",
]);
const answerKey: Record<string, string> = {
  "web-foundation": "semantic-html",
  javascript: "microtask-before-timer",
  typescript: "unknown-needs-narrowing",
  backend: "server-validates-identity",
  data: "index-tradeoff",
  ai: "evaluate-retrieval-and-answer",
};

type ProfileRow = {
  fullName: string;
  username: string;
  learningGoal: string | null;
  frameworkPath: string | null;
  dailyMinutes: number | null;
  difficulty: string | null;
  experienceLevel: string | null;
  targetOutcome: string | null;
  diagnosticScore: number | null;
  recommendedPhase: string | null;
  onboardingCompletedAt: string | null;
};

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function profileResponse(row: ProfileRow) {
  return {
    fullName: row.fullName,
    username: row.username,
    goal: row.learningGoal,
    framework: row.frameworkPath,
    dailyMinutes: row.dailyMinutes,
    difficulty: row.difficulty,
    experience: row.experienceLevel,
    target: row.targetOutcome,
    diagnosticScore: row.diagnosticScore,
    recommendedPhase: row.recommendedPhase,
    onboardingComplete: Boolean(row.onboardingCompletedAt),
  };
}

const selectProfile = `SELECT full_name AS fullName, username,
  learning_goal AS learningGoal, framework_path AS frameworkPath,
  daily_minutes AS dailyMinutes, difficulty,
  experience_level AS experienceLevel, target_outcome AS targetOutcome,
  diagnostic_score AS diagnosticScore, recommended_phase AS recommendedPhase,
  onboarding_completed_at AS onboardingCompletedAt
  FROM profiles WHERE user_id = ?`;

export const profileRoutes: Route[] = [
  {
    method: "GET",
    pattern: "/api/profile",
    auth: true,
    async handler({ env, user }) {
      const row = await env.DB.prepare(selectProfile)
        .bind(user!.id)
        .first<ProfileRow>();
      if (!row)
        throw new HttpError(404, "PROFILE_NOT_FOUND", "Profile not found.");
      return json({ profile: profileResponse(row) });
    },
  },
  {
    method: "PUT",
    pattern: "/api/profile",
    auth: true,
    async handler({ request, env, user }) {
      assertSameOrigin(request);
      const body = await readJsonObject(request, 24_000);
      const goal = text(body.goal);
      const experience = text(body.experience);
      const framework = text(body.framework);
      const target = text(body.target);
      const dailyMinutes = Number(body.dailyMinutes);
      const difficulty = text(body.difficulty);
      const answers = body.diagnosticAnswers;
      if (
        !goals.has(goal) ||
        !experiences.has(experience) ||
        !frameworks.has(framework) ||
        !targets.has(target)
      )
        throw new HttpError(
          400,
          "INVALID_ONBOARDING",
          "Choose a valid goal, experience, framework, and target.",
        );
      if (![30, 60, 120, 180].includes(dailyMinutes))
        throw new HttpError(
          400,
          "INVALID_STUDY_TIME",
          "Choose an available daily study time.",
        );
      if (!["beginner", "balanced", "challenging"].includes(difficulty))
        throw new HttpError(
          400,
          "INVALID_DIFFICULTY",
          "Choose a valid learning difficulty.",
        );
      if (!answers || typeof answers !== "object" || Array.isArray(answers))
        throw new HttpError(
          400,
          "INVALID_DIAGNOSTIC",
          "Complete the diagnostic assessment.",
        );
      const submitted = answers as Record<string, unknown>;
      const score = Object.entries(answerKey).reduce(
        (total, [question, answer]) =>
          total + (submitted[question] === answer ? 1 : 0),
        0,
      );
      const recommendedPhase =
        score <= 1
          ? "phase-00"
          : score <= 3
            ? "phase-01"
            : score <= 4
              ? "phase-03"
              : "phase-05";
      const now = new Date().toISOString();
      await env.DB.prepare(
        `UPDATE profiles SET learning_goal = ?, framework_path = ?, daily_minutes = ?,
          difficulty = ?, experience_level = ?, target_outcome = ?, diagnostic_score = ?,
          recommended_phase = ?, diagnostic_answers_json = ?, onboarding_completed_at = ?, updated_at = ?
         WHERE user_id = ?`,
      )
        .bind(
          goal,
          framework,
          dailyMinutes,
          difficulty === "balanced"
            ? "intermediate"
            : difficulty === "challenging"
              ? "advanced"
              : "beginner",
          experience,
          target,
          score,
          recommendedPhase,
          JSON.stringify(submitted),
          now,
          now,
          user!.id,
        )
        .run();
      const row = await env.DB.prepare(selectProfile)
        .bind(user!.id)
        .first<ProfileRow>();
      if (!row)
        throw new HttpError(404, "PROFILE_NOT_FOUND", "Profile not found.");
      return json({
        profile: profileResponse(row),
        plan: {
          recommendedPhase,
          diagnosticScore: score,
          possibleSkips:
            score >= 5
              ? ["Orientation", "HTML/CSS fundamentals"]
              : score >= 3
                ? ["Orientation"]
                : [],
          weakAreas: Object.keys(answerKey).filter(
            (question) => submitted[question] !== answerKey[question],
          ),
          dailyMissionMinutes: dailyMinutes,
          weeklyTargetMinutes: dailyMinutes * 6,
        },
      });
    },
  },
];
