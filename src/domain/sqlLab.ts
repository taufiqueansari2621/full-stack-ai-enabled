export type SqlLabLesson = {
  id: string;
  title: string;
  query: string;
  challenge: string;
  explanation: string;
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
    challenge: "Return only learner names and scores.",
    explanation:
      "SELECT chooses output columns and FROM chooses the source table.",
  },
  {
    id: "where",
    title: "WHERE",
    query: "SELECT name, score FROM learners WHERE score >= 85;",
    challenge: "Return learners scoring at least 85.",
    explanation: "WHERE filters rows before the selected columns are returned.",
  },
  {
    id: "join",
    title: "JOIN",
    query:
      "SELECT learners.name, courses.title FROM enrollments JOIN learners ON learners.id = enrollments.learner_id JOIN courses ON courses.id = enrollments.course_id;",
    challenge: "Combine enrollments with learner and course names.",
    explanation:
      "JOIN connects rows through matching primary and foreign keys.",
  },
  {
    id: "group-by",
    title: "GROUP BY",
    query:
      "SELECT course_id, COUNT(*) AS learners FROM enrollments GROUP BY course_id;",
    challenge: "Count enrollments for each course.",
    explanation:
      "GROUP BY forms one group per key so aggregate functions can summarize rows.",
  },
  {
    id: "subquery",
    title: "Subqueries",
    query:
      "SELECT name FROM learners WHERE id IN (SELECT learner_id FROM enrollments WHERE completed = 1);",
    challenge: "Find learners with at least one completed enrollment.",
    explanation:
      "The inner query creates a set of IDs used by the outer filter.",
  },
  {
    id: "cte",
    title: "CTEs",
    query:
      "WITH strong AS (SELECT * FROM learners WHERE score >= 85) SELECT name FROM strong;",
    challenge: "Name a filtered result and query it clearly.",
    explanation:
      "A CTE gives an intermediate query a name for readability and reuse.",
  },
  {
    id: "window",
    title: "Window functions",
    query:
      "SELECT name, score, RANK() OVER (ORDER BY score DESC) AS rank FROM learners;",
    challenge: "Rank learners without collapsing individual rows.",
    explanation:
      "A window function calculates across related rows while preserving each row.",
  },
  {
    id: "indexes",
    title: "Indexes",
    query:
      "CREATE INDEX idx_learners_score ON learners(score); SELECT name FROM learners WHERE score >= 85;",
    challenge:
      "Create an index supporting score filters and explain its write cost.",
    explanation:
      "An index adds a searchable structure that can reduce reads while increasing storage and write work.",
  },
  {
    id: "transactions",
    title: "Transactions",
    query:
      "BEGIN; UPDATE enrollments SET completed = 1 WHERE learner_id = 2; COMMIT; SELECT * FROM enrollments;",
    challenge: "Make one enrollment update atomic.",
    explanation:
      "A transaction commits the complete unit or rolls it back so partial state is not exposed.",
  },
  {
    id: "optimization",
    title: "Query optimization",
    query:
      "EXPLAIN QUERY PLAN SELECT name FROM learners WHERE score >= 85 ORDER BY score DESC;",
    challenge:
      "Inspect the plan, then identify an index that can reduce scan and sort work.",
    explanation:
      "Optimization compares equivalent plans using row estimates, indexes, joins, sorts, and measured execution.",
  },
];
