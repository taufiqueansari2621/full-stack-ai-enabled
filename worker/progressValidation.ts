type RecordValue = Record<string, unknown>;
const record = (value: unknown): value is RecordValue =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown) =>
  typeof value === "string" && value.length <= 120_000;

export function validateProgress(state: unknown): string | null {
  if (!record(state) || state.version !== 1)
    return "Progress must be a Forge version 1 object.";
  const fields: Record<string, string[]> = {
    knowledge: ["id", "title", "body"],
    reviewSchedule: ["id", "sourceId", "nextReviewAt"],
    practiceAttempts: ["challengeId", "answer", "attemptedAt"],
    interviewResults: ["id", "question", "answer", "createdAt"],
    quizResults: ["id", "quizId", "completedAt"],
    masteryArtifacts: ["id", "lessonId", "level", "response", "updatedAt"],
  };
  for (const [field, required] of Object.entries(fields)) {
    const values = state[field];
    if (values === undefined) continue; // Earlier version-1 exports can omit new collections.
    if (!Array.isArray(values) || values.length > 5_000)
      return `${field} must be a bounded list.`;
    const ids = new Set<string>();
    for (const value of values) {
      if (!record(value) || required.some((key) => !text(value[key])))
        return `${field} contains an invalid record.`;
      if (required.includes("id")) {
        const id = String(value.id);
        if (!id || id.length > 300 || ids.has(id))
          return `${field} requires distinct non-empty record IDs.`;
        ids.add(id);
      }
      if (field === "practiceAttempts" && typeof value.correct !== "boolean")
        return "Practice correctness must be boolean.";
      if (
        ["interviewResults", "quizResults"].includes(field) &&
        (typeof value.score !== "number" ||
          !Number.isFinite(value.score) ||
          value.score < 0 ||
          value.score > 100)
      )
        return "Scores must be numbers between 0 and 100.";
      if (
        field === "reviewSchedule" &&
        (!Number.isSafeInteger(value.streak) || Number(value.streak) < 0)
      )
        return "Review streak must be a non-negative integer.";
    }
  }
  if (
    state.completedLessons !== undefined &&
    (!Array.isArray(state.completedLessons) ||
      !state.completedLessons.every(text))
  )
    return "Completed lessons must be a list of IDs.";
  if (
    state.projectTasks !== undefined &&
    (!record(state.projectTasks) ||
      Object.values(state.projectTasks).some(
        (tasks) => !Array.isArray(tasks) || !tasks.every(text),
      ))
  )
    return "Project tasks must contain lists of task IDs.";
  return null;
}
