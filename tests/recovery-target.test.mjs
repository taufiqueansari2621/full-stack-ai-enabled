import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import {
  FORGE_ACCOUNT,
  PRODUCTION_DATABASE,
  parseWranglerJson,
  RECOVERY_SNAPSHOT,
  validateRecoveryTarget,
} from "../scripts/lib/recovery-target.mjs";
const name = "forge-restore-drill-20261004";
const id = "af3efec1-361e-48ee-b4dc-c81574d8be60";
const inventory = [{ name, uuid: id }];
test("recovery fixture projects real notes and topics and supports post-restore writes", () => {
  const db = new DatabaseSync(":memory:");
  try {
    for (const file of readdirSync("migrations").sort())
      db.exec(readFileSync(`migrations/${file}`, "utf8"));
    db.exec(
      "INSERT INTO users VALUES ('drill-user','fixture@example.invalid','synthetic','synthetic','2026-10-04','2026-10-04')",
    );
    db.prepare(
      "INSERT INTO progress_snapshots VALUES (?, ?, 1, '2026-10-04')",
    ).run("drill-user", JSON.stringify(RECOVERY_SNAPSHOT));
    assert.equal(
      db.prepare("SELECT body FROM notes").get().body,
      "Synthetic baseline",
    );
    assert.equal(
      db.prepare("SELECT topic_id FROM topic_progress").get().topic_id,
      "drill-topic",
    );
    db.exec(
      "UPDATE progress_snapshots SET revision=2,state_json=json_set(state_json,'$.knowledge[0].body','Updated fixture')",
    );
    assert.equal(
      db.prepare("SELECT body FROM notes").get().body,
      "Updated fixture",
    );
    assert.equal(db.prepare("PRAGMA quick_check").get().quick_check, "ok");
  } finally {
    db.close();
  }
});
test("recovery config cannot resolve an application binding", () => {
  const config = JSON.parse(
    readFileSync("scripts/recovery-wrangler.json", "utf8"),
  );
  assert.equal(config.account_id, FORGE_ACCOUNT);
  assert.equal(config.d1_databases, undefined);
});
test("Wrangler parser accepts progress-prefixed JSON and rejects truncated results", () => {
  assert.deepEqual(
    parseWranglerJson('Uploading fixture...\n[\n{"success":true}\n]\n'),
    [{ success: true }],
  );
  assert.deepEqual(parseWranglerJson('{"bookmark":"fixture"}'), {
    bookmark: "fixture",
  });
  assert.throws(() => parseWranglerJson('Uploading...\n[{"success":'));
  assert.throws(() => parseWranglerJson('[\n{"success":true}\n'));
  assert.throws(() =>
    parseWranglerJson('[{"success":true}]\nunexpected trailing output'),
  );
});
test("recovery accepts only exact scratch name, ID and Forge account", () => {
  assert.deepEqual(validateRecoveryTarget(name, id, inventory), { name, id });
});
test("recovery refuses production, arbitrary names, IDs and mismatched inventories", () => {
  for (const target of [
    "forge-production",
    "DB",
    "forge-restore-drill",
    "forge-restore-drill-20261004;DROP",
  ])
    assert.throws(() => validateRecoveryTarget(target, id, inventory));
  assert.throws(() =>
    validateRecoveryTarget(name, PRODUCTION_DATABASE, inventory),
  );
  assert.throws(() => validateRecoveryTarget(name, "bad-id", inventory));
  assert.throws(() => validateRecoveryTarget(name, id, []));
  assert.throws(() =>
    validateRecoveryTarget(name, id, [...inventory, ...inventory]),
  );
  assert.throws(() =>
    validateRecoveryTarget(name, id, inventory, `${FORGE_ACCOUNT}-other`),
  );
});
