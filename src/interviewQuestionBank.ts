import { curriculumPhases } from "./curriculumCatalog";

export const interviewRoles = [
  "All roles",
  "Frontend Developer",
  "Full-Stack Developer",
  "AI Engineer",
] as const;
export const interviewDifficulties = [
  "All levels",
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;
export const interviewFormats = [
  "All formats",
  "Explain",
  "Coding & practical",
  "Debugging",
  "System design",
  "Experience",
] as const;

export type InterviewRole = (typeof interviewRoles)[number];
export type InterviewDifficulty = Exclude<
  (typeof interviewDifficulties)[number],
  "All levels"
>;
export type InterviewFormat = Exclude<
  (typeof interviewFormats)[number],
  "All formats"
>;

export type InterviewFilters = {
  role: InterviewRole;
  phaseId: string;
  difficulty: (typeof interviewDifficulties)[number];
  format: (typeof interviewFormats)[number];
  query: string;
};

export type InterviewQuestion = {
  id: string;
  phaseId: string;
  phase: string;
  moduleId: string;
  module: string;
  topic: string;
  roles: Exclude<InterviewRole, "All roles">[];
  difficulty: InterviewDifficulty;
  format: InterviewFormat;
  prompt: string;
  hint: string;
  answerGuide: string[];
  followUp: string;
};

type InterviewTopic = Omit<
  InterviewQuestion,
  "id" | "difficulty" | "format" | "prompt" | "hint" | "answerGuide" | "followUp"
> & { topicIndex: number };

type QuestionVariant = {
  key: string;
  difficulty: InterviewDifficulty;
  format: InterviewFormat;
};

const rolePhases: Record<Exclude<InterviewRole, "All roles">, Set<string>> = {
  "Frontend Developer": new Set([
    "orientation",
    "web",
    "javascript",
    "typescript",
    "frontend",
    "dsa",
    "system-design",
    "devops",
    "career",
  ]),
  "Full-Stack Developer": new Set([
    "orientation",
    "web",
    "javascript",
    "typescript",
    "frontend",
    "backend",
    "dsa",
    "system-design",
    "python",
    "devops",
    "career",
  ]),
  "AI Engineer": new Set([
    "orientation",
    "python",
    "machine-learning",
    "deep-learning",
    "llm",
    "rag",
    "agents",
    "full-stack-ai",
    "backend",
    "system-design",
    "devops",
    "career",
  ]),
};

const rolesForPhase = (phaseId: string) =>
  (Object.entries(rolePhases) as Array<
    [Exclude<InterviewRole, "All roles">, Set<string>]
  >)
    .filter(([, phases]) => phases.has(phaseId))
    .map(([role]) => role);

export const interviewTopics: InterviewTopic[] = curriculumPhases.flatMap(
  (phase) =>
    phase.modules.flatMap((module) =>
      module.topics.map((topic, topicIndex) => ({
        phaseId: phase.id,
        phase: phase.title,
        moduleId: module.id,
        module: module.title,
        topic,
        topicIndex,
        roles: rolesForPhase(phase.id),
      })),
    ),
);

const variants: QuestionVariant[] = (
  ["Beginner", "Intermediate", "Advanced"] as InterviewDifficulty[]
).flatMap((difficulty) =>
  (
    [
      "Explain",
      "Coding & practical",
      "Debugging",
      "System design",
      "Experience",
    ] as InterviewFormat[]
  ).map((format) => ({
    key: `${difficulty.toLowerCase()}-${format.toLowerCase().replace(/[^a-z]+/g, "-")}`,
    difficulty,
    format,
  })),
);

export const INTERVIEW_QUESTION_COUNT = interviewTopics.length * variants.length;

const promptFor = (topic: InterviewTopic, variant: QuestionVariant) => {
  const { difficulty, format } = variant;
  if (difficulty === "Beginner") {
    if (format === "Explain")
      return `Explain ${topic.topic} in plain language. What problem does it solve, and what is the smallest correct example?`;
    if (format === "Coding & practical")
      return `Walk through how you would build a small example of ${topic.topic}. Name the input, the main steps, the expected result, and one check.`;
    if (format === "Debugging")
      return `A beginner says their ${topic.topic} example does not work. What would you inspect first, and how would you isolate the cause?`;
    if (format === "System design")
      return `Where does ${topic.topic} fit inside a ${topic.module} solution? Draw or describe the simplest useful data flow.`;
    return `Tell me about a time you learned or used ${topic.topic}. What was difficult, what did you try, and what did you learn?`;
  }
  if (difficulty === "Intermediate") {
    if (format === "Explain")
      return `Explain how ${topic.topic} works under the hood. Compare it with one alternative and say when you would choose each.`;
    if (format === "Coding & practical")
      return `Design a production-minded feature that uses ${topic.topic}. Describe the boundary, data flow, tests, errors, and delivery steps.`;
    if (format === "Debugging")
      return `A feature using ${topic.topic} works locally but fails for some users. Build a debugging plan using evidence, reproduction, and a regression test.`;
    if (format === "System design")
      return `Design the ${topic.topic} part of a real ${topic.phase} system. Cover interfaces, state, failure behavior, security, and observability.`;
    return `Give a STAR-style example where you used ${topic.topic}. Explain your decision, collaboration, measurable result, and what you would improve.`;
  }
  if (format === "Explain")
    return `Teach ${topic.topic} to a senior engineer. Explain its mechanics, hidden assumptions, failure modes, alternatives, and production trade-offs.`;
  if (format === "Coding & practical")
    return `Lead an implementation of ${topic.topic} for a high-traffic production system. Explain contracts, rollout, tests, performance, security, and recovery.`;
  if (format === "Debugging")
    return `An intermittent production incident points to ${topic.topic}. Explain how you would triage it, form and disprove hypotheses, mitigate impact, and prevent recurrence.`;
  if (format === "System design")
    return `Design ${topic.topic} for scale and change. State requirements and estimates, draw boundaries and data flow, then defend reliability, cost, and migration choices.`;
  return `Describe a senior-level decision involving ${topic.topic}. Show how you handled disagreement, incomplete information, risk, delivery, and long-term ownership.`;
};

const guideFor = (topic: InterviewTopic, variant: QuestionVariant) => {
  const guide = [
    `Define ${topic.topic} and the problem it solves.`,
    `Explain the important mechanism or sequence inside ${topic.module}.`,
    "Use one concrete example with an input, action, and observable result.",
  ];
  if (variant.format === "Coding & practical")
    guide.push(
      "Describe boundaries, implementation steps, error handling, and tests.",
    );
  else if (variant.format === "Debugging")
    guide.push(
      "Separate symptoms from causes; use evidence, a minimal reproduction, and a regression test.",
    );
  else if (variant.format === "System design")
    guide.push(
      "State requirements, draw data flow and ownership, then cover failure and observability.",
    );
  else if (variant.format === "Experience")
    guide.push(
      "Use situation, responsibility, action, measured result, and reflection.",
    );
  else
    guide.push("Compare one reasonable alternative and say when it is better.");
  guide.push(
    "Name one risk, limitation, security concern, performance cost, or trade-off.",
    "Explain how you would test, measure, monitor, or verify the result.",
  );
  if (variant.difficulty === "Advanced")
    guide.push(
      "Discuss scale, rollout, recovery, ownership, and how the decision changes over time.",
    );
  return guide;
};

const hintFor = (topic: InterviewTopic, variant: QuestionVariant) => {
  if (variant.format === "Debugging")
    return `Start with expected versus actual behavior for ${topic.topic}. What is the smallest failing case, and which observation would disprove your first guess?`;
  if (variant.format === "System design")
    return `Start with requirements and limits. Then trace one request or piece of data through ${topic.topic}, including failure and monitoring.`;
  if (variant.format === "Experience")
    return `Use a specific situation. Separate what the team needed from what you personally decided, did, measured, and learned.`;
  if (variant.format === "Coding & practical")
    return `Describe the contract first, then the happy path, invalid input, failure path, tests, and safe release.`;
  return `Answer in this order: definition, purpose, mechanics, example, alternative, trade-off, and verification.`;
};

const followUpFor = (topic: InterviewTopic, variant: QuestionVariant) => {
  if (variant.difficulty === "Advanced")
    return `What would make you replace or redesign your ${topic.topic} approach after six months in production?`;
  if (variant.difficulty === "Intermediate")
    return `What breaks first as usage grows, and what evidence would tell you to change the ${topic.topic} design?`;
  return `What is one common mistake with ${topic.topic}, and how would you demonstrate the correct behavior?`;
};

const createQuestion = (
  topic: InterviewTopic,
  variant: QuestionVariant,
): InterviewQuestion => ({
  id: `${topic.phaseId}:${topic.moduleId}:${topic.topicIndex}:${variant.key}`,
  phaseId: topic.phaseId,
  phase: topic.phase,
  moduleId: topic.moduleId,
  module: topic.module,
  topic: topic.topic,
  roles: topic.roles,
  difficulty: variant.difficulty,
  format: variant.format,
  prompt: promptFor(topic, variant),
  hint: hintFor(topic, variant),
  answerGuide: guideFor(topic, variant),
  followUp: followUpFor(topic, variant),
});

const getEligible = (filters: InterviewFilters) => {
  const query = filters.query.trim().toLowerCase();
  const topics = interviewTopics.filter((topic) => {
    if (filters.role !== "All roles" && !topic.roles.includes(filters.role))
      return false;
    if (filters.phaseId !== "all" && topic.phaseId !== filters.phaseId)
      return false;
    if (
      query &&
      !`${topic.topic} ${topic.module} ${topic.phase}`.toLowerCase().includes(query)
    )
      return false;
    return true;
  });
  const eligibleVariants = variants.filter(
    (variant) =>
      (filters.difficulty === "All levels" ||
        variant.difficulty === filters.difficulty) &&
      (filters.format === "All formats" || variant.format === filters.format),
  );
  return { topics, eligibleVariants };
};

export const getInterviewQuestionPage = (
  filters: InterviewFilters,
  offset: number,
  limit: number,
) => {
  const { topics, eligibleVariants } = getEligible(filters);
  const total = topics.length * eligibleVariants.length;
  const items: InterviewQuestion[] = [];
  let seen = 0;
  for (const topic of topics) {
    for (const variant of eligibleVariants) {
      if (seen >= offset && items.length < limit)
        items.push(createQuestion(topic, variant));
      seen += 1;
      if (items.length === limit) return { total, items };
    }
  }
  return { total, items };
};

export const pickInterviewQuestions = (
  filters: InterviewFilters,
  count: number,
  seed = Date.now(),
) => {
  const { topics, eligibleVariants } = getEligible(filters);
  const total = topics.length * eligibleVariants.length;
  if (!total) return [];
  const indexes = Array.from({ length: total }, (_, index) => index);
  let state = seed >>> 0;
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }
  return indexes.slice(0, Math.min(count, total)).map((flatIndex) => {
    const topic = topics[Math.floor(flatIndex / eligibleVariants.length)];
    const variant = eligibleVariants[flatIndex % eligibleVariants.length];
    return createQuestion(topic, variant);
  });
};

export const interviewPhaseOptions = curriculumPhases.map((phase) => ({
  id: phase.id,
  title: phase.title,
}));
