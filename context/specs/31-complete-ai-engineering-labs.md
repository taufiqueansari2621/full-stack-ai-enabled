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

The teaching engine is deliberately bounded and does not misrepresent a local
numeric illustration as a call to a production embedding or vector service.
Workers AI or Vectorize can later implement the same interface when live model
variation is itself the lesson objective.

## Verification

- `tests/ai-lab.test.ts` enforces all nine modes, complete metric output, and
  meaningful-input validation.
- The local browser regression verifies exact mode count, metric labels,
  experiment execution, saved evidence, and responsive behavior.
- The Cloudflare production gate repeats the critical experiment assertions.
- Verified production version:
  `cac994e3-c382-446a-9f0d-8a51df77e90d`.
