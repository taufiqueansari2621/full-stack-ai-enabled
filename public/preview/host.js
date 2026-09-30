(() => {
  const origin = new URL(document.currentScript.src).origin;
  const report = (message) => parent.postMessage({ type: "forge-preview-error", message: String(message).slice(0, 2000) }, origin);
  addEventListener("error", event => report(event.message));
  addEventListener("unhandledrejection", event => report(event.reason?.message ?? "Preview promise rejected"));
  let started = false;
  addEventListener("message", event => {
    if (started || event.source !== parent || event.origin !== origin || event.data?.type !== "forge-preview-build") return;
    if (!["react", "angular"].includes(event.data.framework)) return;
    started = true;
    const script = document.createElement("script");
    script.src = `${origin}/preview/${event.data.framework}.js`;
    script.onerror = () => report("Framework runtime failed to load. Rebuild when connected.");
    script.onload = () => {
      try { window.ForgePreview.boot(event.data.build); parent.postMessage({ type: "forge-preview-started" }, origin); }
      catch (error) { report(error.message); }
    };
    document.head.append(script);
  });
  parent.postMessage({ type: "forge-preview-ready" }, origin);
})();
