import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  CircleX,
  Download,
  FileCode2,
  Folder,
  History,
  Lightbulb,
  Plus,
  Play,
  RotateCcw,
  Save,
  Sparkles,
  TerminalSquare,
  X,
} from "lucide-react";
import { ForgeApiError, forgeApi } from "./services/forgeApi";
import { useDialogFocus } from "./hooks/useDialogFocus";
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

type ProjectContext = { id: string; title: string } | null;

function projectFiles(project: { title: string; template: string }): Files {
  const metadata = JSON.stringify(
    {
      name: project.title,
      template: project.template,
      createdAt: new Date().toISOString(),
    },
    null,
    2,
  );
  const shared = {
    "README.md": `# ${project.title}\n\nBuilt in Forge. Edit, run, preview, and save snapshots from this workspace.`,
    ".forge/project.json": metadata,
  };
  if (project.template === "python")
    return {
      ...shared,
      "main.py": `def main():\n    print("Hello from ${project.title}")\n\nif __name__ == "__main__":\n    main()\n`,
    };
  if (project.template === "node")
    return {
      ...shared,
      "src/index.js": `function main() {\n  console.log("Hello from ${project.title}");\n}\n\nmain();\n`,
      "package.json": JSON.stringify(
        {
          name:
            project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") ||
            "forge-project",
          scripts: { start: "node src/index.js" },
        },
        null,
        2,
      ),
    };
  if (project.template === "ai-rag")
    return {
      ...shared,
      "src/index.js": `const knowledge = ["Forge projects are learned by building."];\n\nfunction retrieve(query) {\n  return knowledge.filter((item) => item.toLowerCase().includes(query.toLowerCase()));\n}\n\nconsole.log(retrieve("projects"));\n`,
      "src/prompt.md":
        "Answer only from the retrieved context. Say when the context is insufficient.",
    };
  return {
    ...shared,
    "web/index.html": `<main><h1>${project.title}</h1><p>Start building in Forge.</p><button id="action">Try it</button></main>`,
    "web/styles.css": `body { font-family: system-ui; padding: 2rem; background: #07101c; color: #e8f0f8; }\nbutton { padding: .7rem 1rem; }`,
    "web/app.js": `document.querySelector("#action")?.addEventListener("click", () => alert("It works!"));`,
  };
}

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

