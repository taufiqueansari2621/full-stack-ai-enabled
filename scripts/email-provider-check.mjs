// Operator-only, one-message production probe. Never reads the SMTP secret.
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";

if (process.argv[2] !== "--send-one-to-owned-mailbox")
  throw new Error("Explicit one-message probe flag required.");
const origin = "https://forge-ai-engineering.taufiqueansari895.workers.dev";
const id = randomUUID();
const suffix = Date.now();
const email = `zerotoaiforge+forgecheck${suffix}@gmail.com`;
const session = randomBytes(32).toString("base64url");
const hash = (value) => createHash("sha256").update(value).digest("hex");
const now = new Date().toISOString();
const sql = (command) =>
  execFileSync(
    "./node_modules/.bin/wrangler",
    ["d1", "execute", "forge-production", "--remote", "--command", command],
    { stdio: "pipe" },
  );
try {
  // UUID and timestamp-generated aliases only; no existing account is used.
  sql(`INSERT INTO users(id,email,password_hash,password_salt,created_at,updated_at) VALUES('${id}','${email}','${hash(randomBytes(32).toString("hex"))}','synthetic-no-login','${now}','${now}');
    INSERT INTO profiles(user_id,full_name,username,created_at,updated_at) VALUES('${id}','Forge SMTP Check','mailcheck_${suffix}','${now}','${now}');
    INSERT INTO sessions(id,user_id,token_hash,expires_at,created_at) VALUES('${randomUUID()}','${id}','${hash(session)}','${new Date(Date.now() + 600000).toISOString()}','${now}');`);
  const response = await fetch(`${origin}/api/auth/email/verify/request`, {
    method: "POST",
    headers: {
      origin,
      "content-type": "application/json",
      cookie: `__Host-forge_session=${session}`,
    },
    body: "{}",
    signal: AbortSignal.timeout(30000),
  });
  const result = await response.json();
  assert.equal(
    response.status,
    200,
    `SMTP probe rejected: ${result.error?.code ?? response.status}`,
  );
  assert.equal(result.ok, true);
  console.log(
    "Gmail accepted one production SMTP submission to the owner's tagged inbox. Inbox receipt is not confirmed. The diagnostic link becomes inactive when the synthetic account is removed.",
  );
} finally {
  sql(`DELETE FROM users WHERE id='${id}' AND email='${email}';`);
  console.log(
    "Removed only the exact synthetic mail-check account and its cascading test records; no learner account was changed.",
  );
}
