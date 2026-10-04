// Explicit operator probe; print only allowlisted stage codes, never tail data.
import { spawn } from "node:child_process";

if (process.argv[2] !== "--send-one-to-owned-mailbox")
  throw new Error("An explicit one-message flag is required.");
const reasons = new Set([
  "MAIL_CONFIGURATION_INVALID",
  "MAIL_TIMEOUT",
  "MAIL_CONNECTION_FAILED",
  "MAIL_REPLY_TOO_LARGE",
  "MAIL_GREETING_REJECTED",
  "MAIL_EHLO_REJECTED",
  "MAIL_AUTH_REJECTED",
  "MAIL_SENDER_REJECTED",
  "MAIL_RECIPIENT_REJECTED",
  "MAIL_DATA_REJECTED",
  "MAIL_SUBMISSION_REJECTED",
  "MAIL_TRANSPORT_FAILED",
]);
const tail = spawn(
  "./node_modules/.bin/wrangler",
  [
    "tail",
    "forge-ai-engineering",
    "--format",
    "pretty",
    "--search",
    "account_mail_unavailable",
  ],
  { stdio: ["ignore", "pipe", "pipe"] },
);
let buffer = "";
let started = false;
let probeFinished = false;
let reason;
let probeStatus;
let probeErrorCode;
let cleanupConfirmed = false;
let resolveDone;
const done = new Promise((resolve) => {
  resolveDone = resolve;
});
function finish() {
  tail.kill("SIGTERM");
  resolveDone();
}
function consume(chunk) {
  buffer += chunk.toString();
  if (buffer.length > 200000) {
    buffer = "";
    return;
  }
  if (!started && /Connected to/i.test(buffer)) startProbe();
  const safeStage = buffer.match(
    /account_mail_unavailable[\s\S]{0,300}?\b(MAIL_[A-Z_]+)\b/,
  )?.[1];
  if (safeStage && reasons.has(safeStage)) {
    reason = safeStage;
    if (probeFinished) finish();
  }
  while (true) {
    const begin = buffer.indexOf("{");
    if (begin < 0) {
      buffer = buffer.slice(-500);
      return;
    }
    let depth = 0,
      quoted = false,
      escaped = false,
      end = -1;
    for (let i = begin; i < buffer.length; i++) {
      const character = buffer[i];
      if (quoted) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === '"') quoted = false;
      } else if (character === '"') quoted = true;
      else if (character === "{") depth++;
      else if (character === "}" && --depth === 0) {
        end = i + 1;
        break;
      }
    }
    if (end < 0) {
      buffer = buffer.slice(begin);
      return;
    }
    const candidate = buffer.slice(begin, end);
    buffer = buffer.slice(end);
    try {
      const entry = JSON.parse(candidate);
      if (
        entry?.event === "account_mail_unavailable" &&
        reasons.has(entry.reason)
      ) {
        reason = entry.reason;
        if (probeFinished) finish();
      }
      for (const log of entry.logs ?? []) {
        for (const message of log.message ?? []) {
          try {
            const event =
              typeof message === "string" ? JSON.parse(message) : message;
            if (
              event?.event === "account_mail_unavailable" &&
              reasons.has(event.reason)
            ) {
              reason = event.reason;
              if (probeFinished) finish();
            }
          } catch {
            /* Never emit untrusted tail messages. */
          }
        }
      }
    } catch {
      /* Ignore non-JSON CLI status without printing it. */
    }
  }
}
function startProbe() {
  if (started) return;
  started = true;
  const probe = spawn(
    process.execPath,
    ["scripts/email-provider-check.mjs", "--send-one-to-owned-mailbox"],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  probe.stdout.on("data", (chunk) => {
    if (
      chunk
        .toString()
        .includes("Removed only the exact synthetic mail-check account")
    )
      cleanupConfirmed = true;
  });
  probe.stderr.on("data", (chunk) => {
    const code = chunk.toString().match(/SMTP probe rejected: ([A-Z_]+)/)?.[1];
    if (code && /^[A-Z_]{1,50}$/.test(code)) probeErrorCode = code;
  });
  probe.on("exit", (code) => {
    probeFinished = true;
    probeStatus = code;
    if (reason || code === 0 || tail.killed) finish();
  });
  probe.on("error", () => {
    probeFinished = true;
    probeStatus = 1;
    finish();
  });
}
tail.stdout.on("data", consume);
tail.stderr.on("data", (chunk) => {
  if (/Connected to/i.test(chunk.toString())) startProbe();
});
tail.on("error", finish);
tail.on("exit", () => {
  if (!started || probeFinished) resolveDone();
});
const deadline = setTimeout(() => {
  if (!started || probeFinished) finish();
  else tail.kill("SIGTERM");
}, 45000);
await done;
clearTimeout(deadline);
console.log(
  JSON.stringify({
    probeStarted: started,
    probeExitCode: probeStatus ?? null,
    mailFailureReason: reason ?? null,
    probeErrorCode: probeErrorCode ?? null,
    cleanupConfirmed,
  }),
);
if (!started || probeStatus !== 0) process.exitCode = 1;
