import test from "node:test";
import assert from "node:assert/strict";
import { HttpError, assertSameOrigin, readJsonObject } from "../worker/http.ts";
import {
  hashPassword,
  sessionCookie,
  verifyPassword,
} from "../worker/security.ts";

test("JSON boundary accepts objects and rejects invalid or oversized input", async () => {
  const valid = await readJsonObject(
    new Request("https://forge.example/api", {
      method: "POST",
      body: JSON.stringify({ lesson: "http" }),
    }),
  );
  assert.deepEqual(valid, { lesson: "http" });

  await assert.rejects(
    () =>
      readJsonObject(
        new Request("https://forge.example/api", {
          method: "POST",
          body: "[]",
        }),
      ),
    (error) => error instanceof HttpError && error.code === "INVALID_JSON",
  );

  await assert.rejects(
    () =>
      readJsonObject(
        new Request("https://forge.example/api", {
          method: "POST",
          headers: { "content-length": "100" },
          body: "{}",
        }),
        10,
      ),
    (error) => error instanceof HttpError && error.status === 413,
  );
});

test("same-origin mutation guard rejects a foreign origin", () => {
  assert.doesNotThrow(() =>
    assertSameOrigin(
      new Request("https://forge.example/api", {
        headers: { origin: "https://forge.example" },
      }),
    ),
  );
  assert.throws(
    () =>
      assertSameOrigin(
        new Request("https://forge.example/api", {
          headers: { origin: "https://attacker.example" },
        }),
      ),
    (error) => error instanceof HttpError && error.code === "ORIGIN_REJECTED",
  );
});

test("password records verify without storing plaintext", async () => {
  const record = await hashPassword("a-long-test-password");
  assert.notEqual(record.hash, "a-long-test-password");
  assert.equal(
    await verifyPassword("a-long-test-password", record.salt, record.hash),
    true,
  );
  assert.equal(
    await verifyPassword("wrong-password", record.salt, record.hash),
    false,
  );
});

test("production session cookie is host-scoped, secure, and inaccessible to JavaScript", () => {
  const cookie = sessionCookie(
    new Request("https://forge.example/api/auth/login"),
    "token",
  );
  assert.match(cookie, /^__Host-forge_session=/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /Path=\//);
});
