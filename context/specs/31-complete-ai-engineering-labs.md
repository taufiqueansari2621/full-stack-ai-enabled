# Complete AI Engineering Labs

## Outcome

Forge teaches AI engineering through bounded, inspectable experiments rather
than adding another general chat surface. The workspace covers Prompt Lab,
Embedding Explorer, Chunking Lab, Semantic Search, Vector Retrieval, RAG
Pipeline, Tool Calling, Agent Workflow, and Evaluation Lab.

## Learning contract

Each mode provides an editable input, an engineering challenge, visible
pipeline stages, deterministic experiment output, and evidence capture. The
result exposes latency, token usage, retrieval quality, context size, model
cost, and evaluation score. Zero retrieval quality is explicit for modes where
retrieval is not part of the pipeline.

The original authored-output engine is superseded by the input-dependent
implementation in `35-real-ai-lab-experiments.md`. Cloud modes use learned
embeddings and real generation; local modes perform actual chunking, validated
explicit tool calls, and lexical evaluation. Similarity is not retrieval quality,
lexical F1 is not factual correctness, and provider charges are not fabricated.

## Verification

- `tests/ai-lab.test.ts` enforces all nine modes, complete metric output, and
  meaningful-input validation.
- The local browser regression verifies exact mode count, metric labels,
  experiment execution, saved evidence, and responsive behavior.
- The Cloudflare production gate repeats the critical experiment assertions.
- Verified production version:
  `4faf7405-7a1a-4795-b6b3-dfd912fb1b50` (real embeddings and generation).
