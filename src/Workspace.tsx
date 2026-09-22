import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  CircleX,
  Download,
  FileCode2,
  Folder,
  Lightbulb,
  Play,
  RotateCcw,
  Save,
  Sparkles,
  TerminalSquare,
} from "lucide-react";
import { ForgeApiError, forgeApi } from "./services/forgeApi";
import "./workspace.css";

type Files = Record<string, string>;
type RunResult = {
  logs: string[];
  error: string | null;
  passed: number;
  failed: number;
  executionMs: number;
};

const starterFiles: Files = {
  "src/index.js": `// Return the sum of every number in the array.
function sum(numbers) {
  // Write your solution here.
  return 0;
}

console.log("sum([2, 3, 4]) =", sum([2, 3, 4]));`,
  "src/helpers.js": `export function isNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}`,
  "web/index.html": `<main>
  <h1>Forge Preview</h1>
  <p>Edit HTML, CSS, and JavaScript, then open Preview.</p>
  <button id="action">Run interaction</button>
</main>`,
  "web/styles.css": `body { font-family: system-ui; padding: 2rem; background: #07101c; color: #e8f0f8; }
button { padding: .7rem 1rem; border: 0; border-radius: .5rem; background: #5eead4; color: #07101c; }`,
  "web/app.js": `document.querySelector("#action")?.addEventListener("click", () => {
  document.querySelector("p").textContent = "The preview is isolated and working.";
});`,
};

const localKey = (learnerId: string) => `forge-workspace-v1:${learnerId}`;

function loadLocal(learnerId: string) {
  try {
    const value = JSON.parse(
      localStorage.getItem(localKey(learnerId)) ?? "null",
    ) as {
      files?: unknown;
      activePath?: unknown;
    } | null;
    if (
      value?.files &&
      typeof value.files === "object" &&
      typeof value.activePath === "string"
    )
      return { files: value.files as Files, activePath: value.activePath };
  } catch {
    // A damaged cache falls back to the safe starter workspace.
  }
  return { files: starterFiles, activePath: "src/index.js" };
}

const runnerSource = `
for (const capability of ["fetch", "WebSocket", "EventSource", "importScripts", "XMLHttpRequest"]) {
  try { Object.defineProperty(self, capability, { value: undefined, writable: false, configurable: false }); }
  catch { /* The isolated runner still has a hard termination deadline. */ }
}
self.onmessage = (event) => {
  const started = performance.now();
  const logs = [];
  const format = (value) => {
    if (typeof value === "string") return value;
    try { return JSON.stringify(value); } catch { return String(value); }
  };
  console.log = (...values) => {
    if (logs.length < 80) logs.push(values.map(format).join(" ").slice(0, 2000));
  };
  try {
    const getSum = new Function(event.data.code + "\\n; return typeof sum === 'function' ? sum : null;");
    const sum = getSum();
    const tests = [
      ["adds positive numbers", () => sum && sum([2, 3, 4]) === 9],
      ["supports negative numbers", () => sum && sum([-2, 5, -1]) === 2],
      ["handles an empty array", () => sum && sum([]) === 0],
    ];
    const results = tests.map(([name, test]) => {
      try { return { name, passed: Boolean(test()) }; }
      catch (error) { return { name, passed: false, detail: String(error) }; }
    });
    self.postMessage({ logs, results, error: null, executionMs: performance.now() - started });
  } catch (error) {
    self.postMessage({ logs, results: [], error: String(error), executionMs: performance.now() - started });
  }
};`;

async function runJavaScript(code: string): Promise<RunResult> {
  const url = URL.createObjectURL(
    new Blob([runnerSource], { type: "text/javascript" }),
  );
  const worker = new Worker(url);
  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({
        logs: [],
        error: "Execution stopped after 1.5 seconds.",
        passed: 0,
        failed: 3,
        executionMs: 1500,
      });
    }, 1500);
    worker.onmessage = (
      event: MessageEvent<{
        logs: string[];
        results: { passed: boolean }[];
        error: string | null;
        executionMs: number;
      }>,
    ) => {
      window.clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({
        logs: event.data.logs,
        error: event.data.error,
        passed: event.data.results.filter((test) => test.passed).length,
        failed: event.data.results.filter((test) => !test.passed).length,
        executionMs: Math.round(event.data.executionMs * 100) / 100,
      });
    };
    worker.onerror = (event) => {
      window.clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({
        logs: [],
        error: event.message,
        passed: 0,
        failed: 3,
        executionMs: 0,
      });
    };
    worker.postMessage({ code });
  });
}

