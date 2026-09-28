export const labSource =
  "Forge teaches engineering with lessons and worked examples. Deliberate practice creates evidence of understanding. Spaced reviews strengthen recall and help learners remember concepts for longer. Projects prove learners can apply knowledge to real engineering problems.";

export function chunkSource(source: string, size = 300): string[] {
  if (!source.trim() || source.length > 4800)
    throw new Error("Source must contain 1–4,800 characters.");
  if (!Number.isInteger(size) || size < 300 || size > 800)
    throw new Error("Chunk size must be 300–800 characters.");
  const chunks: string[] = [];
  let remaining = source.trim();
  while (remaining.length) {
    let end = Math.min(size, remaining.length);
    if (end < remaining.length) {
      const boundary = remaining.lastIndexOf(" ", end);
      if (boundary > size / 2) end = boundary;
    }
    chunks.push(remaining.slice(0, end));
    remaining = remaining.slice(end).trimStart();
  }
  if (chunks.length > 16)
    throw new Error(
      "Source produces more than 16 chunks. Increase chunk size or shorten it.",
    );
  return chunks;
}

export function cosine(a: number[], b: number[]): number {
  if (
    !a.length ||
    a.length !== b.length ||
    [...a, ...b].some((n) => !Number.isFinite(n))
  )
    throw new Error("Invalid embedding dimensions or values.");
  const magnitude = Math.sqrt(
    a.reduce((sum, n) => sum + n * n, 0) * b.reduce((sum, n) => sum + n * n, 0),
  );
  return magnitude
    ? Math.max(
        -1,
        Math.min(
          1,
          a.reduce((sum, n, index) => sum + n * b[index], 0) / magnitude,
        ),
      )
    : 0;
}

const words = (text: string) =>
  new Set(text.toLowerCase().match(/[a-z0-9]+/g) ?? []);
export function lexicalEvaluation(candidate: string, reference: string) {
  const actual = words(candidate),
    expected = words(reference);
  const overlap = [...actual].filter((word) => expected.has(word)).length;
  const precision = actual.size ? overlap / actual.size : 0;
  const recall = expected.size ? overlap / expected.size : 0;
  return {
    precision,
    recall,
    f1:
      precision + recall ? (2 * precision * recall) / (precision + recall) : 0,
  };
}

export function executeLabTool(input: string, source: string) {
  const parsed: unknown = JSON.parse(input);
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("tool" in parsed) ||
    parsed.tool !== "search_source" ||
    !("arguments" in parsed) ||
    !parsed.arguments ||
    typeof parsed.arguments !== "object"
  )
    throw new Error(
      "Use search_source with arguments { query, limit }. No other tools are allowed.",
    );
  const args = parsed.arguments;
  if (
    !("query" in args) ||
    typeof args.query !== "string" ||
    !args.query.trim() ||
    args.query.length > 800 ||
    !("limit" in args) ||
    !Number.isInteger(args.limit) ||
    Number(args.limit) < 1 ||
    Number(args.limit) > 5
  )
    throw new Error(
      "Tool query must contain 1–800 characters and limit must be 1–5.",
    );
  const terms = words(args.query);
  return chunkSource(source)
    .map((text, index) => ({
      id: index + 1,
      text,
      matches: [...words(text)].filter((term) => terms.has(term)).length,
    }))
    .filter((item) => item.matches > 0)
    .sort((a, b) => b.matches - a.matches)
    .slice(0, Number(args.limit));
}
