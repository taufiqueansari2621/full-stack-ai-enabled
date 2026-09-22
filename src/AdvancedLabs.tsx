import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Database,
  Network,
  Play,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import type { ForgeStore, LabArtifact } from "./useForgeStore";
import "./advanced-labs.css";

type Lab = LabArtifact["lab"];
const algorithms = {
  arrays: [
    "Start: [7, 2, 5, 1]",
    "Compare 7 and 2",
    "Swap → [2, 7, 5, 1]",
    "Continue until sorted",
    "Result: [1, 2, 5, 7]",
  ],
  "binary-search": [
    "Range 0…7; target 23",
    "Midpoint 3 → 14",
    "23 is larger: range 4…7",
    "Midpoint 5 → 23",
    "Found at index 5",
  ],
  bfs: [
    "Queue [A]",
    "Visit A; enqueue B, C",
    "Visit B; enqueue D",
    "Visit C; enqueue E",
    "Order A, B, C, D, E",
  ],
  recursion: [
    "factorial(4)",
    "4 × factorial(3)",
    "3 × factorial(2)",
    "Base factorial(1) = 1",
    "Unwind → 24",
  ],
};
const components = [
  "Client",
  "CDN",
  "Load Balancer",
  "API",
  "Service",
  "Database",
  "Cache",
  "Queue",
  "Object Storage",
  "Search",
  "Vector Database",
  "AI Service",
];
const rows = [
  { id: 1, name: "Ada", score: 92 },
  { id: 2, name: "Lin", score: 78 },
  { id: 3, name: "Grace", score: 88 },
];

