import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

test("D1 migrations are ordered and contain release-critical tables", async () => {
  const directory = resolve("migrations");
  const files = (await readdir(directory))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  assert.deepEqual(
    files.map((file) => file.slice(0, 4)),
    ["0001", "0002", "0003", "0004", "0005", "0006", "0007", "0008", "0009"],
  );
  const sql = (
    await Promise.all(
      files.map((file) => readFile(resolve(directory, file), "utf8")),
    )
  ).join("\n");
  for (const table of [
    "users",
    "profiles",
    "sessions",
    "progress_snapshots",
    "auth_rate_limits",
    "recovery_codes",
    "workspaces",
    "ai_conversations",
    "ai_usage",
    "workspace_snapshots",
    "public_portfolios",
    "certificate_credentials",
  ]) {
    assert.match(
      sql,
      new RegExp(`CREATE TABLE(?: IF NOT EXISTS)? ${table}\\b`),
    );
  }
});
