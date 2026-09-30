import { useEffect, useRef, useState } from "react";
import type { PreviewBuild } from "../domain/frameworkPreview";

export function FrameworkPreview({
  files,
  framework,
}: {
  files: Record<string, string>;
  framework: "react" | "angular";
}) {
  const [built, setBuilt] = useState<{
    build: PreviewBuild;
    files: Record<string, string>;
    framework: string;
    id: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const frame = useRef<HTMLIFrameElement>(null);
  const compiler = useRef<Worker | null>(null);
  const revision = useRef(0);
  const current = useRef(files);
  useEffect(() => {
    current.current = files;
  }, [files]);
  useEffect(
    () => () => {
      revision.current++;
      compiler.current?.terminate();
    },
    [],
  );
  const active =
    built?.files === files && built.framework === framework ? built : null;
  useEffect(() => {
    if (!active) return;
    const handle = (event: MessageEvent) => {
      if (
        event.source !== frame.current?.contentWindow ||
        event.origin !== "null"
      )
        return;
      if (event.data?.type === "forge-preview-ready") {
        frame.current?.contentWindow?.postMessage(
          { type: "forge-preview-build", framework, build: active.build },
          "*",
        );
      } else if (
        event.data?.type === "forge-preview-error" &&
        typeof event.data.message === "string"
      ) {
        setError(event.data.message.slice(0, 2000));
        setStatus("Preview reported an error.");
      } else if (event.data?.type === "forge-preview-started")
        setStatus(
          "Preview started. This is transpilation/JIT, not a full typecheck or production build.",
        );
    };
    window.addEventListener("message", handle);
    const timer = setTimeout(
      () =>
        setStatus((value) =>
          value.startsWith("Loading")
            ? "Preview is taking longer than expected. Stop and rebuild when connected."
            : value,
        ),
      15000,
    );
    return () => {
      clearTimeout(timer);
      window.removeEventListener("message", handle);
    };
  }, [active, framework]);
  function stop() {
    revision.current++;
    compiler.current?.terminate();
    compiler.current = null;
    setBusy(false);
    setBuilt(null);
    setStatus("Preview stopped.");
  }
  async function build() {
    stop();
    setError("");
    setStatus("Compiling workspace modules…");
    setBusy(true);
    const id = ++revision.current;
    const snapshot = files;
    const worker = new Worker(
      new URL("../workers/typescript.worker.ts", import.meta.url),
      { type: "module" },
    );
    compiler.current = worker;
    const result = await new Promise<PreviewBuild>((resolve) => {
      const finish = (data: PreviewBuild) => {
        clearTimeout(timer);
        worker.terminate();
        resolve(data);
      };
      const failed = (message: string): PreviewBuild => ({
        entry: "",
        modules: {},
        imports: {},
        styles: "",
        diagnostics: [message],
      });
      const timer = setTimeout(
        () => finish(failed("Preview compilation exceeded ten seconds.")),
        10000,
      );
      worker.onerror = () =>
        finish(
          failed("Preview compiler could not load. Retry when connected."),
        );
      worker.onmessage = (event: MessageEvent<PreviewBuild>) =>
        finish(event.data);
      worker.postMessage({
        mode: "framework",
        files: snapshot,
        framework,
        source: "",
      });
    });
    if (id !== revision.current) return;
    setBusy(false);
    if (current.current !== snapshot) {
      setStatus("Files changed during compilation. Build the latest files.");
      return;
    }
    if (result.diagnostics.length) {
      setError(result.diagnostics.join("\n"));
      setStatus("Build failed; no learner code executed.");
      return;
    }
    setStatus("Loading isolated runtime…");
    setBuilt({ build: result, files: snapshot, framework, id });
  }
  return (
    <div className="framework-preview">
      <p>
        {framework === "react" ? "React" : "Angular"} browser preview · fixed
        bundled packages, local imports and CSS. No npm installs, server APIs,
        or full framework typecheck. Run only code you trust: browser previews
        cannot enforce server-grade CPU/memory limits.
      </p>
      <button disabled={busy} onClick={() => void build()}>
        {busy ? "Building preview…" : "Build framework preview"}
      </button>
      <button onClick={stop} disabled={!busy && !built}>
        Stop preview
      </button>
      <p role="status">
        {built && !active
          ? "Files changed. Build again to preview your latest edits."
          : status}
      </p>
      {error && <pre role="alert">{error}</pre>}
      {active && (
        <iframe
          ref={frame}
          key={active.id}
          title="Isolated framework preview"
          sandbox="allow-scripts"
          src="/preview/"
        />
      )}
    </div>
  );
}
