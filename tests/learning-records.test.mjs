import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readdir, readFile } from "node:fs/promises";
import { SAVE_PROGRESS_SQL } from "../worker/repositories/snapshotSql.ts";
import {
  LearningRecordsRepository,
  INTERVIEW_ANSWERS_SQL,
} from "../worker/repositories/learningRecords.ts";

const migrations = await Promise.all(
  (await readdir("migrations"))
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((file) => readFile(`migrations/${file}`, "utf8")),
);
const now = "2026-09-29T09:00:00.000Z";
const answer = (id, sessionId) => ({
  id,
  ...(sessionId ? { sessionId } : {}),
  question: "Why review?",
  answer: "Recall",
  score: 80,
  createdAt: now,
});
function setup() {
  const db = new DatabaseSync(":memory:");
  for (const sql of migrations.slice(0, -1)) db.exec(sql);
  for (const id of ["alice", "bob"])
    db.prepare("INSERT INTO users VALUES(?,?,'hash','salt',?,?)").run(
      id,
      `${id}@test.invalid`,
      now,
      now,
    );
  const state = {
    version: 1,
    projectTasks: { p05: ["m1", "m2"] },
    interviewResults: [
      answer("a", "session-1"),
      answer("b", "session-1"),
      answer("old"),
    ],
  };
  db.prepare(SAVE_PROGRESS_SQL).get("alice", JSON.stringify(state), 0, now);
  db.prepare(SAVE_PROGRESS_SQL).get(
    "bob",
    JSON.stringify({
      version: 1,
      projectTasks: { private: ["secret"] },
      interviewResults: [answer("a", "session-1")],
    }),
    0,
    now,
  );
  db.exec(migrations.at(-1));
  const adapter = {
    prepare(sql) {
      let params = [];
      return {
        bind(...values) {
          params = values;
          return this;
        },
        async run() {
          return { success: true, results: db.prepare(sql).all(...params) };
        },
      };
    },
  };
  return {
    db,
    state,
    repository: new LearningRecordsRepository(adapter, "alice"),
  };
}
test("project/session backfill preserves snapshots and groups only real session identifiers", async () => {
  const { db, state, repository } = setup();
  try {
    const snapshot = db
      .prepare(
        "SELECT state_json, revision,updated_at FROM progress_snapshots WHERE user_id='alice'",
      )
      .get();
    assert.deepEqual(JSON.parse(snapshot.state_json), state);
    assert.equal(snapshot.revision, 1);
    assert.equal(snapshot.updated_at, now);
    const projects = await repository.projects("");
    assert.equal(projects.records.length, 1);
    assert.deepEqual(projects.records[0].completedTaskIds, ["m1", "m2"]);
    const sessions = await repository.interviews("");
    assert.equal(
      sessions.records.find((row) => row.id === "session-1").answerCount,
      2,
    );
    assert.equal(
      sessions.records.find((row) => row.id === "legacy:old").legacy,
      1,
    );
    assert.equal((await repository.answers("session-1", "")).records.length, 2);
    assert.equal((await repository.answers("not-owned", "")).records.length, 0);
    assert.ok(
      db
        .prepare(`EXPLAIN QUERY PLAN ${INTERVIEW_ANSWERS_SQL}`)
        .all("alice", "session-1", "")
        .some((row) => row.detail.includes("interview_results_session")),
    );
  } finally {
    db.close();
  }
});
test("project/session projections follow accepted writes, resets, and owner deletion atomically", () => {
  const { db, state } = setup();
  try {
    const next = {
      ...state,
      projectTasks: { p10: ["new"] },
      interviewResults: [answer("c", "session-2")],
    };
    assert.equal(
      db.prepare(SAVE_PROGRESS_SQL).get("alice", JSON.stringify(next), 1, now)
        .revision,
      2,
    );
    assert.equal(
      db.prepare(SAVE_PROGRESS_SQL).get("alice", JSON.stringify(state), 1, now),
      undefined,
    );
    assert.equal(
      db
        .prepare("SELECT project_id FROM user_projects WHERE user_id='alice'")
        .get().project_id,
      "p10",
    );
    assert.equal(
      db
        .prepare("SELECT id FROM interview_sessions WHERE user_id='alice'")
        .get().id,
      "session-2",
    );
    db.prepare(SAVE_PROGRESS_SQL).get(
      "alice",
      JSON.stringify({ version: 1, projectTasks: {}, interviewResults: [] }),
      2,
      now,
    );
    for (const table of [
      "user_projects",
      "interview_sessions",
      "project_tasks",
      "interview_results",
    ])
      assert.equal(
        db
          .prepare(`SELECT count(*) n FROM ${table} WHERE user_id='alice'`)
          .get().n,
        0,
      );
    assert.equal(
      db
        .prepare("SELECT count(*) n FROM user_projects WHERE user_id='bob'")
        .get().n,
      1,
    );
    db.exec("DELETE FROM users WHERE id='bob'");
    assert.equal(
      db.prepare("SELECT count(*) n FROM interview_sessions").get().n,
      0,
    );
  } finally {
    db.close();
  }
});
test("domain repositories page projects and answers without leaking other owners", async () => {
  const { db, state, repository } = setup();
  try {
    const keys = Array.from({ length: 55 }, (_, index) =>
      String(index).padStart(3, "0"),
    );
    const next = {
      ...state,
      projectTasks: Object.fromEntries(keys.map((key) => [key, ["done"]])),
      interviewResults: keys.map((key) => answer(key, "session-1")),
    };
    db.prepare(SAVE_PROGRESS_SQL).get("alice", JSON.stringify(next), 1, now);
    const first = await repository.projects("");
    assert.equal(first.records.length, 50);
    const second = await repository.projects(first.next);
    assert.equal(second.records.length, 5);
    assert.equal(second.next, null);
    assert.equal(
      new Set([...first.records, ...second.records].map((row) => row.id)).size,
      55,
    );
    const answers = await repository.answers("session-1", "");
    assert.equal(answers.records.length, 50);
    assert.equal(
      (await repository.answers("session-1", answers.next)).records.length,
      5,
    );
  } finally {
    db.close();
  }
});
