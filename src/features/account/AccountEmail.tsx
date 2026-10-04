import { useCallback, useEffect, useState, type FormEvent } from "react";
import { forgeApi } from "../../services/forgeApi";
import { AccountChallenge } from "../../AccountChallenge";

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : "Please retry later.";

export function EmailVerificationPanel() {
  const [status, setStatus] = useState<Awaited<
    ReturnType<typeof forgeApi.emailStatus>
  > | null>(null);
  const [message, setMessage] = useState("Loading email status…");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    void forgeApi
      .emailStatus(controller.signal)
      .then((value) => {
        setStatus(value);
        setMessage("");
      })
      .catch((error) => {
        if (!controller.signal.aborted) setMessage(messageOf(error));
      });
    return () => controller.abort();
  }, []);
  async function resend() {
    setBusy(true);
    try {
      await forgeApi.sendVerification();
      setMessage(
        "Verification email accepted for delivery. Check your inbox and spam folder; delivery can take a few minutes.",
      );
    } catch (error) {
      setMessage(messageOf(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="account-email-setting">
      <h3>Email verification</h3>
      {status && (
        <p>
          {status.email} · {status.verifiedAt ? "Verified" : "Not verified"}
        </p>
      )}
      {status && !status.verifiedAt && (
        <>
          <p>
            Verify your inbox to enable email password recovery. Your saved
            recovery code still works.
          </p>
          <button
            className="secondary-button"
            disabled={busy || !status.deliveryConfigured}
            onClick={() => void resend()}
          >
            {busy ? "Sending…" : "Send verification email"}
          </button>
        </>
      )}
      {status && !status.deliveryConfigured && (
        <p>Email delivery is currently unavailable.</p>
      )}
      <p role="status">{message}</p>
    </section>
  );
}

export function EmailResetRequest({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const verified = useCallback((value: string | null) => setToken(value), []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const result = await forgeApi.requestEmailReset(email, token ?? "");
      setMessage(result.message);
    } catch (error) {
      setMessage(messageOf(error));
    } finally {
      setBusy(false);
      setToken(null);
      setAttempt((value) => value + 1);
    }
  }
  return (
    <main className="profile-gate">
      <form
        className="profile-card panel account-email-form"
        onSubmit={(event) => void submit(event)}
      >
        <button className="back-link" type="button" onClick={onBack}>
          Back to sign in
        </button>
        <h1>Reset by email</h1>
        <p>
          Only previously verified accounts can receive a reset link. You can
          also return and use your saved recovery code.
        </p>
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <AccountChallenge
          key={`email-request:${attempt}`}
          action="recover"
          onVerified={verified}
        />
        <button className="primary-button" disabled={busy || token === null}>
          {busy ? "Requesting…" : "Email a reset link"}
        </button>
        <p role="status">{message}</p>
      </form>
    </main>
  );
}

export function EmailLinkPage() {
  const [link] = useState(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const purpose = params.has("verify")
      ? ("verify" as const)
      : ("reset" as const);
    const token = params.get(purpose) ?? "";
    return { purpose, token, valid: /^[A-Za-z0-9_-]{43}$/.test(token) };
  });
  const [password, setPassword] = useState("");
  const [challenge, setChallenge] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const verified = useCallback(
    (value: string | null) => setChallenge(value),
    [],
  );
  useEffect(() => {
    window.history.replaceState(null, "", window.location.pathname);
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const result = await forgeApi.consumeEmail({
        ...link,
        password,
        turnstileToken: challenge ?? "",
      });
      setCode(result.recoveryCode ?? "");
      setDone(true);
    } catch (error) {
      setMessage(messageOf(error));
    } finally {
      setBusy(false);
      setChallenge(null);
      setAttempt((value) => value + 1);
    }
  }
  return (
    <main className="profile-gate">
      <section className="profile-card panel account-email-form">
        <h1>
          {link.purpose === "verify"
            ? "Verify your email"
            : "Reset your password"}
        </h1>
        {!link.valid ? (
          <p>
            This link is missing or invalid. Request another email from Forge.
          </p>
        ) : done ? (
          <>
            <p role="status">
              {link.purpose === "verify"
                ? "Email verified. Email password recovery is now available."
                : "Password reset. Previous sessions have been signed out."}
            </p>
            {code && (
              <div className="account-recovery-result">
                <p>
                  Save this new recovery code privately. Your previous code no
                  longer works.
                </p>
                <code>{code}</code>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={(event) => void submit(event)}>
            <p>
              Confirm below to use this single-use link. Opening the page alone
              does not change your account.
            </p>
            {link.purpose === "reset" && (
              <>
                <label>
                  New password
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={10}
                    maxLength={128}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </label>
                <AccountChallenge
                  key={`email-consume:${attempt}`}
                  action="recover"
                  onVerified={verified}
                />
              </>
            )}
            <button
              className="primary-button"
              disabled={
                busy || (link.purpose === "reset" && challenge === null)
              }
            >
              {busy
                ? "Please wait…"
                : link.purpose === "verify"
                  ? "Confirm email verification"
                  : "Set new password"}
            </button>
            <p role="alert">{message}</p>
          </form>
        )}
        <a className="back-link" href="/">
          Return to Forge
        </a>
      </section>
    </main>
  );
}
