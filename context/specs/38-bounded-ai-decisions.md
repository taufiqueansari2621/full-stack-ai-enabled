# Bounded AI decisions and groundedness review

Extend the real AI lab with model-selected read-only source search or an explicit
stop decision. Execute only the allowlisted, validated search_source operation
over text the learner entered. Never let a model supply code, URLs, SQL, account
IDs or arbitrary tool names to an execution boundary. Maximum workflow: plan,
one search, answer if evidence exists, stop. Expose actual decisions and results.

Add model-assisted claim review against the entered source, separate from
lexical F1. Return bounded claim/verdict/quote/reason records; check quotes are
actually in the source before counting supported claims. Label the score as
model-assessed support over sampled claims, not factual truth or completeness.
RAG may request the same review after generation, exposing its evaluation step.

New authenticated, same-origin /api/ai/lab supports plan, answer, evaluate.
Use the existing fixed Workers AI model and shared 20/hour quota. Bound inputs,
provider output, and latency; validate structured responses; record metadata
only. Explicit client consent applies to all model modes. Cancellation stops
the client workflow, but already-started provider processing may continue.

Verify validation, untrusted model output, quote checks, stop/empty branches,
abort/no further calls, auth/origin/quota boundaries, and actual live inference.
No new infrastructure, account record retrieval, or paid service is enabled.