async function runJavaScript(code: string): Promise<RunResult> {
  const worker = new Worker("/runner-worker.js");
  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      worker.terminate();
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
  projectContext,
  openRelatedLesson,
}: {
  learnerId: string;
  cloudEnabled: boolean;
  projectContext: ProjectContext;
  openRelatedLesson: () => void;
}) {
  const initial = useMemo(() => {
    if (!projectContext) return loadLocal(learnerId);
    const files = projectFiles({
      title: projectContext.title,
      template: "html",
    });
    return { files, activePath: "web/index.html" };
  }, [learnerId, projectContext]);
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
  const [aiMode, setAiMode] = useState("hint");
  const [aiLevel, setAiLevel] = useState(1);
  const [aiQuestion, setAiQuestion] = useState("");
  const [includeActiveFile, setIncludeActiveFile] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiRequest = useRef<AbortController | null>(null);
  const [dialog, setDialog] = useState<"new" | "versions" | null>(null);
  const [snapshots, setSnapshots] = useState<
    { id: string; label: string; activePath: string; createdAt: string }[]
  >([]);
  const [snapshotLabel, setSnapshotLabel] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectTemplate, setProjectTemplate] = useState("html");
  const [workspaceMessage, setWorkspaceMessage] = useState<string | null>(null);
  const dialogRef = useDialogFocus<HTMLElement>(Boolean(dialog), () =>
    setDialog(null),
  );
  const activeContent = files[activePath] ?? "";

  useEffect(() => () => aiRequest.current?.abort(), []);

  useEffect(() => {
    if (!cloudEnabled) {
      return;
    }
    forgeApi
      .workspace()
      .then((remote) => {
        revision.current = remote.revision;
        if (!projectContext && remote.files && remote.activePath) {
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
  }, [cloudEnabled, projectContext]);

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
  const openVersions = async () => {
    setDialog("versions");
    setWorkspaceMessage(null);
    if (!cloudEnabled) return;
    try {
      setSnapshots((await forgeApi.workspaceSnapshots()).snapshots);
    } catch (reason) {
      setWorkspaceMessage(
        reason instanceof Error ? reason.message : "Could not load versions.",
      );
    }
  };
  const createSnapshot = async () => {
    if (!cloudEnabled) {
      setWorkspaceMessage("Sign in to keep version history in the cloud.");
      return;
    }
    try {
      const created = await forgeApi.createWorkspaceSnapshot({
        label:
          snapshotLabel.trim() || `Snapshot ${new Date().toLocaleString()}`,
        files,
        activePath,
      });
      setSnapshots((current) => [created.snapshot, ...current].slice(0, 20));
      setSnapshotLabel("");
      setWorkspaceMessage("Snapshot saved.");
    } catch (reason) {
      setWorkspaceMessage(
        reason instanceof Error ? reason.message : "Could not save snapshot.",
      );
    }
  };
  const restoreSnapshot = async (id: string) => {
    try {
      const { snapshot } = await forgeApi.workspaceSnapshot(id);
      setFiles(snapshot.files);
      setActivePath(snapshot.activePath);
      setOpenFiles([snapshot.activePath]);
      setDialog(null);
      setWorkspaceMessage(`Restored ${snapshot.label}.`);
    } catch (reason) {
      setWorkspaceMessage(
        reason instanceof Error
          ? reason.message
          : "Could not restore snapshot.",
      );
    }
  };
  const createProject = () => {
    const title = projectName.trim();
    if (title.length < 2) return;
    const nextFiles = projectFiles({ title, template: projectTemplate });
    const nextPath =
      Object.keys(nextFiles).find(
        (path) => !path.endsWith(".json") && path !== "README.md",
      ) ?? Object.keys(nextFiles)[0];
    setFiles(nextFiles);
    setActivePath(nextPath);
    setOpenFiles([nextPath]);
    setProjectName("");
    setDialog(null);
    setResult(null);
    setWorkspaceMessage(`Created ${title}.`);
  };
  const askForgeAi = async (mode = aiMode, message = aiQuestion.trim()) => {
    if (!cloudEnabled || message.length < 2) return;
    aiRequest.current?.abort();
    const controller = new AbortController();
    aiRequest.current = controller;
    setAiLoading(true);
    setAiError(null);
    try {
      const answer = await forgeApi.askAi(
        {
          mode,
          message,
          level: aiLevel,
          context: {
            challenge:
              "Implement sum(numbers) so positive, negative, and empty arrays pass.",
            ...(result?.error ? { error: result.error } : {}),
            ...(includeActiveFile
              ? { activeFile: { path: activePath, content: activeContent } }
              : {}),
          },
        },
        controller.signal,
      );
      if (aiRequest.current !== controller) return;
      setAiResponse(answer.response);
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError")
        return;
      setAiError(
        reason instanceof Error ? reason.message : "Forge AI is unavailable.",
      );
    } finally {
      if (aiRequest.current === controller) {
        aiRequest.current = null;
        setAiLoading(false);
      }
    }
  };

  const metadata = useMemo(() => {
    try {
      return JSON.parse(files[".forge/project.json"] ?? "null") as {
        name?: string;
        template?: string;
      } | null;
    } catch {
      return null;
    }
  }, [files]);

  return (
    <main className="workspace-page">
      <header className="workspace-toolbar">
        <div>
          <span className="eyebrow teal">BUILD · BROWSER WORKSPACE</span>
          <h1>{metadata?.name ?? "JavaScript Foundations Lab"}</h1>
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
          <button onClick={() => setDialog("new")}>
            <Plus /> New project
          </button>
          <button onClick={() => void openVersions()}>
            <History /> Versions
          </button>
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
      {workspaceMessage && (
        <p className="workspace-message" role="status">
          {workspaceMessage}
        </p>
      )}
      <section className="workspace-instructions">
        <div>
          <b>
            {metadata
              ? `${metadata.name} project brief`
              : "Challenge: Build a reliable sum function"}
          </b>
          <p>
            {metadata
              ? `A ${metadata.template ?? "custom"} starter you can extend, preview, export, and restore from cloud snapshots.`
              : "Return the total of every number. Your code must handle positive values, negative values, and an empty array."}
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
            Forge receives only the context listed below when you deliberately
            ask.
          </p>
          <label className="ai-field">
            Teaching mode
            <select
              value={aiMode}
              onChange={(event) => setAiMode(event.target.value)}
            >
              <option value="hint">Hint</option>
              <option value="debug">Debug</option>
              <option value="review-code">Review code</option>
              <option value="explain">Explain</option>
              <option value="quiz-me">Quiz me</option>
            </select>
          </label>
          <label className="ai-field">
            Hint level {aiLevel}
            <input
              type="range"
              min="1"
              max="5"
              value={aiLevel}
              onChange={(event) => setAiLevel(Number(event.target.value))}
            />
          </label>
          <label className="ai-context-choice">
            <input
              type="checkbox"
              checked={includeActiveFile}
              onChange={(event) => setIncludeActiveFile(event.target.checked)}
            />
            Include active file: <code>{activePath}</code>
          </label>
          <small>
            Always included: challenge title
            {result?.error ? " and current error" : ""}. No other files or notes
            are sent.
          </small>
          <textarea
            aria-label="Ask Forge AI"
            placeholder="Why are my tests failing?"
            value={aiQuestion}
            onChange={(event) => setAiQuestion(event.target.value)}
          />
          <button
            className="ask-ai-button"
            disabled={
              !cloudEnabled || aiLoading || aiQuestion.trim().length < 2
            }
            onClick={() => void askForgeAi()}
          >
            <Sparkles />
            {aiLoading
              ? "Thinking…"
              : cloudEnabled
                ? "Ask Forge AI"
                : "Sign in to use Forge AI"}
          </button>
          {aiLoading && (
            <button
              className="stop-ai-button"
              onClick={() => aiRequest.current?.abort()}
            >
              Stop response
            </button>
          )}
          {aiError && (
            <p className="ai-error" role="alert">
              {aiError}
            </p>
          )}
          {aiResponse && (
            <div className="ai-response" aria-live="polite">
              <b>Forge AI</b>
              <p>{aiResponse}</p>
              <div className="ai-response-actions">
                <button
                  onClick={() =>
                    void askForgeAi(
                      "explain-simply",
                      `Explain this more simply: ${aiQuestion.trim()}`,
                    )
                  }
                >
                  Explain simpler
                </button>
                <button
                  onClick={() =>
                    void askForgeAi(
                      "explain-deeply",
                      `Go deeper on this question: ${aiQuestion.trim()}`,
                    )
                  }
                >
                  Go deeper
                </button>
                <button
                  onClick={() =>
                    void askForgeAi(
                      "explain",
                      `Give me one concrete example for: ${aiQuestion.trim()}`,
                    )
                  }
                >
                  Give example
                </button>
                <button
                  onClick={() =>
                    void askForgeAi(
                      "quiz-me",
                      `Quiz me on: ${aiQuestion.trim()}`,
                    )
                  }
                >
                  Quiz me
                </button>
                <button
                  onClick={() =>
                    void askForgeAi(
                      "generate-practice",
                      `Create deliberate practice for: ${aiQuestion.trim()}`,
                    )
                  }
                >
                  Practice this
                </button>
                <button onClick={openRelatedLesson}>Open related lesson</button>
                <button
                  onClick={() =>
                    void navigator.clipboard
                      .writeText(aiResponse)
                      .then(() => setWorkspaceMessage("AI response copied."))
                  }
                >
                  Copy response
                </button>
                <button onClick={() => void askForgeAi()}>Regenerate</button>
              </div>
            </div>
          )}
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
      {dialog && (
        <div
          className="workspace-dialog-backdrop"
          role="presentation"
          onMouseDown={() => setDialog(null)}
        >
          <section
            ref={dialogRef}
            className="workspace-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={dialog === "new" ? "Create project" : "Version history"}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <span className="eyebrow teal">WORKSPACE</span>
                <h2>
                  {dialog === "new" ? "Create a project" : "Version history"}
                </h2>
              </div>
              <button aria-label="Close dialog" onClick={() => setDialog(null)}>
                <X />
              </button>
            </header>
            {dialog === "new" ? (
              <div className="workspace-dialog-form">
                <label>
                  Project name
                  <input
                    data-dialog-initial-focus
                    value={projectName}
                    maxLength={60}
                    onChange={(event) => setProjectName(event.target.value)}
                    placeholder="My production app"
                  />
                </label>
                <label>
                  Starter
                  <select
                    value={projectTemplate}
                    onChange={(event) => setProjectTemplate(event.target.value)}
                  >
                    <option value="html">HTML / CSS / JavaScript</option>
                    <option value="node">Node.js</option>
                    <option value="python">Python</option>
                    <option value="ai-rag">AI / RAG</option>
                  </select>
                </label>
                <button
                  className="run-button"
                  disabled={projectName.trim().length < 2}
                  onClick={createProject}
                >
                  Create project
                </button>
              </div>
            ) : (
              <div className="workspace-versions">
                <div className="snapshot-create">
                  <input
                    value={snapshotLabel}
                    maxLength={80}
                    onChange={(event) => setSnapshotLabel(event.target.value)}
                    placeholder="What changed?"
                  />
                  <button
                    onClick={() => void createSnapshot()}
                    disabled={!cloudEnabled}
                  >
                    <Save /> Save snapshot
                  </button>
                </div>
                {!cloudEnabled && (
                  <p>Sign in to create and restore cloud snapshots.</p>
                )}
                {snapshots.map((snapshot) => (
                  <article key={snapshot.id}>
                    <div>
                      <b>{snapshot.label}</b>
                      <span>
                        {new Date(snapshot.createdAt).toLocaleString()} ·{" "}
                        {snapshot.activePath}
                      </span>
                    </div>
                    <button onClick={() => void restoreSnapshot(snapshot.id)}>
                      Restore
                    </button>
                  </article>
                ))}
                {cloudEnabled && snapshots.length === 0 && (
                  <p>No snapshots yet. Save one before a major change.</p>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

export default Workspace;
