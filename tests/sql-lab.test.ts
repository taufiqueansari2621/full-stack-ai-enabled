// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";
import initSqlJs, { type SqlJsStatic } from "sql.js";
import { sqlLabLessons, sqlSchema } from "../src/domain/sqlLab";
import { executeSql } from "../src/services/sqlEngine";

let SQL: SqlJsStatic;
beforeAll(async () => {
  SQL = await initSqlJs();
});
describe("real SQLite lab", () => {
  it("executes all ten authored topics", () => {
    expect(sqlLabLessons).toHaveLength(10);
    expect(sqlSchema).toHaveLength(3);
    for (const lesson of sqlLabLessons) {
      const result = executeSql(SQL, lesson.query);
      expect(result.tables.length).toBeGreaterThan(0);
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    }
  });
  it("depends on the learner query, not keywords", () => {
    expect(
      executeSql(SQL, "SELECT name FROM learners WHERE score > 90").tables[0]
        .rows,
    ).toEqual([["Ada"]]);
    expect(
      executeSql(SQL, "SELECT name FROM learners WHERE score > 100").tables[0]
        .rows,
    ).toEqual([]);
    expect(() => executeSql(SQL, "SELECT wrong FROM learners")).toThrow(
      /wrong/,
    );
  });
  it("commits and rolls back changes within a script, resets between runs", () => {
    for (const [operation, score] of [
      ["COMMIT", "1"],
      ["ROLLBACK", "92"],
    ]) {
      expect(
        executeSql(
          SQL,
          `BEGIN; UPDATE learners SET score=1 WHERE id=1; ${operation}; SELECT score FROM learners WHERE id=1;`,
        ).tables[0].rows,
      ).toEqual([[score]]);
    }
    expect(
      executeSql(SQL, "SELECT score FROM learners WHERE id=1").tables[0].rows,
    ).toEqual([["92"]]);
  });
  it("reports actual index plans", () => {
    expect(
      executeSql(SQL, "SELECT * FROM learners WHERE score=92").plan,
    ).toContain("SCAN learners");
    expect(
      executeSql(
        SQL,
        "CREATE INDEX scores ON learners(score); SELECT * FROM learners WHERE score=92",
      ).plan,
    ).toContain("USING INDEX scores");
  });
  it("bounds output, statements, input, and privileged operations", () => {
    const result = executeSql(
      SQL,
      "WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<1000) SELECT x FROM n",
    );
    expect(result.tables[0].rows).toHaveLength(200);
    expect(result.tables[0].truncated).toBe(true);
    expect(() => executeSql(SQL, "SELECT 1;".repeat(21))).toThrow(
      /20 statements/,
    );
    expect(() => executeSql(SQL, " ".repeat(20_001) + "SELECT 1")).toThrow(
      /20,000/,
    );
    expect(() => executeSql(SQL, "PRAGMA hard_heap_limit=0")).toThrow(
      /unavailable/,
    );
    expect(() => executeSql(SQL, "ATTACH ':memory:' AS second")).toThrow(
      /unavailable/,
    );
  });
});
