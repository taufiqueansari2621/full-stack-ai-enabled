export type AiLabExercise = {
  id: string;
  title: string;
  challenge: string;
  inputLabel: string;
  defaultInput: string;
  steps: string[];
};

export const aiLabExercises: AiLabExercise[] = [
  {
    id: "prompt",
    title: "Prompt Lab",
    challenge: "Turn a vague request into a constrained engineering prompt.",
    inputLabel: "Prompt",
    defaultInput:
      "Explain caching to a junior engineer using one analogy and one failure case.",
    steps: ["Instruction", "Constraints", "Model", "Answer"],
  },
  {
    id: "embedding",
    title: "Embedding Explorer",
    challenge:
      "Observe how related phrases map to nearby semantic representations.",
    inputLabel: "Text to embed",
    defaultInput: "Caching reduces repeated database work.",
    steps: ["Text", "Tokenize", "Embed", "Vector"],
  },
  {
    id: "chunking",
    title: "Chunking Lab",
    challenge:
      "Split source material into retrievable units without losing meaning.",
    inputLabel: "Source document",
    defaultInput:
      "Forge teaches with lessons. Practice creates evidence. Reviews strengthen recall. Projects prove transfer.",
    steps: ["Document", "Boundaries", "Chunks", "Metadata"],
  },
  {
    id: "semantic-search",
    title: "Semantic Search",
    challenge: "Rank passages by meaning rather than exact keyword overlap.",
    inputLabel: "Search query",
    defaultInput: "How can learners remember concepts for longer?",
    steps: ["Query", "Embedding", "Similarity", "Ranked results"],
  },
  {
    id: "vector-retrieval",
    title: "Vector Retrieval",
    challenge: "Compare top-k retrieval and the context/noise trade-off.",
    inputLabel: "Retrieval query",
    defaultInput: "What proves a learner can apply knowledge?",
    steps: ["Query vector", "Vector index", "Top-k", "Context"],
  },
  {
    id: "rag",
    title: "RAG Pipeline",
    challenge: "Trace a grounded answer from question through evaluation.",
    inputLabel: "Question",
    defaultInput: "How does Forge teach engineering?",
    steps: [
      "Question",
      "Embedding",
      "Vector Search",
      "Retrieved Context",
      "Prompt",
      "Model",
      "Answer",
      "Evaluation",
    ],
  },
  {
    id: "tool-calling",
    title: "Tool Calling",
    challenge:
      "Choose a typed tool and validate its arguments before execution.",
    inputLabel: "Explicit tool-call JSON",
    defaultInput:
      '{"tool":"search_source","arguments":{"query":"reviews","limit":3}}',
    steps: [
      "Request",
      "Tool choice",
      "Schema validation",
      "Tool result",
      "Answer",
    ],
  },
  {
    id: "agent-workflow",
    title: "Agent Workflow",
    challenge: "Inspect a bounded plan with explicit tool and stop decisions.",
    inputLabel: "Agent goal",
    defaultInput:
      "Find how Forge strengthens recall and explain using the supplied source.",
    steps: ["Goal", "Plan", "Inspect", "Tool", "Observe", "Stop"],
  },
  {
    id: "evaluation",
    title: "Evaluation Lab",
    challenge:
      "Compare an answer with a reference using lexical F1; explain why word overlap cannot prove factual correctness.",
    inputLabel: "Answer to evaluate",
    defaultInput:
      "Forge uses lessons, evidence-based practice, projects, and spaced reviews.",
    steps: ["Dataset case", "Candidate", "Rubric", "Score", "Failure analysis"],
  },
];
