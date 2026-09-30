import type { D1Database } from "../types";
import type {
  RecordPage,
  SavedProject,
  SavedInterviewSession,
  SavedInterviewAnswer,
} from "../../src/domain/learningRecords";

export const PROJECT_RECORDS_SQL = `SELECT p.project_id AS id, p.updated_at AS updatedAt,
  (SELECT json_group_array(t.task_id) FROM project_tasks t WHERE t.user_id=p.user_id AND t.project_id=p.project_id) AS tasksJson
  FROM user_projects p WHERE p.user_id=?1 AND p.project_id>?2 ORDER BY p.project_id LIMIT 51`;
export const INTERVIEW_SESSIONS_SQL = `SELECT id,answer_count AS answerCount,average_score AS averageScore,first_answer_at AS firstAnswerAt,last_answer_at AS lastAnswerAt,legacy
  FROM interview_sessions WHERE user_id=?1 AND id>?2 ORDER BY id LIMIT 51`;
export const INTERVIEW_ANSWERS_SQL = `SELECT id,question,answer,score,created_at AS createdAt FROM interview_results
  WHERE user_id=?1 AND (CASE WHEN json_type(record_json,'$.sessionId')='text' AND length(json_extract(record_json,'$.sessionId')) BETWEEN 1 AND 100
  THEN json_extract(record_json,'$.sessionId') ELSE 'legacy:' || id END)=?2 AND id>?3 ORDER BY id LIMIT 51`;

function page<T extends { id: string }>(rows: T[]): RecordPage<T> {
  return {
    records: rows.slice(0, 50),
    next: rows.length > 50 ? rows[49].id : null,
  };
}
export class LearningRecordsRepository {
  private readonly db: D1Database;
  private readonly userId: string;
  constructor(db: D1Database, userId: string) {
    this.db = db;
    this.userId = userId;
  }
  async projects(after: string): Promise<RecordPage<SavedProject>> {
    const result = await this.db
      .prepare(PROJECT_RECORDS_SQL)
      .bind(this.userId, after)
      .run<{ id: string; updatedAt: string; tasksJson: string }>();
    return page(
      (result.results ?? []).map(({ tasksJson, ...project }) => ({
        ...project,
        completedTaskIds: JSON.parse(tasksJson) as string[],
      })),
    );
  }
  async interviews(after: string): Promise<RecordPage<SavedInterviewSession>> {
    const result = await this.db
      .prepare(INTERVIEW_SESSIONS_SQL)
      .bind(this.userId, after)
      .run<SavedInterviewSession>();
    return page(result.results ?? []);
  }
  async answers(
    sessionId: string,
    after: string,
  ): Promise<RecordPage<SavedInterviewAnswer>> {
    const result = await this.db
      .prepare(INTERVIEW_ANSWERS_SQL)
      .bind(this.userId, sessionId, after)
      .run<SavedInterviewAnswer>();
    return page(result.results ?? []);
  }
}
