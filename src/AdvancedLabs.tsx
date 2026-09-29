import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Database,
  Network,
  Pause,
  Play,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import type { ForgeStore, LabArtifact } from "./useForgeStore";
import { dsaAlgorithms, type DsaAlgorithmId } from "./domain/dsaAlgorithms";
import {
  systemDesignComponents,
  systemDesignPrompts,
  systemDesignScenarios,
} from "./domain/systemDesignScenarios";
import { sqlLabLessons, sqlSchema } from "./domain/sqlLab";
import { runSql } from "./services/sqlRunner";
import type { SqlExecution } from "./services/sqlEngine";
import { aiLabExercises } from "./domain/aiLab";
import { labSource } from "./domain/aiExperiments";
import {
  needsModel,
  runAiExperiment,
  type AiLabResult,
} from "./services/aiExperiments";
import "./advanced-labs.css";

type Lab = LabArtifact["lab"];
export default function AdvancedLabs({
  store,
  notify,
}: {
  store: ForgeStore;
  notify: (text: string) => void;
}) {
  const [lab, setLab] = useState<Lab>("dsa");
  const [algorithm, setAlgorithm] = useState<DsaAlgorithmId>("arrays");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [scenarioId, setScenarioId] = useState(systemDesignScenarios[0].id);
  const [nodes, setNodes] = useState<string[]>(
    systemDesignScenarios[0].starterNodes,
  );
  const [sqlLessonId, setSqlLessonId] = useState(sqlLabLessons[0].id);
  const [query, setQuery] = useState(sqlLabLessons[0].query);
  const [sqlResult, setSqlResult] = useState<
    SqlExecution | { error: string } | null
  >(null);
  const [sqlRunning, setSqlRunning] = useState(false);
  const sqlRequest = useRef<AbortController | null>(null);
  useEffect(() => () => sqlRequest.current?.abort(), [lab]);
  const executeQuery = async () => {
    sqlRequest.current?.abort();
    const request = new AbortController();
    sqlRequest.current = request;
    setSqlRunning(true);
    setSqlResult(null);
    try {
      const result = await runSql(query, request.signal);
      if (sqlRequest.current === request) setSqlResult(result);
    } catch (error) {
      if (sqlRequest.current === request)
        setSqlResult({
          error: error instanceof Error ? error.message : "SQL failed.",
        });
    } finally {
      if (sqlRequest.current === request) setSqlRunning(false);
    }
  };
  const [aiExerciseId, setAiExerciseId] = useState(aiLabExercises[0].id);
  const [aiInput, setAiInput] = useState(aiLabExercises[0].defaultInput);
  const [aiSource, setAiSource] = useState(labSource);
  const [aiConsent, setAiConsent] = useState(false);
  const [aiLocalOnly, setAiLocalOnly] = useState(false);
  const [aiRunning, setAiRunning] = useState(false);
  const [topK, setTopK] = useState(2);
  const [chunkSize, setChunkSize] = useState(300);
  const aiRequest = useRef<AbortController | null>(null);
  useEffect(() => () => aiRequest.current?.abort(), [lab]);
  const [aiResult, setAiResult] = useState<
    AiLabResult | { error: string } | null
  >(null);
  const [evidence, setEvidence] = useState("");
  const saved = store.state.labArtifacts.find((item) => item.lab === lab);
  const activeAlgorithm = dsaAlgorithms[algorithm];
  const activeStep = activeAlgorithm.steps[step];
  const activeScenario =
    systemDesignScenarios.find((item) => item.id === scenarioId) ??
    systemDesignScenarios[0];
  const activeSqlLesson =
    sqlLabLessons.find((item) => item.id === sqlLessonId) ?? sqlLabLessons[0];
  const activeAiExercise =
    aiLabExercises.find((item) => item.id === aiExerciseId) ??
    aiLabExercises[0];
  const executeAi = async () => {
    const request = new AbortController();
    aiRequest.current?.abort();
    aiRequest.current = request;
    setAiRunning(true);
    setAiResult(null);
    const timer = setTimeout(() => request.abort(), 45000);
    try {
      if (needsModel(activeAiExercise.id, aiLocalOnly) && !aiConsent)
        throw new Error(
          "Confirm sharing the entered text before calling Workers AI. Cloud login is required.",
        );
      const result = await runAiExperiment(
        activeAiExercise,
        aiInput,
        aiSource,
        topK,
        chunkSize,
        request.signal,
        aiLocalOnly,
      );
      if (aiRequest.current === request) setAiResult(result);
    } catch (error) {
      if (aiRequest.current === request)
        setAiResult({
          error: request.signal.aborted
            ? "Experiment cancelled or exceeded 45 seconds. Provider usage may still be charged."
            : error instanceof Error
              ? error.message
              : "Experiment failed.",
        });
    } finally {
      clearTimeout(timer);
      if (aiRequest.current === request) setAiRunning(false);
    }
  };
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setStep((current) => {
        if (current >= activeAlgorithm.steps.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 900);
    return () => window.clearInterval(timer);
  }, [activeAlgorithm.steps.length, playing]);
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
                  setAlgorithm(e.target.value as DsaAlgorithmId);
                  setStep(0);
                  setPlaying(false);
                }}
              >
                {Object.entries(dsaAlgorithms).map(([id, item]) => (
                  <option value={id} key={id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="dsa-state" aria-live="polite">
              <small>DATA STRUCTURE STATE</small>
              <pre>{activeStep.state}</pre>
            </div>
            <div className="lab-controls">
              <button
                disabled={!step}
                onClick={() => {
                  setPlaying(false);
                  setStep((current) => current - 1);
                }}
              >
                <ArrowLeft /> Previous
              </button>
              <button
                disabled={step === activeAlgorithm.steps.length - 1}
                onClick={() => {
                  setPlaying(false);
                  setStep((current) =>
                    Math.min(activeAlgorithm.steps.length - 1, current + 1),
                  );
                }}
              >
                <ArrowRight /> Next
              </button>
              <button
                aria-pressed={playing}
                onClick={() => {
                  if (step === activeAlgorithm.steps.length - 1) setStep(0);
                  setPlaying((current) => !current);
                }}
              >
                {playing ? <Pause /> : <Play />} {playing ? "Pause" : "Play"}
              </button>
              <button
                onClick={() => {
                  setPlaying(false);
                  setStep(0);
                }}
              >
                <RotateCcw /> Reset
              </button>
            </div>
          </div>
          <aside>
            <b>Runtime model</b>
            <p>
              Step {step + 1}/{activeAlgorithm.steps.length}
            </p>
            <p>
              <b>Current operation</b>
              <br />
              {activeStep.operation}
            </p>
            <p>
              <b>Variables</b>
              <br />
              {activeStep.variables}
            </p>
            <p>
              <b>Call stack</b>
              <br />
              {activeStep.callStack}
            </p>
            <p>Time: {activeAlgorithm.time}</p>
            <p>Space: {activeAlgorithm.space}</p>
          </aside>
        </section>
      )}
      {lab === "system-design" && (
        <section className="lab-grid panel">
          <div>
            <label>
              System to design
              <select
                value={scenarioId}
                onChange={(event) => {
                  const next =
                    systemDesignScenarios.find(
                      (item) => item.id === event.target.value,
                    ) ?? systemDesignScenarios[0];
                  setScenarioId(next.id);
                  setNodes(next.starterNodes);
                }}
              >
                {systemDesignScenarios.map((scenario) => (
                  <option value={scenario.id} key={scenario.id}>
                    {scenario.title}
                  </option>
                ))}
              </select>
            </label>
            <p className="system-design-brief">{activeScenario.brief}</p>
            <div className="component-palette">
              {systemDesignComponents.map((item) => (
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
                  <button
                    aria-label={`Remove ${node} at position ${index + 1}`}
                    onClick={() =>
                      setNodes((current) =>
                        current.filter((_, nodeIndex) => nodeIndex !== index),
                      )
                    }
                  >
                    {node}
                  </button>
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
              Cover {systemDesignPrompts.join(", ")} in your evidence below.
            </p>
          </aside>
        </section>
      )}
      {lab === "sql" && (
        <section className="lab-grid panel">
          <div>
            <label>
              SQL topic
              <select
                value={sqlLessonId}
                disabled={sqlRunning}
                onChange={(event) => {
                  const next =
                    sqlLabLessons.find(
                      (item) => item.id === event.target.value,
                    ) ?? sqlLabLessons[0];
                  setSqlLessonId(next.id);
                  setQuery(next.query);
                  setSqlResult(null);
                }}
              >
                {sqlLabLessons.map((lesson) => (
                  <option value={lesson.id} key={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="sql-schema">
              <b>Database schema</b>
              {sqlSchema.map((table) => (
                <code key={table}>{table}</code>
              ))}
            </div>
            <textarea
              aria-label={`${activeSqlLesson.title} query editor`}
              className="query-editor"
              value={query}
              disabled={sqlRunning}
              onChange={(e) => {
                setQuery(e.target.value);
                setSqlResult(null);
              }}
            />
            <button disabled={sqlRunning} onClick={() => void executeQuery()}>
              <Database /> {sqlRunning ? "Running SQL…" : "Run query"}
            </button>
            {sqlRunning && (
              <button onClick={() => sqlRequest.current?.abort()}>
                Cancel SQL run
              </button>
            )}
            {sqlResult && "error" in sqlResult && (
              <p className="sql-error" role="alert">
                {sqlResult.error}
              </p>
            )}
            {sqlResult && !("error" in sqlResult) && (
              <>
                <p role="status">
                  SQLite executed {sqlResult.statements} statement(s) in{" "}
                  {sqlResult.durationMs.toFixed(2)} ms. Fresh teaching database
                  for each run.
                </p>
                {sqlResult.tables.length === 0 && (
                  <p>
                    Statements completed. No rows returned; add SELECT to
                    inspect changes.
                  </p>
                )}
                {sqlResult.tables.map((table, tableIndex) => (
                  <div className="sql-result-table" key={tableIndex}>
                    {table.truncated && (
                      <p role="status">
                        Output truncated: at most 200 rows and 2,000 characters
                        per cell.
                      </p>
                    )}
                    {table.rows.length === 0 && <p>No matching rows.</p>}
                    <table>
                      <caption>Result {tableIndex + 1}</caption>
                      <thead>
                        <tr>
                          {table.columns.map((column, index) => (
                            <th key={`${column}-${index}`}>{column}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows.map((row, rowIndex) => (
                          <tr key={`${activeSqlLesson.id}-${rowIndex}`}>
                            {row.map((value, columnIndex) => (
                              <td key={`${value}-${columnIndex}`}>{value}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
                <div className="sql-explanation">
                  <b>Explanation</b>
                  <p>{activeSqlLesson.explanation}</p>
                  <b>Query plan</b>
                  <code>{sqlResult.plan}</code>
                </div>
              </>
            )}
          </div>
          <aside>
            <b>{activeSqlLesson.title} challenge</b>
            <p>{activeSqlLesson.challenge}</p>
            <p>
              Real SQLite runs locally in a disposable worker, never on account
              data. Each run resets the three sample tables. Put related
              statements in one script to test indexes, COMMIT, or ROLLBACK.
              Runs are limited to 5 seconds, 20 statements, and 200 displayed
              rows per result.
            </p>
          </aside>
        </section>
      )}
      {lab === "rag" && (
        <section className="lab-grid panel">
          <div>
            <label>
              AI engineering lab
              <select
                value={aiExerciseId}
                disabled={aiRunning}
                onChange={(event) => {
                  const next =
                    aiLabExercises.find(
                      (item) => item.id === event.target.value,
                    ) ?? aiLabExercises[0];
                  setAiExerciseId(next.id);
                  setAiLocalOnly(false);
                  setAiInput(next.defaultInput);
                  setAiResult(null);
                }}
              >
                {aiLabExercises.map((exercise) => (
                  <option value={exercise.id} key={exercise.id}>
                    {exercise.title}
                  </option>
                ))}
              </select>
            </label>
            <p>
              Chunking runs locally. Other modes call Workers AI with your
              entered text and require a cloud account. Tool Calling uses one
              model plan; Agent Workflow uses up to two requests and one
              read-only search. RAG uses three requests, including claim review,
              from the shared hourly AI quota. Cancel stops further workflow
              steps; already-started provider processing may continue.
            </p>
            <label>
              {aiLocalOnly && aiExerciseId === "tool-calling"
                ? "Explicit tool-call JSON"
                : activeAiExercise.inputLabel}
              <textarea
                value={aiInput}
                maxLength={800}
                disabled={aiRunning}
                onChange={(e) => {
                  setAiInput(e.target.value);
                  setAiResult(null);
                }}
              />
            </label>
            <label>
              Source / evaluation reference
              <textarea
                aria-label="AI lab source"
                value={aiSource}
                maxLength={4800}
                disabled={aiRunning}
                onChange={(event) => {
                  setAiSource(event.target.value);
                  setAiResult(null);
                }}
              />
            </label>
            <label>
              Top-k results (1–5)
              <input
                type="number"
                min={1}
                max={5}
                value={topK}
                disabled={aiRunning}
                onChange={(event) => {
                  setTopK(Number(event.target.value));
                  setAiResult(null);
                }}
              />
            </label>
            <label>
              Chunk characters (300–800)
              <input
                type="number"
                min={300}
                max={800}
                value={chunkSize}
                disabled={aiRunning}
                onChange={(event) => {
                  setChunkSize(Number(event.target.value));
                  setAiResult(null);
                }}
              />
            </label>
            {["tool-calling", "evaluation"].includes(aiExerciseId) && (
              <label>
                <input
                  type="checkbox"
                  checked={aiLocalOnly}
                  disabled={aiRunning}
                  onChange={(event) => {
                    setAiLocalOnly(event.target.checked);
                    setAiResult(null);
                    if (aiExerciseId === "tool-calling")
                      setAiInput(
                        event.target.checked
                          ? '{"tool":"search_source","arguments":{"query":"reviews","limit":3}}'
                          : activeAiExercise.defaultInput,
                      );
                  }}
                />
                Use offline baseline only (explicit JSON tool / lexical F1)
              </label>
            )}
            {needsModel(aiExerciseId, aiLocalOnly) && (
              <label>
                <input
                  type="checkbox"
                  checked={aiConsent}
                  disabled={aiRunning}
                  onChange={(event) => setAiConsent(event.target.checked)}
                />
                Share my entered query and source with Workers AI. Model usage
                may incur charges; no private account records are retrieved.
              </label>
            )}
            <button disabled={aiRunning} onClick={() => void executeAi()}>
              <Sparkles />{" "}
              {aiRunning ? "Running experiment…" : "Run experiment"}
            </button>
            {aiRunning && (
              <button onClick={() => aiRequest.current?.abort()}>
                Cancel experiment
              </button>
            )}
            <div className="rag-flow">
              {activeAiExercise.steps.map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
            {aiResult && "error" in aiResult && (
              <p className="sql-error" role="alert">
                {aiResult.error}
              </p>
            )}
            {aiResult && !("error" in aiResult) && (
              <div className="ai-output" aria-live="polite">
                <b>Experiment output</b>
                <p>{aiResult.method}</p>
                <p>{aiResult.output}</p>
              </div>
            )}
          </div>
          <aside>
            <Sparkles />
            <b>{activeAiExercise.title}</b>
            <p>{activeAiExercise.challenge}</p>
            <b>Pipeline telemetry</b>
            {aiResult && !("error" in aiResult) ? (
              <>
                <p>
                  Measured latency: {aiResult.latencyMs.toFixed(2)} ms ·
                  estimated tokens in entered text and shown output (not billed
                  usage): {aiResult.tokenUsage}
                </p>
                <p>
                  Retrieval quality is not measured. Cosine similarity:{" "}
                  {aiResult.retrievalQuality?.toFixed(4) ?? "not applicable"} ·
                  input size: {aiResult.contextSize} characters
                </p>
                <p>
                  Model cost:{" "}
                  {aiResult.modelCostUsd === null
                    ? "not reported by provider"
                    : "$0 (local)"}{" "}
                  · evaluation score (model-assessed support over sampled
                  claims, not correctness):{" "}
                  {aiResult.evaluationScore === null
                    ? "not applicable"
                    : `${aiResult.evaluationScore.toFixed(1)}%`}
                </p>
              </>
            ) : (
              <p>
                Inspect measured latency, estimated token usage, retrieval
                quality limitations, context size, model cost availability, and
                claim review limitations. No fabricated quality or billing
                figures.
              </p>
            )}
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
