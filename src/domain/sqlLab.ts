export type SqlLabLesson = {
  id: string;
  title: string;
  query: string;
  requiredTokens: string[];
  challenge: string;
  explanation: string;
  plan: string;
  columns: string[];
  rows: string[][];
};

export const sqlSchema = [
  "learners(id INTEGER PRIMARY KEY, name TEXT, score INTEGER)",
  "courses(id INTEGER PRIMARY KEY, title TEXT)",
  "enrollments(learner_id INTEGER, course_id INTEGER, completed INTEGER)",
] as const;

export const sqlLabLessons: SqlLabLesson[] = [
  {
    id: "select",
    title: "SELECT",
    query: "SELECT name, score FROM learners;",
    requiredTokens: ["select", "from learners"],
    challenge: "Return only learner names and scores.",
    explanation: "SELECT chooses output columns and FROM chooses the source table.",
    plan: "SCAN learners → PROJECT name, score",
    columns: ["name", "score"],
    rows: [["Ada", "92"], ["Lin", "78"], ["Grace", "88"]],
  },
  {
    id: "where",
    title: "WHERE",
    query: "SELECT name, score FROM learners WHERE score >= 85;",
    requiredTokens: ["select", "from learners", "where"],
    challenge: "Return learners scoring at least 85.",
    explanation: "WHERE filters rows before the selected columns are returned.",
    plan: "SCAN learners → FILTER score >= 85 → PROJECT",
    columns: ["name", "score"],
    rows: [["Ada", "92"], ["Grace", "88"]],
  },
  {
    id: "join",
    title: "JOIN",
    query: "SELECT learners.name, courses.title FROM enrollments JOIN learners ON learners.id = enrollments.learner_id JOIN courses ON courses.id = enrollments.course_id;",
    requiredTokens: ["join learners", "join courses", " on "],
    challenge: "Combine enrollments with learner and course names.",
    explanation: "JOIN connects rows through matching primary and foreign keys.",
    plan: "SCAN enrollments → LOOKUP learners PK → LOOKUP courses PK",
    columns: ["name", "course"],
    rows: [["Ada", "JavaScript"], ["Lin", "SQL"], ["Grace", "JavaScript"]],
  },
  {
    id: "group-by",
    title: "GROUP BY",
    query: "SELECT course_id, COUNT(*) AS learners FROM enrollments GROUP BY course_id;",
    requiredTokens: ["count(", "group by"],
    challenge: "Count enrollments for each course.",
    explanation: "GROUP BY forms one group per key so aggregate functions can summarize rows.",
    plan: "SCAN enrollments → HASH GROUP course_id → COUNT",
    columns: ["course_id", "learners"],
    rows: [["1", "2"], ["2", "1"]],
  },
  {
    id: "subquery",
    title: "Subqueries",
    query: "SELECT name FROM learners WHERE id IN (SELECT learner_id FROM enrollments WHERE completed = 1);",
    requiredTokens: [" in (select", "where completed"],
    challenge: "Find learners with at least one completed enrollment.",
    explanation: "The inner query creates a set of IDs used by the outer filter.",
    plan: "BUILD enrollment ID set → SCAN learners → FILTER membership",
    columns: ["name"],
    rows: [["Ada"], ["Grace"]],
  },
  {
    id: "cte",
    title: "CTEs",
    query: "WITH strong AS (SELECT * FROM learners WHERE score >= 85) SELECT name FROM strong;",
    requiredTokens: ["with ", " as (select", "from strong"],
    challenge: "Name a filtered result and query it clearly.",
    explanation: "A CTE gives an intermediate query a name for readability and reuse.",
    plan: "MATERIALIZE/INLINE strong → PROJECT name",
    columns: ["name"],
    rows: [["Ada"], ["Grace"]],
  },
  {
    id: "window",
    title: "Window functions",
    query: "SELECT name, score, RANK() OVER (ORDER BY score DESC) AS rank FROM learners;",
    requiredTokens: ["rank()", "over (", "order by"],
    challenge: "Rank learners without collapsing individual rows.",
    explanation: "A window function calculates across related rows while preserving each row.",
    plan: "SCAN learners → SORT score DESC → WINDOW RANK",
    columns: ["name", "score", "rank"],
    rows: [["Ada", "92", "1"], ["Grace", "88", "2"], ["Lin", "78", "3"]],
  },
  {
    id: "indexes",
    title: "Indexes",
    query: "CREATE INDEX idx_learners_score ON learners(score);",
    requiredTokens: ["create index", "on learners", "score"],
    challenge: "Create an index supporting score filters and explain its write cost.",
    explanation: "An index adds a searchable structure that can reduce reads while increasing storage and write work.",
    plan: "BUILD B-tree idx_learners_score(score)",
    columns: ["result"],
    rows: [["Index plan accepted"]],
  },
  {
    id: "transactions",
    title: "Transactions",
    query: "BEGIN; UPDATE enrollments SET completed = 1 WHERE learner_id = 2; COMMIT;",
    requiredTokens: ["begin", "update", "commit"],
    challenge: "Make one enrollment update atomic.",
    explanation: "A transaction commits the complete unit or rolls it back so partial state is not exposed.",
    plan: "BEGIN write transaction → UPDATE 1 row → COMMIT",
    columns: ["affected_rows", "transaction"],
    rows: [["1", "committed"]],
  },
  {
    id: "optimization",
    title: "Query optimization",
    query: "EXPLAIN SELECT name FROM learners WHERE score >= 85 ORDER BY score DESC;",
    requiredTokens: ["explain", "where", "order by"],
    challenge: "Inspect the plan, then identify an index that can reduce scan and sort work.",
    explanation: "Optimization compares equivalent plans using row estimates, indexes, joins, sorts, and measured execution.",
    plan: "SEARCH learners USING idx_learners_score (score>?) → REVERSE INDEX ORDER",
    columns: ["plan"],
    rows: [["Index range scan; no temporary sort"]],
  },
];

export type SqlLabResult = {
  columns: string[];
  rows: string[][];
  explanation: string;
  plan: string;
};

export function runSqlLesson(
  lesson: SqlLabLesson,
  query: string,
): SqlLabResult | { error: string } {
  const normalized = query.trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalized) return { error: "Write a query before running it." };
  const missing = lesson.requiredTokens.find(
    (token) => !normalized.includes(token),
  );
  if (missing)
    return {
      error: `This ${lesson.title} exercise still needs “${missing.trim()}”.`,
    };
  return {
    columns: lesson.columns,
    rows: lesson.rows,
    explanation: lesson.explanation,
    plan: lesson.plan,
  };
}
