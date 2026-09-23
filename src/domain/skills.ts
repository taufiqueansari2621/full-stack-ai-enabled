import type { ForgeState } from "../useForgeStore";

export type SkillState =
  | "Not started"
  | "Learning"
  | "Practicing"
  | "Applied"
  | "Needs review"
  | "Strong";
export type SkillSignal = {
  id: string;
  name: string;
  state: SkillState;
  evidence: string[];
  action: "learn" | "practice" | "projects" | "labs" | "interview" | "reviews";
};

const definitions: Omit<SkillSignal, "state" | "evidence">[] = [
  { id: "javascript", name: "JavaScript", action: "practice" },
  { id: "typescript", name: "TypeScript", action: "learn" },
  { id: "react", name: "React", action: "projects" },
  { id: "node", name: "Node.js", action: "projects" },
  { id: "postgresql", name: "PostgreSQL & SQL", action: "labs" },
  { id: "dsa", name: "DSA", action: "labs" },
  { id: "system-design", name: "System Design", action: "labs" },
  { id: "python", name: "Python", action: "learn" },
  { id: "machine-learning", name: "Machine Learning", action: "learn" },
  { id: "rag", name: "RAG & AI Systems", action: "labs" },
];

const includes = (value: string, terms: string[]) =>
  terms.some((term) => value.toLowerCase().includes(term));

export function buildSkillMatrix(
  state: ForgeState,
  now: number,
): SkillSignal[] {
  return definitions.map((definition) => {
    const terms =
      definition.id === "postgresql"
        ? ["sql", "postgres", "database"]
        : definition.id === "node"
          ? ["node", "backend", "api"]
          : definition.id === "machine-learning"
            ? ["machine", "ml"]
            : definition.id === "system-design"
              ? ["system-design", "system design", "architecture"]
              : [definition.id];
    const lessons = state.completedLessons.filter((id) => includes(id, terms));
    const attempts = state.practiceAttempts.filter((item) =>
      includes(item.challengeId, terms),
    );
    const correct = attempts.filter((item) => item.correct);
    const projects = Object.entries(state.projectTasks).filter(
      ([id, tasks]) =>
        tasks.length &&
        (includes(id, terms) ||
          (definition.id === "react" && id === "p11") ||
          (definition.id === "node" && ["p20", "p25"].includes(id)) ||
          (definition.id === "rag" && id === "p31")),
    );
    const labs = state.labArtifacts.filter(
      (item) =>
        (definition.id === "postgresql" && item.lab === "sql") ||
        (definition.id === "system-design" && item.lab === "system-design") ||
        (definition.id === "rag" && item.lab === "rag") ||
        (definition.id === "dsa" && item.lab === "dsa"),
    );
    const interviews = state.interviewResults.filter((item) =>
      includes(`${item.topic ?? ""} ${item.question}`, terms),
    );
    const reviews = state.reviewSchedule.filter((item) =>
      includes(item.topic, terms),
    );
    const artifacts = state.masteryArtifacts.filter((item) =>
      includes(item.lessonId, terms),
    );
    const evidence = [
      lessons.length
        ? `${lessons.length} completed lesson${lessons.length === 1 ? "" : "s"}`
        : "",
      attempts.length
        ? `${correct.length}/${attempts.length} correct practice attempts`
        : "",
      projects.length
        ? `${projects.reduce((sum, [, tasks]) => sum + tasks.length, 0)} project milestones`
        : "",
      labs.length
        ? `${labs.length} saved lab ${labs.length === 1 ? "case study" : "case studies"}`
        : "",
      interviews.length
        ? `${interviews.length} interview response${interviews.length === 1 ? "" : "s"}`
        : "",
      artifacts.length
        ? `${artifacts.length} mastery artifact${artifacts.length === 1 ? "" : "s"}`
        : "",
      reviews.some((item) => new Date(item.nextReviewAt).getTime() <= now)
        ? "Recall review is due"
        : "",
    ].filter(Boolean);
    const due = reviews.some(
      (item) => new Date(item.nextReviewAt).getTime() <= now,
    );
    const evidenceKinds = [
      lessons.length,
      correct.length,
      projects.length,
      labs.length,
      interviews.length,
      artifacts.length,
    ].filter(Boolean).length;
    let stateLabel: SkillState = "Not started";
    if (due) stateLabel = "Needs review";
    else if (evidenceKinds >= 4 && correct.length >= 2) stateLabel = "Strong";
    else if (projects.length || labs.length) stateLabel = "Applied";
    else if (attempts.length || interviews.length || artifacts.length)
      stateLabel = "Practicing";
    else if (lessons.length) stateLabel = "Learning";
    return { ...definition, state: stateLabel, evidence };
  });
}
