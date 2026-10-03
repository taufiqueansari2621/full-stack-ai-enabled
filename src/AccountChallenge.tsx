import { useEffect, useRef, useState } from "react";
import { forgeApi } from "./services/forgeApi";

type Turnstile = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      size: "flexible";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

let sdk: Promise<Turnstile> | undefined;
function loadSdk(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (sdk) return sdk;
  sdk = new Promise<Turnstile>((resolve, reject) => {
    const script = document.createElement("script");
    const failed = () => {
      clearTimeout(deadline);
      script.remove();
      sdk = undefined;
      reject(new Error("Security check could not load. Please retry."));
    };
    const deadline = window.setTimeout(failed, 15000);
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onerror = failed;
    script.onload = () => {
      if (!window.turnstile) return failed();
      clearTimeout(deadline);
      resolve(window.turnstile);
    };
    document.head.append(script);
  });
  return sdk;
}

export function AccountChallenge({
  action,
  onVerified,
}: {
  action: "register" | "login" | "recover";
  onVerified: (token: string | null) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [retry, setRetry] = useState(0);
  const [status, setStatus] = useState("Loading security check…");
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const configurationDeadline = window.setTimeout(() => {
      controller.abort();
      setError(true);
      setStatus(
        "Security check is unavailable. Please retry. Local learning still works.",
      );
    }, 15000);
    let provider: Turnstile | undefined;
    let widget: string | undefined;
    onVerified(null);
    const invalidate = () => {
      if (controller.signal.aborted) return;
      onVerified(null);
      setError(true);
      setStatus("Security check expired or failed. Please retry.");
    };
    void (async () => {
      try {
        const config = await forgeApi.accountSecurityConfig(controller.signal);
        clearTimeout(configurationDeadline);
        if (controller.signal.aborted) return;
        if (config.turnstileSiteKey === null) {
          setStatus("");
          onVerified("");
          return;
        }
        if (
          typeof config.turnstileSiteKey !== "string" ||
          !config.turnstileSiteKey
        )
          throw new Error("Invalid security configuration");
        provider = await loadSdk();
        if (controller.signal.aborted || !container.current) return;
        widget = provider.render(container.current, {
          sitekey: config.turnstileSiteKey,
          action,
          size: "flexible",
          callback: (token) => {
            if (controller.signal.aborted) return;
            onVerified(token);
            setError(false);
            setStatus("Security check complete.");
          },
          "expired-callback": invalidate,
          "error-callback": invalidate,
        });
      } catch {
        clearTimeout(configurationDeadline);
        if (controller.signal.aborted) return;
        setError(true);
        setStatus(
          "Security check is unavailable. Please retry. Local learning still works.",
        );
      }
    })();
    return () => {
      controller.abort();
      clearTimeout(configurationDeadline);
      if (provider && widget !== undefined) provider.remove(widget);
    };
  }, [action, retry, onVerified]);
  return (
    <div className="account-challenge">
      <div ref={container} />
      {status && <p role={error ? "alert" : "status"}>{status}</p>}
      {error && (
        <button
          type="button"
          className="text-button"
          onClick={() => {
            setError(false);
            setStatus("Loading security check…");
            setRetry((value) => value + 1);
          }}
        >
          Retry security check
        </button>
      )}
    </div>
  );
}
