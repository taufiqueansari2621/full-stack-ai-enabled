import { useEffect, useRef, useState } from "react";
import { forgeApi } from "./services/forgeApi";
import "./cloudRecords.css";

export default function AccountSessions() {
  const [data, setData] = useState<Awaited<
    ReturnType<typeof forgeApi.activeSessions>
  > | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState<
    Parameters<typeof forgeApi.revokeSessions>[0] | null
  >(null);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);
  async function load(revoke?: Parameters<typeof forgeApi.revokeSessions>[0]) {
    const controller = new AbortController();
    pending.current?.abort();
    pending.current = controller;
    setBusy(true);
    setError("");
    setMessage("");
    setConfirm(null);
    try {
      if (!navigator.onLine)
        throw new Error("Offline. Reconnect to manage cloud sessions.");
      if (revoke) {
        await forgeApi.revokeSessions(revoke);
        if (!controller.signal.aborted)
          setMessage(
            "Revocation saved. Your current session remains signed in.",
          );
      }
      if (controller.signal.aborted) return;
      const result = await forgeApi.activeSessions(controller.signal);
      if (!controller.signal.aborted) setData(result);
    } catch (reason) {
      if (!controller.signal.aborted)
        setError(
          reason instanceof Error
            ? reason.message
            : "Session request failed. Try again.",
        );
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  return (
    <section
      className="page panel cloud-learning-records"
      aria-label="Account security"
    >
      <h2>Account security</h2>
      <p>
        Manage active cloud sign-ins. Dates identify sessions, not devices or
        locations. Revocation blocks future requests; it cannot undo requests
        already running.
      </p>
      <button disabled={busy} onClick={() => void load()}>
        {busy ? "Updating sessions…" : "Load active sessions"}
      </button>
      {error && <p role="alert">{error} Use Load active sessions to retry.</p>}
      {message && <p role="status">{message}</p>}
      {data && (
        <>
          {!data.sessions.length && (
            <p role="status">
              No active sessions found. Sign in again if your session expired.
            </p>
          )}
          {data.truncated && (
            <p>
              Showing the first 50 sessions. Revoke all others also covers
              sessions not shown.
            </p>
          )}
          {data.sessions.map((session) => (
            <article key={session.id}>
              <h3>{session.current ? "Current session" : "Other session"}</h3>
              <p>
                Signed in: {new Date(session.createdAt).toLocaleString()} ·
                Expires: {new Date(session.expiresAt).toLocaleString()}
              </p>
              {!session.current && (
                <button
                  disabled={busy}
                  onClick={() =>
                    setConfirm({ scope: "session", id: session.id })
                  }
                >
                  Revoke this session
                </button>
              )}
            </article>
          ))}
          {(data.truncated ||
            data.sessions.some((session) => !session.current)) && (
            <button
              disabled={busy}
              onClick={() => setConfirm({ scope: "others" })}
            >
              Revoke all other sessions
            </button>
          )}
        </>
      )}
      {confirm && (
        <div role="group" aria-label="Confirm session revocation">
          <p>
            {confirm.scope === "others"
              ? "Sign out every other cloud session?"
              : "Sign out this other cloud session?"}{" "}
            Your current session will stay signed in.
          </p>
          <button disabled={busy} onClick={() => void load(confirm)}>
            Confirm revocation
          </button>
          <button disabled={busy} onClick={() => setConfirm(null)}>
            Cancel revocation
          </button>
        </div>
      )}
    </section>
  );
}
