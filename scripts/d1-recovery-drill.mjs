import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import {
  FORGE_ACCOUNT,
  parseWranglerJson,
  RECOVERY_SNAPSHOT,
  validateRecoveryTarget,
} from "./lib/recovery-target.mjs";

const [name, id, schemaOption] = process.argv.slice(2);
assert.ok(
  schemaOption === undefined || schemaOption === "--preloaded-empty-schema",
  "Unknown option",
);
const account = process.env.CLOUDFLARE_ACCOUNT_ID ?? FORGE_ACCOUNT;
const operatorConfig = JSON.parse(
  readFileSync("scripts/recovery-wrangler.json", "utf8"),
);
assert.equal(operatorConfig.account_id, FORGE_ACCOUNT);
assert.equal(
  operatorConfig.d1_databases,
  undefined,
  "Operator config must not resolve application bindings",
);
// Reject unsafe targets before any network operation.
validateRecoveryTarget(name, id, [{ name, uuid: id }], account);
const cli = (...args) => {
  try {
    const output = execFileSync(
      process.execPath,
      [
        "node_modules/wrangler/bin/wrangler.js",
        "d1",
        ...args,
        "--config",
        "scripts/recovery-wrangler.json",
        "--json",
      ],
      {
        encoding: "utf8",
        timeout: 60_000,
        maxBuffer: 4_000_000,
        env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: account },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    return parseWranglerJson(output);
  } catch {
    throw new Error(
      `Wrangler ${args.slice(0, 2).join(" ")} failed; drill stopped. No automatic retry or cleanup.`,
    );
  }
};
validateRecoveryTarget(name, id, cli("list"), account);
const query = (sql) => {
  const responses = cli("execute", id, "--remote", "--command", sql);
  assert.ok(
    Array.isArray(responses) &&
      responses.every((response) => response.success === true),
    "D1 query must succeed",
  );
  return responses;
};
const scalar = (sql) => query(sql)[0].results[0];
const empty = scalar(
  "SELECT count(*) AS count FROM sqlite_schema WHERE type='table' AND name NOT GLOB '_cf*' AND name NOT GLOB 'sqlite_*'",
);
const migrations = readdirSync("migrations")
  .filter((file) => /^\d{4}.*\.sql$/.test(file))
  .sort();
if (schemaOption === "--preloaded-empty-schema") {
  const expected = new DatabaseSync(":memory:");
  for (const file of migrations)
    expected.exec(readFileSync(`migrations/${file}`, "utf8"));
  const schemaQuery =
    "SELECT name,type FROM sqlite_schema WHERE name NOT GLOB '_cf*' AND name NOT GLOB 'sqlite_*' ORDER BY type,name";
  assert.deepEqual(
    query(schemaQuery)[0].results,
    expected
      .prepare(schemaQuery)
      .all()
      .map((row) => ({ ...row })),
    "Preloaded schema must match current migration objects",
  );
  const tables = expected
    .prepare(
      "SELECT name FROM sqlite_schema WHERE type='table' AND name NOT GLOB 'sqlite_*'",
    )
    .all();
  assert.ok(tables.every((table) => /^[a-z_]+$/.test(table.name)));
  const tableCounts = scalar(
    "SELECT " +
      tables
        .map((table) => `(SELECT count(*) FROM ${table.name}) AS ${table.name}`)
        .join(","),
  );
  assert.equal(Object.keys(tableCounts).length, tables.length);
  assert.ok(
    Object.values(tableCounts).every((count) => count === 0),
    "Every preloaded table must be empty",
  );
  expected.close();
  console.log(
    "Verified preloaded migration schema and zero records in every table",
  );
} else {
  assert.equal(
    empty.count,
    0,
    "Drill requires a fresh empty database; never automatically reset an existing database",
  );
  for (const file of migrations) {
    cli("execute", id, "--remote", "--yes", "--file", `migrations/${file}`);
    console.log(`Applied synthetic drill schema: ${file}`);
  }
}
const snapshot = JSON.stringify(RECOVERY_SNAPSHOT);
const quote = (value) => `'${value.replaceAll("'", "''")}'`;
query(`INSERT INTO users(id,email,password_hash,password_salt,created_at,updated_at) VALUES ('drill-user','recovery-fixture@example.invalid','not-an-authenticating-hash','synthetic','2026-10-04','2026-10-04');
INSERT INTO profiles(user_id,full_name,username,created_at,updated_at) VALUES ('drill-user','Recovery Fixture','recovery_fixture','2026-10-04','2026-10-04');
INSERT INTO progress_snapshots(user_id,state_json,revision,updated_at) VALUES ('drill-user',${quote(snapshot)},1,'2026-10-04');
INSERT INTO workspaces(user_id,files_json,active_path,revision,updated_at) VALUES ('drill-user','[{"path":"index.js","content":"fixture"}]','index.js',1,'2026-10-04');`);
const counts = () =>
  scalar(
    "SELECT (SELECT count(*) FROM users) AS users, (SELECT count(*) FROM profiles) AS profiles, (SELECT count(*) FROM notes) AS notes, (SELECT count(*) FROM topic_progress) AS topics, (SELECT count(*) FROM workspaces) AS workspaces, (SELECT count(*) FROM sqlite_schema WHERE type='trigger') AS triggers",
  );
const baseline = counts();
assert.deepEqual(
  { ...baseline, triggers: undefined },
  {
    users: 1,
    profiles: 1,
    notes: 1,
    topics: 1,
    workspaces: 1,
    triggers: undefined,
  },
);
assert.ok(baseline.triggers >= 3);
const bookmark = cli("time-travel", "info", id).bookmark;
assert.ok(
  typeof bookmark === "string" && bookmark.length > 10,
  "Missing managed recovery bookmark",
);
query("DELETE FROM users WHERE id='drill-user'");
assert.equal(counts().users, 0);
validateRecoveryTarget(name, id, cli("list"), account);
console.log(`Restoring ONLY synthetic drill database ${name} (${id})`);
const started = Date.now();
const restored = cli("time-travel", "restore", id, "--bookmark", bookmark);
assert.ok(restored.bookmark, "Provider must confirm restore");
assert.deepEqual(
  counts(),
  baseline,
  "Original records and projections must return",
);
assert.equal(
  scalar("SELECT body FROM notes WHERE id='drill-note'").body,
  "Synthetic baseline",
);
assert.equal(query("PRAGMA foreign_key_check")[0].results.length, 0);
assert.equal(scalar("PRAGMA quick_check").quick_check, "ok");
query(
  "UPDATE progress_snapshots SET revision=2, state_json=json_set(state_json,'$.knowledge[0].body','Synthetic post-restore write') WHERE user_id='drill-user'",
);
assert.equal(
  scalar("SELECT body FROM notes WHERE id='drill-note'").body,
  "Synthetic post-restore write",
  "Projection triggers must work after restore",
);
console.log(
  JSON.stringify({
    ok: true,
    database: name,
    databaseId: id,
    account,
    migrations: migrations.length,
    baseline,
    bookmark,
    restoredBookmark: restored.bookmark,
    previousBookmark: restored.previous_bookmark,
    elapsedMs: Date.now() - started,
    productionTouched: false,
    privateExport: false,
    retainedUnboundScratchDatabase: true,
  }),
);
