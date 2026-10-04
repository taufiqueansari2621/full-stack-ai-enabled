// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { readdirSync, readFileSync } from "node:fs";
import { accountEmailRoutes } from "../worker/routes/accountEmail";
import { sha256 } from "../worker/security";
import type { Env } from "../worker/types";

vi.mock("../worker/mail/gmail", () => ({
  mailConfigured: (env: Env) => Boolean(env.GMAIL_APP_PASSWORD),
  sendAccountMail: vi.fn(),
}));
vi.mock("../worker/turnstile", () => ({ verifyAccountChallenge: vi.fn() }));
import { sendAccountMail } from "../worker/mail/gmail";
import { verifyAccountChallenge } from "../worker/turnstile";

let db: DatabaseSync;
let env: Env;
const now = new Date().toISOString();
const user = {
  id: "owner",
  email: "owner@example.invalid",
  fullName: "Owner",
  username: "owner",
};
beforeEach(() => {
  db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys=ON");
  for (const file of readdirSync("migrations")
    .filter((value) => value.endsWith(".sql"))
    .sort())
    db.exec(readFileSync(`migrations/${file}`, "utf8"));
  db.prepare(
    "INSERT INTO users(id,email,password_hash,password_salt,created_at,updated_at) VALUES(?,?,'oldhash','oldsalt',?,?)",
  ).run(user.id, user.email, now, now);
  const DB = {
    prepare(sql: string) {
      let values: (string | number | null)[] = [];
      const statement = {
        bind(...args: unknown[]) {
          values = args as typeof values;
          return statement;
        },
        async first() {
          return db.prepare(sql).get(...values) ?? null;
        },
        async run() {
          db.prepare(sql).run(...values);
          return { success: true };
        },
      };
      return statement;
    },
  };
  env = { DB, GMAIL_APP_PASSWORD: "synthetic-secret" } as unknown as Env;
  vi.mocked(sendAccountMail).mockReset();
  vi.mocked(verifyAccountChallenge).mockReset();
});
async function call(
  path: string,
  body: unknown = {},
  origin = "https://forge.test",
  method = "POST",
) {
  const route = accountEmailRoutes.find((route) => route.pattern === path)!;
  const request = new Request(`https://forge.test${path}`, {
    method,
    headers: { origin, "content-type": "application/json" },
    ...(method === "POST" ? { body: JSON.stringify(body) } : {}),
  });
  return route.handler({
    request,
    env,
    user,
    requestId: "test",
    url: new URL(request.url),
  });
}
async function seed(purpose: string, token = "a".repeat(43), expired = false) {
  db.prepare(
    "INSERT INTO account_email_tokens(id,user_id,token_hash,purpose,created_at,expires_at) VALUES(?,?,?,?,?,?)",
  ).run(
    purpose,
    user.id,
    await sha256(token),
    purpose,
    now,
    new Date(Date.now() + (expired ? -10000 : 3600000)).toISOString(),
  );
  return token;
}
describe("account email boundaries", () => {
  it("concurrent confirmations allow exactly one consumption", async () => {
    const token = await seed("verify");
    const outcomes = await Promise.allSettled([
      call("/api/auth/email/consume", { token, purpose: "verify" }),
      call("/api/auth/email/consume", { token, purpose: "verify" }),
    ]);
    expect(
      outcomes.filter((value) => value.status === "fulfilled"),
    ).toHaveLength(1);
    expect(
      outcomes.filter((value) => value.status === "rejected"),
    ).toHaveLength(1);
  });
  it("owner throttles apply even when requests come from different IPs", async () => {
    const send = accountEmailRoutes.find(
      (route) => route.pattern === "/api/auth/email/verify/request",
    )!;
    for (let i = 0; i < 4; i++) {
      const request = new Request(
        "https://forge.test/api/auth/email/verify/request",
        {
          method: "POST",
          headers: {
            origin: "https://forge.test",
            "cf-connecting-ip": `192.0.2.${i}`,
          },
        },
      );
      const result = send.handler({
        request,
        env,
        user,
        requestId: "test",
        url: new URL(request.url),
      });
      if (i === 3) await expect(result).rejects.toMatchObject({ status: 429 });
      else await result;
    }
    expect(sendAccountMail).toHaveBeenCalledTimes(3);
  });
  it("owner deletion cascades mail tokens and throttle records", async () => {
    await call("/api/auth/email/verify/request");
    db.prepare("DELETE FROM users WHERE id=?").run(user.id);
    expect(
      db.prepare("SELECT count(*) AS n FROM account_email_tokens").get()?.n,
    ).toBe(0);
    expect(
      db.prepare("SELECT count(*) AS n FROM account_mail_limits").get()?.n,
    ).toBe(0);
  });
  it("requires authentication for status/resend and rejects missing/wrong origin", async () => {
    expect(
      accountEmailRoutes
        .filter((route) => route.auth)
        .map((route) => route.pattern),
    ).toEqual(["/api/auth/email", "/api/auth/email/verify/request"]);
    await expect(
      call("/api/auth/email/verify/request", {}, "https://other.test"),
    ).rejects.toMatchObject({ status: 403 });
    expect(sendAccountMail).not.toHaveBeenCalled();
  });
  it("stores only hashed tokens and exposes no link in its response", async () => {
    const response = await call("/api/auth/email/verify/request");
    expect(await response.json()).toEqual({ ok: true });
    const token = vi.mocked(sendAccountMail).mock.calls[0][3];
    const row = db.prepare("SELECT token_hash FROM account_email_tokens").get();
    expect(row?.token_hash).toBe(await sha256(token));
    expect(row?.token_hash).not.toBe(token);
  });
  it("failed submission deletes the undelivered token but spends quota", async () => {
    vi.mocked(sendAccountMail).mockRejectedValue(
      new Error("synthetic failure"),
    );
    await expect(call("/api/auth/email/verify/request")).rejects.toThrow(
      "synthetic failure",
    );
    expect(
      db.prepare("SELECT count(*) AS n FROM account_email_tokens").get()?.n,
    ).toBe(0);
    expect(
      db.prepare("SELECT attempts FROM account_mail_quota").get()?.attempts,
    ).toBe(1);
  });
  it("verification consumes once, rejects wrong purpose/expiry, and never changes a password", async () => {
    const token = await seed("verify");
    await expect(
      call("/api/auth/email/consume", {
        token,
        purpose: "reset",
        password: "long-password",
      }),
    ).rejects.toMatchObject({ code: "INVALID_LINK" });
    await call("/api/auth/email/consume", { token, purpose: "verify" });
    expect(
      db.prepare("SELECT email_verified_at,password_hash FROM users").get(),
    ).toMatchObject({
      email_verified_at: expect.any(String),
      password_hash: "oldhash",
    });
    await expect(
      call("/api/auth/email/consume", { token, purpose: "verify" }),
    ).rejects.toMatchObject({ code: "INVALID_LINK" });
    db.exec("DELETE FROM account_email_tokens");
    await seed("verify", token, true);
    await expect(
      call("/api/auth/email/consume", { token, purpose: "verify" }),
    ).rejects.toMatchObject({ code: "INVALID_LINK" });
  });
  it("reset atomically changes the password, revokes sessions and rotates recovery codes", async () => {
    db.prepare(
      "INSERT INTO sessions(id,user_id,token_hash,created_at,expires_at) VALUES('s','owner','session',?,?)",
    ).run(now, "2099-01-01");
    db.prepare(
      "INSERT INTO recovery_codes(id,user_id,code_hash,created_at) VALUES('r','owner','old-code',?)",
    ).run(now);
    const token = await seed("reset");
    await seed("verify", "b".repeat(43));
    const response = await call("/api/auth/email/consume", {
      token,
      purpose: "reset",
      password: "new-long-password",
    });
    const result = await response.json();
    expect(result.recoveryCode).toHaveLength(32);
    expect(
      db.prepare("SELECT password_hash FROM users").get()?.password_hash,
    ).not.toBe("oldhash");
    expect(
      db.prepare("SELECT revoked_at FROM sessions").get()?.revoked_at,
    ).toBeTruthy();
    expect(
      db
        .prepare("SELECT code_hash FROM recovery_codes WHERE used_at IS NULL")
        .get()?.code_hash,
    ).toBe(await sha256(result.recoveryCode));
    expect(
      db.prepare("SELECT count(*) AS n FROM account_email_tokens").get()?.n,
    ).toBe(1);
    await expect(
      call("/api/auth/email/consume", {
        token,
        purpose: "reset",
        password: "another-password",
      }),
    ).rejects.toMatchObject({ code: "INVALID_LINK" });
  });
  it("unknown, unverified, verified and failed delivery all return the same reset response", async () => {
    const responses = [];
    for (const email of ["unknown@example.invalid", user.email])
      responses.push(
        await (await call("/api/auth/email/reset/request", { email })).json(),
      );
    expect(sendAccountMail).not.toHaveBeenCalled();
    db.prepare("UPDATE users SET email_verified_at=?").run(now);
    vi.mocked(sendAccountMail).mockRejectedValue(new Error("provider failure"));
    responses.push(
      await (
        await call("/api/auth/email/reset/request", { email: user.email })
      ).json(),
    );
    expect(responses[0]).toEqual(responses[1]);
    expect(responses[1]).toEqual(responses[2]);
    expect(verifyAccountChallenge).toHaveBeenCalledTimes(3);
  });
  it("global cap is enforced atomically before generating another email", async () => {
    db.prepare(
      "INSERT INTO account_mail_quota(day,attempts) VALUES(?,100)",
    ).run(now.slice(0, 10));
    await expect(call("/api/auth/email/verify/request")).rejects.toMatchObject({
      status: 429,
    });
    expect(sendAccountMail).not.toHaveBeenCalled();
  });
});
