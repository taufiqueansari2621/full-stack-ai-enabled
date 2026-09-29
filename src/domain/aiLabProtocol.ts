export type LabAction = "plan" | "answer" | "evaluate";
export type LabPlan = {
  action: "search" | "stop";
  query: string;
  limit: number;
  reason: string;
};
export type LabClaim = {
  claim: string;
  verdict: "supported" | "unsupported" | "contradicted";
  quote: string;
  reason: string;
  quoteVerified: boolean;
};
export type LabEvaluation = {
  claims: LabClaim[];
  supportedPercent: number;
  warning: string;
};
export type LabModelResult = {
  plan?: LabPlan;
  evaluation?: LabEvaluation;
  answer?: string;
};

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected a structured model response.");
  return value as Record<string, unknown>;
}
function text(value: unknown, max: number, empty = false): string {
  if (
    typeof value !== "string" ||
    (!empty && !value.trim()) ||
    value.length > max
  )
    throw new Error("Model response contains missing or oversized text.");
  return value;
}
export function parseLabPlan(value: unknown): LabPlan {
  const item = record(value);
  if (item.action !== "search" && item.action !== "stop")
    throw new Error("Model selected an unsupported action.");
  const reason = text(item.reason, 600);
  if (item.action === "stop")
    return { action: "stop", reason, query: "", limit: 1 };
  const query = text(item.query, 800);
  if (
    typeof item.limit !== "number" ||
    !Number.isInteger(item.limit) ||
    item.limit < 1 ||
    item.limit > 5
  )
    throw new Error("Model search limit must be 1–5.");
  return { action: "search", query, limit: item.limit, reason };
}
export function parseLabEvaluation(
  value: unknown,
  source: string,
): LabEvaluation {
  const item = record(value);
  if (
    !Array.isArray(item.claims) ||
    item.claims.length < 1 ||
    item.claims.length > 6
  )
    throw new Error("Model evaluation must contain 1–6 claims.");
  const claims: LabClaim[] = item.claims.map((entry) => {
    const claim = record(entry);
    if (
      !["supported", "unsupported", "contradicted"].includes(
        String(claim.verdict),
      )
    )
      throw new Error("Model returned an unknown claim verdict.");
    const quote = text(claim.quote, 800, true);
    return {
      claim: text(claim.claim, 800),
      verdict: claim.verdict as LabClaim["verdict"],
      quote,
      reason: text(claim.reason, 800),
      quoteVerified: !!quote.trim() && source.includes(quote),
    };
  });
  const supported = claims.filter(
    (claim) => claim.verdict === "supported" && claim.quoteVerified,
  ).length;
  return {
    claims,
    supportedPercent: (100 * supported) / claims.length,
    warning:
      "Model-assessed support over sampled claims, not verified factual correctness or complete claim coverage. Quote presence is checked; entailment is a fallible model judgment. Missing or invented quotes receive no support credit.",
  };
}
