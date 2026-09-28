import type { Database, SqlJsStatic } from "sql.js";

export type SqlTable = {
  columns: string[];
  rows: string[][];
  truncated: boolean;
};
export type SqlExecution = {
  tables: SqlTable[];
  plan: string;
  durationMs: number;
  statements: number;
};

const seed = `
CREATE TABLE learners(id INTEGER PRIMARY KEY, name TEXT, score INTEGER);
CREATE TABLE courses(id INTEGER PRIMARY KEY, title TEXT);
CREATE TABLE enrollments(learner_id INTEGER, course_id INTEGER, completed INTEGER);
INSERT INTO learners VALUES (1,'Ada',92),(2,'Lin',78),(3,'Grace',88);
INSERT INTO courses VALUES (1,'JavaScript'),(2,'SQL');
INSERT INTO enrollments VALUES (1,1,1),(2,2,0),(3,1,1);`;

export function executeSql(SQL: SqlJsStatic, query: string): SqlExecution {
  if (!query.trim()) throw new Error("Write a query before running it.");
  if (query.length > 20_000)
    throw new Error("SQL is limited to 20,000 characters.");
  // Conservative restrictions apply even inside comments/strings. No SQL ever
  // reaches D1 or a host filesystem; these additionally protect runtime limits.
  if (/\b(?:pragma|attach|detach|vacuum|load_extension)\b/i.test(query))
    throw new Error(
      "PRAGMA, ATTACH, DETACH, VACUUM, and extensions are unavailable in this teaching sandbox.",
    );
  const db: Database = new SQL.Database();
  try {
    db.run("PRAGMA hard_heap_limit=33554432; PRAGMA max_page_count=2048;");
    db.run(seed);
    const started = performance.now();
    const tables: SqlTable[] = [];
    const plans: string[] = [];
    let statements = 0;
    let outputSize = 0;
    for (const statement of db.iterateStatements(query)) {
      if (++statements > 20)
        throw new Error("Run at most 20 statements at once.");
      const source = statement
        .getSQL()
        .replace(/^(?:\s|--[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/)+/, "");
      if (/^(select|with)\b/i.test(source)) {
        const plan = db.exec(`EXPLAIN QUERY PLAN ${source}`);
        plans.push(
          ...plan.flatMap((table) =>
            table.values.map((row) => String(row.at(-1))),
          ),
        );
      }
      const columns = statement.getColumnNames();
      const rows: string[][] = [];
      let truncated = false;
      while (statement.step()) {
        if (rows.length >= 200) {
          truncated = true;
          break;
        }
        const row = statement
          .get()
          .map((value) =>
            value === null
              ? "NULL"
              : value instanceof Uint8Array
                ? `[BLOB: ${value.length} bytes]`
                : String(value),
          );
        if (row.some((value) => value.length > 2000)) truncated = true;
        const bounded = row.map((value) =>
          value.length > 2000 ? `${value.slice(0, 2000)}…` : value,
        );
        outputSize += bounded.join("").length;
        if (outputSize > 100_000)
          throw new Error(
            "Result exceeds the 100,000-character output limit. Select fewer rows or columns.",
          );
        rows.push(bounded);
      }
      if (columns.length) tables.push({ columns, rows, truncated });
    }
    if (!statements)
      throw new Error("Write a SQL statement before running it.");
    return {
      tables,
      statements,
      durationMs: performance.now() - started,
      plan:
        plans.join("\n") ||
        "No SELECT plan in this script. Add a SELECT or EXPLAIN QUERY PLAN statement to inspect the result.",
    };
  } finally {
    db.close();
  }
}