export default function AdvancedLabs({
  store,
  notify,
}: {
  store: ForgeStore;
  notify: (text: string) => void;
}) {
  const [lab, setLab] = useState<Lab>("dsa");
  const [algorithm, setAlgorithm] = useState<keyof typeof algorithms>("arrays");
  const [step, setStep] = useState(0);
  const [nodes, setNodes] = useState<string[]>(["Client", "API", "Database"]);
  const [query, setQuery] = useState(
    "SELECT name, score FROM learners WHERE score >= 85;",
  );
  const [sqlResult, setSqlResult] = useState<typeof rows | null>(null);
  const [document, setDocument] = useState(
    "Forge teaches engineering through lessons, deliberate practice, projects, reviews, and evidence.",
  );
  const [question, setQuestion] = useState("How does Forge teach engineering?");
  const [evidence, setEvidence] = useState("");
  const saved = store.state.labArtifacts.find((item) => item.lab === lab);
  const chunks = useMemo(
    () =>
      document
        .split(/[.!?]+/)
        .map((x) => x.trim())
        .filter(Boolean),
    [document],
  );
  const retrieved = chunks.filter((chunk) =>
    question
      .toLowerCase()
      .split(/\W+/)
      .some((word) => word.length > 3 && chunk.toLowerCase().includes(word)),
  );
  const save = () => {
    if (evidence.trim().length < 40) return;
    store.saveLabArtifact({
      lab,
      exerciseId: lab === "dsa" ? algorithm : "foundation",
      evidence: evidence.trim(),
    });
    notify("Lab evidence saved — +40 XP");
  };
  return (
    <div className="page advanced-labs">
      <section className="page-title">
        <div>
          <span className="eyebrow">EXPERIMENT · MEASURE · EXPLAIN</span>
          <h1>
            Advanced engineering <span className="gradient-text">labs</span>
          </h1>
          <p>
            Step through algorithms, design systems, query data, and inspect a
            RAG pipeline.
          </p>
        </div>
      </section>
      <div className="lab-tabs" role="tablist">
        {(["dsa", "system-design", "sql", "rag"] as Lab[]).map((id) => (
          <button
            role="tab"
            aria-selected={lab === id}
            className={lab === id ? "active" : ""}
            onClick={() => {
              setLab(id);
              setEvidence(
                store.state.labArtifacts.find((x) => x.lab === id)?.evidence ??
                  "",
              );
            }}
            key={id}
          >
            {id === "system-design" ? "System Design" : id.toUpperCase()}
          </button>
        ))}
      </div>
      {lab === "dsa" && (
        <section className="lab-grid panel">
          <div>
            <label>
              Algorithm
              <select
                value={algorithm}
                onChange={(e) => {
                  setAlgorithm(e.target.value as keyof typeof algorithms);
                  setStep(0);
                }}
              >
                <option value="arrays">Array sorting</option>
                <option value="binary-search">Binary search</option>
                <option value="bfs">Graph BFS</option>
                <option value="recursion">Recursion</option>
              </select>
            </label>
            <div className="dsa-state">{algorithms[algorithm][step]}</div>
            <div className="lab-controls">
              <button disabled={!step} onClick={() => setStep(step - 1)}>
                <ArrowLeft /> Previous
              </button>
              <button
                onClick={() =>
                  setStep(Math.min(algorithms[algorithm].length - 1, step + 1))
                }
              >
                <Play /> Next
              </button>
              <button onClick={() => setStep(0)}>
                <RotateCcw /> Reset
              </button>
            </div>
          </div>
          <aside>
            <b>Runtime model</b>
            <p>
              Step {step + 1}/{algorithms[algorithm].length}
            </p>
            <p>Current operation: {algorithms[algorithm][step]}</p>
            <p>
              Time:{" "}
              {algorithm === "binary-search"
                ? "O(log n)"
                : algorithm === "bfs"
                  ? "O(V + E)"
                  : "O(n)"}
            </p>
            <p>
              Space: {algorithm === "recursion" ? "O(n) call stack" : "O(n)"}
            </p>
          </aside>
        </section>
      )}
      {lab === "system-design" && (
        <section className="lab-grid panel">
          <div>
            <div className="component-palette">
              {components.map((item) => (
                <button
                  key={item}
                  onClick={() => setNodes((current) => [...current, item])}
                >
                  + {item}
                </button>
              ))}
            </div>
            <div className="design-flow">
              {nodes.map((node, index) => (
                <span key={`${node}-${index}`}>
                  {node}
                  {index < nodes.length - 1 && <ArrowRight />}
                </span>
              ))}
            </div>
            <button onClick={() => setNodes([])}>
              <RotateCcw /> Clear canvas
            </button>
          </div>
          <aside>
            <Network />
            <b>Explain the design</b>
            <p>
              Cover scaling, availability, consistency, security, failure
              handling, cost, and trade-offs in your evidence below.
            </p>
          </aside>
        </section>
      )}
      {lab === "sql" && (
        <section className="lab-grid panel">
          <div>
            <b>Schema: learners(id, name, score)</b>
            <textarea
              className="query-editor"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={() =>
                setSqlResult(
                  /select/i.test(query)
                    ? rows.filter((row) => !/85/.test(query) || row.score >= 85)
                    : [],
                )
              }
            >
              <Database /> Run query
            </button>
            {sqlResult && (
              <table>
                <thead>
                  <tr>
                    <th>name</th>
                    <th>score</th>
                  </tr>
                </thead>
                <tbody>
                  {sqlResult.map((row) => (
                    <tr key={row.id}>
                      <td>{row.name}</td>
                      <td>{row.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <aside>
            <b>Challenge</b>
            <p>
              Return learners scoring at least 85. Then explain how an index on
              score changes reads and write cost.
            </p>
          </aside>
        </section>
      )}
      {lab === "rag" && (
        <section className="lab-grid panel">
          <div>
            <label>
              Knowledge document
              <textarea
                value={document}
                onChange={(e) => setDocument(e.target.value)}
              />
            </label>
            <label>
              Question
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </label>
            <div className="rag-flow">
              {[
                "Question",
                "Embedding",
                "Vector search",
                "Retrieved context",
                "Prompt",
                "Model",
                "Evaluation",
              ].map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
          </div>
          <aside>
            <Sparkles />
            <b>Pipeline telemetry</b>
            <p>
              Chunks: {chunks.length} · retrieved: {retrieved.length}
            </p>
            <p>Context: {retrieved.join(" ") || "No relevant context"}</p>
            <p>
              Estimated tokens: {Math.ceil(retrieved.join(" ").length / 4)} ·
              quality:{" "}
              {retrieved.length ? "grounded candidate" : "insufficient context"}
            </p>
          </aside>
        </section>
      )}
      <section className="lab-evidence panel">
        <div>
          <span className="eyebrow">EVIDENCE, NOT COMPLETION</span>
          <h2>Explain what you observed</h2>
          <p>
            Record the result, one trade-off, one failure case, and how you
            verified it.
          </p>
        </div>
        <textarea
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
          placeholder="Write at least 40 characters…"
        />
        <button
          className="primary-button"
          disabled={evidence.trim().length < 40}
          onClick={save}
        >
          <Save /> {saved ? "Update evidence" : "Save evidence"}
        </button>
      </section>
    </div>
  );
}
