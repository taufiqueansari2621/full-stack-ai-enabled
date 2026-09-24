export type AiLabExercise = {
  id: string;
  title: string;
  challenge: string;
  inputLabel: string;
  defaultInput: string;
  steps: string[];
  output: string;
  retrievalQuality: number;
  evaluationScore: number;
  modelCostUsd: number;
};

export const aiLabExercises: AiLabExercise[] = [
  { id: "prompt", title: "Prompt Lab", challenge: "Turn a vague request into a constrained engineering prompt.", inputLabel: "Prompt", defaultInput: "Explain caching to a junior engineer using one analogy and one failure case.", steps: ["Instruction", "Constraints", "Model", "Answer"], output: "A scoped answer with an analogy, failure case, and audience-aware depth.", retrievalQuality: 0, evaluationScore: 88, modelCostUsd: 0.00008 },
  { id: "embedding", title: "Embedding Explorer", challenge: "Observe how related phrases map to nearby semantic representations.", inputLabel: "Text to embed", defaultInput: "Caching reduces repeated database work.", steps: ["Text", "Tokenize", "Embed", "Vector"], output: "Vector preview: [0.82, 0.14, 0.67, 0.31] — meaning is represented as coordinates, not stored prose.", retrievalQuality: 76, evaluationScore: 84, modelCostUsd: 0.00001 },
  { id: "chunking", title: "Chunking Lab", challenge: "Split source material into retrievable units without losing meaning.", inputLabel: "Source document", defaultInput: "Forge teaches with lessons. Practice creates evidence. Reviews strengthen recall. Projects prove transfer.", steps: ["Document", "Boundaries", "Chunks", "Metadata"], output: "4 sentence-aware chunks with source and position metadata.", retrievalQuality: 81, evaluationScore: 86, modelCostUsd: 0 },
  { id: "semantic-search", title: "Semantic Search", challenge: "Rank passages by meaning rather than exact keyword overlap.", inputLabel: "Search query", defaultInput: "How can learners remember concepts for longer?", steps: ["Query", "Embedding", "Similarity", "Ranked results"], output: "Top result: “Reviews strengthen recall.” Similarity: 0.87.", retrievalQuality: 87, evaluationScore: 89, modelCostUsd: 0.00002 },
  { id: "vector-retrieval", title: "Vector Retrieval", challenge: "Compare top-k retrieval and the context/noise trade-off.", inputLabel: "Retrieval query", defaultInput: "What proves a learner can apply knowledge?", steps: ["Query vector", "Vector index", "Top-k", "Context"], output: "Retrieved k=2: project transfer and practice evidence; one lower-ranked chunk excluded.", retrievalQuality: 91, evaluationScore: 90, modelCostUsd: 0.00002 },
  { id: "rag", title: "RAG Pipeline", challenge: "Trace a grounded answer from question through evaluation.", inputLabel: "Question", defaultInput: "How does Forge teach engineering?", steps: ["Question", "Embedding", "Vector Search", "Retrieved Context", "Prompt", "Model", "Answer", "Evaluation"], output: "Grounded answer: Forge combines lessons, deliberate practice, reviews, and projects, supported by retrieved course context.", retrievalQuality: 92, evaluationScore: 94, modelCostUsd: 0.00011 },
  { id: "tool-calling", title: "Tool Calling", challenge: "Choose a typed tool and validate its arguments before execution.", inputLabel: "User request", defaultInput: "Show my next three due reviews.", steps: ["Request", "Tool choice", "Schema validation", "Tool result", "Answer"], output: "Selected get_due_reviews({ limit: 3 }); arguments valid; result can be summarized without inventing records.", retrievalQuality: 0, evaluationScore: 96, modelCostUsd: 0.00006 },
  { id: "agent-workflow", title: "Agent Workflow", challenge: "Inspect a bounded plan with explicit tool and stop decisions.", inputLabel: "Agent goal", defaultInput: "Diagnose a failing test and propose the smallest safe fix.", steps: ["Goal", "Plan", "Inspect", "Tool", "Observe", "Stop"], output: "Workflow stops after evidence supports one scoped patch; it does not mutate unrelated files.", retrievalQuality: 0, evaluationScore: 91, modelCostUsd: 0.00014 },
  { id: "evaluation", title: "Evaluation Lab", challenge: "Score an AI result for groundedness, relevance, and completeness.", inputLabel: "Answer to evaluate", defaultInput: "Forge uses lessons, evidence-based practice, projects, and spaced reviews.", steps: ["Dataset case", "Candidate", "Rubric", "Score", "Failure analysis"], output: "Groundedness 1.0 · relevance 0.9 · completeness 0.8. Improve by citing the retrieved course context.", retrievalQuality: 90, evaluationScore: 90, modelCostUsd: 0.00003 },
];

export type AiLabResult = {
  output: string;
  latencyMs: number;
  tokenUsage: number;
  retrievalQuality: number;
  contextSize: number;
  modelCostUsd: number;
  evaluationScore: number;
};

export function runAiLab(exercise: AiLabExercise, input: string): AiLabResult | { error: string } {
  const normalized = input.trim();
  if (normalized.length < 12) return { error: "Add at least 12 characters so the experiment has meaningful input." };
  const tokenUsage = Math.ceil(normalized.length / 4) + Math.ceil(exercise.output.length / 4);
  return {
    output: exercise.output,
    latencyMs: 35 + exercise.steps.length * 11 + normalized.length % 17,
    tokenUsage,
    retrievalQuality: exercise.retrievalQuality,
    contextSize: normalized.length,
    modelCostUsd: exercise.modelCostUsd,
    evaluationScore: exercise.evaluationScore,
  };
}
