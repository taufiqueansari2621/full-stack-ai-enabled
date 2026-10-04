import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readdir, readFile } from "node:fs/promises";
import {
  SAVE_PROGRESS_SQL,
  SAVE_WORKSPACE_SQL,
} from "../worker/repositories/snapshotSql.ts";
import { validateProgress } from "../worker/progressValidation.ts";

const migrationFiles = (await readdir("migrations"))
  .filter((file) => file.endsWith(".sql"))
  .sort();
const sql = await Promise.all(
  migrationFiles.map((file) => readFile(`migrations/${file}`, "utf8")),
);
const now = "2026-09-27T12:00:00.000Z";
function setup(backfill = false) {
  const db = new DatabaseSync(":memory:");
  const projectionIndex = migrationFiles.findIndex((file) =>
    file.startsWith("0010_"),
  );
  for (const statement of sql.slice(0, projectionIndex)) db.exec(statement);
  for (const id of ["alice", "bob"])
    db.prepare(
      "INSERT INTO users(id,email,password_hash,password_salt,created_at,updated_at) VALUES(?, ?, 'hash', 'salt', ?, ?)",
    ).run(id, `${id}@example.com`, now, now);
  if (backfill)
    db.prepare(SAVE_PROGRESS_SQL).get("alice", JSON.stringify(state()), 0, now);
  for (const statement of sql.slice(projectionIndex)) db.exec(statement);
  return db;
}
function state() {
  return {
    version: 1,
    completedLessons: ["l1", "l1"],
    knowledge: [
      {
        id: "same",
        title: "Note",
        body: "My saved explanation",
        topic: "SQL",
        createdAt: now,
      },
    ],
    practiceAttempts: [
      {
        challengeId: "index",
        answer: "compound",
        correct: true,
        attemptedAt: now,
      },
    ],
    reviewSchedule: [
      {
        id: "r1",
        sourceId: "practice:index",
        topic: "SQL",
        nextReviewAt: now,
        streak: 1,
      },
    ],
    projectTasks: { p05: ["task-1", "task-1"] },
    interviewResults: [
      {
        id: "i1",
        question: "Why?",
        answer: "Because",
        score: 80,
        createdAt: now,
      },
    ],
    quizResults: [
      {
        id: "q1",
        quizId: "foundation-assessment",
        score: 90,
        completedAt: now,
      },
    ],
    masteryArtifacts: [
      {
        id: "m1",
        lessonId: "l1",
        level: "guided",
        response: "Evidence",
        updatedAt: now,
      },
    ],
  };
}
test("migration backfills existing evidence without changing snapshot or revision", () => {
  const db = setup(true);
  try {
    assert.equal(db.prepare("SELECT count(*) AS n FROM notes").get().n, 1);
    assert.equal(
      db.prepare("SELECT count(*) AS n FROM topic_progress").get().n,
      1,
    );
    assert.equal(
      db.prepare("SELECT count(*) AS n FROM project_tasks").get().n,
      1,
    );
    assert.equal(
      db.prepare("SELECT revision FROM progress_snapshots").get().revision,
      1,
    );
    assert.deepEqual(
      JSON.parse(
        db.prepare("SELECT state_json AS data FROM progress_snapshots").get()
          .data,
      ),
      state(),
    );
  } finally {
    db.close();
  }
});
test("snapshots project domain rows atomically and isolate matching client IDs between owners", () => {
  const db = setup();
  try {
    for (const id of ["alice", "bob"])
      db.prepare(SAVE_PROGRESS_SQL).get(id, JSON.stringify(state()), 0, now);
    assert.equal(
      db.prepare("SELECT count(*) AS n FROM notes WHERE id='same'").get().n,
      2,
    );
    const newer = state();
    newer.knowledge[0].body = "Updated explanation";
    db.prepare(SAVE_PROGRESS_SQL).get("alice", JSON.stringify(newer), 1, now);
    assert.equal(
      db.prepare("SELECT body FROM notes WHERE user_id='alice'").get().body,
      "Updated explanation",
    );
    assert.equal(
      db.prepare("SELECT body FROM notes WHERE user_id='bob'").get().body,
      "My saved explanation",
    );
    assert.equal(
      db
        .prepare(SAVE_PROGRESS_SQL)
        .get("alice", JSON.stringify(state()), 1, now),
      undefined,
    );
    assert.equal(
      db.prepare("SELECT body FROM notes WHERE user_id='alice'").get().body,
      "Updated explanation",
    );
    db.prepare(SAVE_PROGRESS_SQL).get(
      "alice",
      JSON.stringify({ version: 1 }),
      2,
      now,
    );
    for (const table of [
      "notes",
      "practice_attempts",
      "review_items",
      "project_tasks",
      "topic_progress",
      "interview_results",
      "quiz_attempts",
      "mastery_artifacts",
    ]) {
      assert.equal(
        db
          .prepare(`SELECT count(*) AS n FROM ${table} WHERE user_id='alice'`)
          .get().n,
        0,
      );
      assert.equal(
        db
          .prepare(`SELECT count(*) AS n FROM ${table} WHERE user_id='bob'`)
          .get().n,
        1,
      );
    }
    db.exec("DELETE FROM progress_snapshots WHERE user_id='bob'");
    assert.equal(db.prepare("SELECT count(*) AS n FROM notes").get().n, 0);
    db.prepare(SAVE_PROGRESS_SQL).get("bob", JSON.stringify(state()), 0, now);
    db.exec("DELETE FROM users WHERE id='bob'");
    assert.equal(db.prepare("SELECT count(*) AS n FROM notes").get().n, 0);
  } finally {
    db.close();
  }
});
test("workspace compare-and-swap rejects stale first saves and stale updates", () => {
  const db = setup();
  try {
    const write = db.prepare(SAVE_WORKSPACE_SQL);
    assert.equal(write.get("alice", "{}", "a.js", 7, now), undefined);
    assert.equal(
      write.get("alice", '{"a.js":"first"}', "a.js", 0, now).revision,
      1,
    );
    assert.equal(
      write.get("alice", '{"a.js":"stale"}', "a.js", 0, now),
      undefined,
    );
    assert.equal(
      write.get("alice", '{"a.js":"second"}', "a.js", 1, now).revision,
      2,
    );
    assert.equal(
      write.get("alice", '{"a.js":"stale"}', "a.js", 1, now),
      undefined,
    );
    assert.equal(
      db.prepare("SELECT files_json FROM workspaces").get().files_json,
      '{"a.js":"second"}',
    );
  } finally {
    db.close();
  }
});
test("progress validation rejects corrupted collections and duplicate IDs before persistence", () => {
  assert.equal(validateProgress(state()), null);
  assert.equal(validateProgress({ version: 1 }), null);
  for (const corrupt of [
    { ...state(), knowledge: "bad" },
    { ...state(), knowledge: [state().knowledge[0], state().knowledge[0]] },
    { ...state(), practiceAttempts: [{ correct: "true" }] },
    { ...state(), projectTasks: { p05: {} } },
  ])
    assert.ok(validateProgress(corrupt));
});
