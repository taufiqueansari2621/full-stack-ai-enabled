// @vitest-environment node
import { DatabaseSync } from "node:sqlite";
import { afterEach, describe, expect, it } from "vitest";
import { sessionRoutes } from "../worker/routes/sessions";
import { sha256 } from "../worker/security";
import type { D1PreparedStatement, Env } from "../worker/types";

const databases: DatabaseSync[] = [];
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});
async function setup() {
  const db = new DatabaseSync(":memory:");
  databases.push(db);
  db.exec(
    "CREATE TABLE sessions(id TEXT PRIMARY KEY, user_id TEXT, token_hash TEXT, created_at TEXT, expires_at TEXT, revoked_at TEXT)",
  );
  const hash = await sha256("current-token");
  const add = (
    id: string,
    owner = "alice",
    expiry = "2099-01-01",
    revoked: string | null = null,
  ) =>
    db
      .prepare("INSERT INTO sessions VALUES(?,?,?,?,?,?)")
      .run(
        id,
        owner,
        id === "current" ? hash : `hash-${id}`,
        "2026-01-01",
        expiry,
        revoked,
      );
  add("current");
  add("other");
  add("foreign", "bob");
  add("expired", "alice", "2020-01-01");
  add("revoked", "alice", "2099-01-01", "2026-01-01");
  const env: Env = {
    DB: {
      prepare(sql) {
        let values: unknown[] = [];
        const statement: D1PreparedStatement = {
          bind(...input) {
            values = input;
            return statement;
          },
          async first<T>() {
            return (db.prepare(sql).get(...values) as T) ?? null;
          },
          async run<T>() {
            return {
              success: true,
              results: db.prepare(sql).all(...values) as T[],
            };
          },
        };
        return statement;
      },
    },
    ASSETS: { fetch: async () => new Response() },
    AI: { run: async () => ({}) },
  };
  const context = (body?: unknown, origin = "https://forge.test") => {
    const request = new Request("https://forge.test/api/auth/sessions", {
      method: body ? "POST" : "GET",
      headers: {
        cookie: "__Host-forge_session=current-token",
        origin,
        "content-type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return {
      env,
      request,
      url: new URL(request.url),
      requestId: "test",
      user: {
        id: "alice",
        email: "alice@test.invalid",
        fullName: "Alice",
        username: "alice",
      },
    };
  };
  return { db, add, context };
}
describe("account sessions", () => {
  it("lists only owned active sessions with no credential material", async () => {
    const { context } = await setup();
    const data = await (await sessionRoutes[0].handler(context())).json();
    expect(data.sessions.map((s: { id: string }) => s.id)).toEqual([
      "current",
      "other",
    ]);
    expect(data.sessions[0].current).toBe(true);
    expect(JSON.stringify(data)).not.toMatch(/token|hash/);
  });
  it("bounds the list and keeps the current session first", async () => {
    const { context, add } = await setup();
    for (let i = 0; i < 60; i++) add(`extra-${i}`);
    const data = await (await sessionRoutes[0].handler(context())).json();
    expect(data.sessions).toHaveLength(50);
    expect(data.truncated).toBe(true);
    expect(data.sessions[0].id).toBe("current");
  });
  it("protects current and foreign sessions during targeted and bulk revocation", async () => {
    const { db, context } = await setup();
    for (const id of ["current", "foreign", "missing"])
      await sessionRoutes[1].handler(context({ scope: "session", id }));
    expect(
      db
        .prepare(
          "SELECT count(*) AS n FROM sessions WHERE revoked_at IS NOT NULL",
        )
        .get()?.n,
    ).toBe(1);
    await sessionRoutes[1].handler(context({ scope: "session", id: "other" }));
    expect(
      db.prepare("SELECT revoked_at FROM sessions WHERE id='other'").get()
        ?.revoked_at,
    ).toBeTruthy();
    await sessionRoutes[1].handler(context({ scope: "others" }));
    for (const id of ["current", "foreign"])
      expect(
        db.prepare("SELECT revoked_at FROM sessions WHERE id=?").get(id)
          ?.revoked_at,
      ).toBeNull();
  });
  it("rejects cross-origin and invalid mutations", async () => {
    const { context } = await setup();
    await expect(
      sessionRoutes[1].handler(
        context({ scope: "others" }, "https://evil.test"),
      ),
    ).rejects.toMatchObject({ status: 403 });
    for (const body of [
      { scope: "all" },
      { scope: "session", id: {} },
      { scope: "session", id: "x' OR 1=1" },
    ])
      await expect(
        sessionRoutes[1].handler(context(body)),
      ).rejects.toMatchObject({ status: 400 });
  });
});