export function Workspace({
  learnerId,
  cloudEnabled,
}: {
  learnerId: string;
  cloudEnabled: boolean;
}) {
  const initial = useMemo(() => loadLocal(learnerId), [learnerId]);
  const [files, setFiles] = useState<Files>(initial.files);
  const [activePath, setActivePath] = useState(initial.activePath);
  const [openFiles, setOpenFiles] = useState(() => [initial.activePath]);
  const [panel, setPanel] = useState<
    "output" | "tests" | "problems" | "preview"
  >("output");
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [hint, setHint] = useState(0);
  const [saveState, setSaveState] = useState<
    "local" | "saving" | "saved" | "offline" | "conflict"
  >("local");
  const revision = useRef(0);
  const [hydrated, setHydrated] = useState(!cloudEnabled);
  const activeContent = files[activePath] ?? "";

  useEffect(() => {
    if (!cloudEnabled) {
      return;
    }
    forgeApi
      .workspace()
      .then((remote) => {
        revision.current = remote.revision;
        if (remote.files && remote.activePath) {
          setFiles(remote.files);
          setActivePath(remote.activePath);
          setOpenFiles([remote.activePath]);
        }
        setHydrated(true);
        setSaveState("saved");
      })
      .catch(() => {
        setHydrated(true);
        setSaveState("offline");
      });
  }, [cloudEnabled]);

  useEffect(() => {
    localStorage.setItem(
      localKey(learnerId),
      JSON.stringify({ files, activePath }),
    );
    if (!cloudEnabled || !hydrated) return;
    const timer = window.setTimeout(() => {
      setSaveState("saving");
      forgeApi
        .saveWorkspace(files, activePath, revision.current)
        .then((saved) => {
          revision.current = saved.revision;
          setSaveState("saved");
        })
        .catch((reason: unknown) => {
          setSaveState(
            reason instanceof ForgeApiError && reason.status === 409
              ? "conflict"
              : "offline",
          );
        });
    }, 900);
    return () => window.clearTimeout(timer);
  }, [activePath, cloudEnabled, files, hydrated, learnerId]);

  const selectFile = (path: string) => {
    setActivePath(path);
    setOpenFiles((current) =>
      current.includes(path) ? current : [...current, path],
    );
  };
  const run = async () => {
    setRunning(true);
    setPanel("output");
    setResult(await runJavaScript(files["src/index.js"] ?? ""));
    setRunning(false);
  };
  const preview = `${files["web/index.html"] ?? ""}<style>${files["web/styles.css"] ?? ""}</style><script>${files["web/app.js"] ?? ""}</script>`;
  const exportWorkspace = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ name: "forge-workspace", files }, null, 2)], {
        type: "application/json",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "forge-workspace.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="workspace-page">
      <header className="workspace-toolbar">
        <div>
          <span className="eyebrow teal">BUILD · BROWSER WORKSPACE</span>
          <h1>JavaScript Foundations Lab</h1>
        </div>
        <div className="workspace-toolbar-actions">
          <span className={`save-state ${saveState}`}>
            <Save />
            {saveState === "saved"
              ? "Saved just now"
              : saveState === "saving"
                ? "Saving…"
                : saveState === "conflict"
                  ? "Cloud conflict"
                  : saveState === "offline"
                    ? "Saved locally"
                    : "Local draft"}
          </span>
          <button onClick={() => setFiles({ ...starterFiles })}>
            <RotateCcw /> Reset
          </button>
          <button onClick={exportWorkspace}>
            <Download /> Export
          </button>
          <button
            className="run-button"
            onClick={() => void run()}
            disabled={running}
          >
            <Play />
            {running ? "Running…" : "Run tests"}
          </button>
        </div>
      </header>
      <section className="workspace-instructions">
        <div>
          <b>Challenge: Build a reliable sum function</b>
          <p>
            Return the total of every number. Your code must handle positive
            values, negative values, and an empty array.
          </p>
        </div>
        <div className="challenge-meta">
          <span>Easy</span>
          <span>Arrays</span>
          <span>Functions</span>
        </div>
        {hint > 0 && (
          <p className="workspace-hint">
            <Lightbulb />
            {hint === 1
              ? "Start with an accumulator whose identity value is zero."
              : hint === 2
                ? "Visit every array item and add it to the accumulator."
                : "Array.prototype.reduce can express the operation, but a loop is equally valid."}
          </p>
        )}
        <button
          className="text-button"
          onClick={() => setHint((current) => Math.min(3, current + 1))}
        >
          Give me a level {Math.min(3, hint + 1)} hint
        </button>
      </section>
      <section className="workspace-ide">
        <aside className="file-explorer">
          <b>
            <Folder /> EXPLORER
          </b>
          {Object.keys(files).map((path) => (
            <button
              key={path}
              className={activePath === path ? "active" : ""}
              onClick={() => selectFile(path)}
            >
              <ChevronRight />
              <FileCode2 />
              {path}
            </button>
          ))}
        </aside>
        <div className="editor-area">
          <div className="editor-tabs">
            {openFiles.map((path) => (
              <button
                key={path}
                className={activePath === path ? "active" : ""}
                onClick={() => setActivePath(path)}
              >
                <FileCode2 />
                {path.split("/").at(-1)}
              </button>
            ))}
          </div>
          <div className="code-editor">
            <pre aria-hidden="true">
              {Array.from(
                { length: activeContent.split("\n").length },
                (_, index) => index + 1,
              ).join("\n")}
            </pre>
            <textarea
              aria-label={`Editing ${activePath}`}
              spellCheck={false}
              value={activeContent}
              onChange={(event) =>
                setFiles((current) => ({
                  ...current,
                  [activePath]: event.target.value,
                }))
              }
            />
          </div>
        </div>
        <aside className="workspace-assistant">
          <span>
            <Sparkles /> FORGE AI CONTEXT
          </span>
          <h2>Ask without losing the learning</h2>
          <p>
            Forge can see only the active challenge and file when you
            deliberately ask.
          </p>
          <button disabled>Explain this file</button>
          <button disabled>Review my approach</button>
          <button disabled>Give a debugging hint</button>
          <small>
            AI connection arrives in the dedicated gateway phase. No code is
            uploaded silently.
          </small>
        </aside>
        <div className="workspace-bottom">
          <div className="bottom-tabs">
            <button
              className={panel === "output" ? "active" : ""}
              onClick={() => setPanel("output")}
            >
              <TerminalSquare /> Output
            </button>
            <button
              className={panel === "tests" ? "active" : ""}
              onClick={() => setPanel("tests")}
            >
              Tests
            </button>
            <button
              className={panel === "problems" ? "active" : ""}
              onClick={() => setPanel("problems")}
            >
              Problems
            </button>
            <button
              className={panel === "preview" ? "active" : ""}
              onClick={() => setPanel("preview")}
            >
              Preview
            </button>
          </div>
          {panel === "preview" ? (
            <iframe
              title="Isolated web preview"
              sandbox="allow-scripts"
              srcDoc={preview}
            />
          ) : (
            <div className="terminal-output">
              {panel === "output" && (
                <>
                  {!result && (
                    <p>Run your code to see console output and results.</p>
                  )}
                  {result?.logs.map((line, index) => (
                    <code key={`${line}-${index}`}>{line}</code>
                  ))}
                  {result?.error && (
                    <code className="error">{result.error}</code>
                  )}
                  {result && (
                    <small>
                      Execution: {result.executionMs} ms · Expected output: 9
                    </small>
                  )}
                </>
              )}
              {panel === "tests" && (
                <>
                  {result ? (
                    <div className="test-summary">
                      <span className="passed">
                        <CheckCircle2 />
                        {result.passed} passed
                      </span>
                      <span className={result.failed ? "failed" : "passed"}>
                        {result.failed ? <CircleX /> : <CheckCircle2 />}
                        {result.failed} failed
                      </span>
                    </div>
                  ) : (
                    <p>No test run yet.</p>
                  )}
                </>
              )}
              {panel === "problems" && (
                <p>
                  {result?.error ??
                    (result?.failed
                      ? "Some expected behaviors are not satisfied yet."
                      : "No active problems.")}
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Workspace;
