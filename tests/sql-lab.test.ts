import { describe, expect, it } from "vitest";
import { runSqlLesson, sqlLabLessons, sqlSchema } from "../src/domain/sqlLab";

describe("SQL lab", () => {
  it("covers every SQL topic in the product brief", () => {
    expect(sqlLabLessons.map((lesson) => lesson.title)).toEqual([
      "SELECT",
      "WHERE",
      "JOIN",
      "GROUP BY",
      "Subqueries",
      "CTEs",
      "Window functions",
      "Indexes",
      "Transactions",
      "Query optimization",
    ]);
    expect(sqlSchema).toHaveLength(3);
  });

  it("returns explainable results only when the selected concept is present", () => {
    for (const lesson of sqlLabLessons) {
      const result = runSqlLesson(lesson, lesson.query);
      expect("error" in result).toBe(false);
      if (!("error" in result)) {
        expect(result.columns.length).toBeGreaterThan(0);
        expect(result.rows.length).toBeGreaterThan(0);
        expect(result.explanation.length).toBeGreaterThan(30);
        expect(result.plan.length).toBeGreaterThan(15);
      }
    }
    expect(runSqlLesson(sqlLabLessons[2], "SELECT * FROM learners")).toEqual({
      error: "This JOIN exercise still needs “join learners”.",
    });
  });
});
