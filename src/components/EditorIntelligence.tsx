import { useState } from "react";
import type { EditorAnalysis } from "../services/editorIntelligence";

export function EditorIntelligence({
  source,
  path,
  cursor,
  onApply,
}: {
  source: string;
  path: string;
  cursor: () => number;
  onApply: (source: string, cursor: number) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<{
    source: string;
    path: string;
    data: EditorAnalysis;
  } | null>(null);
  const current =
    analysis?.source === source && analysis.path === path
      ? analysis.data
      : null;
  return (
    <section
      className="editor-intelligence"
      aria-label="Semantic code assistance"
    >
      <button
        disabled={loading || !/\.(js|ts)$/.test(path)}
        onClick={async () => {
          const position = cursor();
          setLoading(true);
          setError("");
          setAnalysis(null);
          try {
            const { analyzeInWorker } =
              await import("../services/compileInWorker");
            const data = await analyzeInWorker(source, path, position);
            setAnalysis({ source, path, data });
          } catch (reason) {
            setError(
              reason instanceof Error
                ? reason.message
                : "Analysis failed. Try again.",
            );
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? "Analyzing code…" : "Suggest at cursor / check code"}
      </button>
      {error && <p role="status">{error}</p>}
      {current && (
        <div>
          <p role="status">
            {current.suggestions.length} semantic suggestions ·{" "}
            {current.diagnostics.length} diagnostics. Current file and ES2022
            types only; package and browser APIs are not loaded.
          </p>
          {!!current.suggestions.length && (
            <label>
              Semantic suggestions
              <select
                aria-label="Semantic suggestions"
                value=""
                onChange={(event) => {
                  const item = current.suggestions[Number(event.target.value)];
                  if (!item || event.target.value === "") return;
                  onApply(
                    source.slice(0, item.start) +
                      item.insertText +
                      source.slice(item.start + item.length),
                    item.start + item.insertText.length,
                  );
                  setAnalysis(null);
                }}
              >
                <option value="">Choose a completion…</option>
                {current.suggestions.map((item, index) => (
                  <option key={item.name} value={index}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {!!current.diagnostics.length && (
            <ul>
              {current.diagnostics.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
