-- Additive query repositories; version-1 snapshots remain the write contract.
CREATE TABLE user_projects (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(user_id, project_id)
);
CREATE TABLE interview_sessions (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  answer_count INTEGER NOT NULL CHECK(answer_count > 0),
  average_score REAL NOT NULL CHECK(average_score BETWEEN 0 AND 100),
  first_answer_at TEXT NOT NULL,
  last_answer_at TEXT NOT NULL,
  legacy INTEGER NOT NULL CHECK(legacy IN (0,1)),
  PRIMARY KEY(user_id, id)
);
CREATE INDEX interview_sessions_owner_time ON interview_sessions(user_id, last_answer_at DESC);
CREATE INDEX interview_results_session ON interview_results(user_id,
  CASE WHEN json_type(record_json,'$.sessionId') = 'text' AND length(json_extract(record_json,'$.sessionId')) BETWEEN 1 AND 100
    THEN json_extract(record_json,'$.sessionId') ELSE 'legacy:' || id END, id);

INSERT INTO user_projects(user_id, project_id, updated_at)
SELECT s.user_id, p.key, s.updated_at FROM progress_snapshots s, json_each(s.state_json,'$.projectTasks') p WHERE p.type = 'array';

INSERT INTO interview_sessions(user_id,id,answer_count,average_score,first_answer_at,last_answer_at,legacy)
SELECT user_id,
  CASE WHEN json_type(record_json,'$.sessionId') = 'text' AND length(json_extract(record_json,'$.sessionId')) BETWEEN 1 AND 100
    THEN json_extract(record_json,'$.sessionId') ELSE 'legacy:' || id END AS session_id,
  count(*), avg(score), min(created_at), max(created_at),
  min(CASE WHEN json_type(record_json,'$.sessionId') = 'text' AND length(json_extract(record_json,'$.sessionId')) BETWEEN 1 AND 100 THEN 0 ELSE 1 END)
FROM interview_results GROUP BY user_id, session_id;

CREATE TRIGGER sync_project_interview_insert AFTER INSERT ON progress_snapshots BEGIN
  INSERT INTO user_projects(user_id,project_id,updated_at)
  SELECT NEW.user_id,p.key,NEW.updated_at FROM json_each(NEW.state_json,'$.projectTasks') p WHERE p.type='array';
  INSERT INTO interview_sessions(user_id,id,answer_count,average_score,first_answer_at,last_answer_at,legacy)
  SELECT NEW.user_id,
    CASE WHEN json_type(j.value,'$.sessionId') = 'text' AND length(json_extract(j.value,'$.sessionId')) BETWEEN 1 AND 100
      THEN json_extract(j.value,'$.sessionId') ELSE 'legacy:' || json_extract(j.value,'$.id') END AS session_id,
    count(*), avg(min(100,max(0,coalesce(json_extract(j.value,'$.score'),0)))),
    min(coalesce(json_extract(j.value,'$.createdAt'),NEW.updated_at)), max(coalesce(json_extract(j.value,'$.createdAt'),NEW.updated_at)),
    min(CASE WHEN json_type(j.value,'$.sessionId') = 'text' AND length(json_extract(j.value,'$.sessionId')) BETWEEN 1 AND 100 THEN 0 ELSE 1 END)
  FROM json_each(NEW.state_json,'$.interviewResults') j WHERE j.type='object' AND json_type(j.value,'$.id')='text' GROUP BY session_id;
END;

CREATE TRIGGER sync_project_records_update AFTER UPDATE ON progress_snapshots
WHEN json_extract(OLD.state_json,'$.projectTasks') IS NOT json_extract(NEW.state_json,'$.projectTasks') BEGIN
  DELETE FROM user_projects WHERE user_id=NEW.user_id;
  INSERT INTO user_projects(user_id,project_id,updated_at)
  SELECT NEW.user_id,p.key,NEW.updated_at FROM json_each(NEW.state_json,'$.projectTasks') p WHERE p.type='array';
END;

CREATE TRIGGER sync_interview_sessions_update AFTER UPDATE ON progress_snapshots
WHEN json_extract(OLD.state_json,'$.interviewResults') IS NOT json_extract(NEW.state_json,'$.interviewResults') BEGIN
  DELETE FROM interview_sessions WHERE user_id=NEW.user_id;
  INSERT INTO interview_sessions(user_id,id,answer_count,average_score,first_answer_at,last_answer_at,legacy)
  SELECT NEW.user_id,
    CASE WHEN json_type(j.value,'$.sessionId') = 'text' AND length(json_extract(j.value,'$.sessionId')) BETWEEN 1 AND 100
      THEN json_extract(j.value,'$.sessionId') ELSE 'legacy:' || json_extract(j.value,'$.id') END AS session_id,
    count(*), avg(min(100,max(0,coalesce(json_extract(j.value,'$.score'),0)))),
    min(coalesce(json_extract(j.value,'$.createdAt'),NEW.updated_at)), max(coalesce(json_extract(j.value,'$.createdAt'),NEW.updated_at)),
    min(CASE WHEN json_type(j.value,'$.sessionId') = 'text' AND length(json_extract(j.value,'$.sessionId')) BETWEEN 1 AND 100 THEN 0 ELSE 1 END)
  FROM json_each(NEW.state_json,'$.interviewResults') j WHERE j.type='object' AND json_type(j.value,'$.id')='text' GROUP BY session_id;
END;

CREATE TRIGGER sync_project_interview_delete AFTER DELETE ON progress_snapshots BEGIN
  DELETE FROM user_projects WHERE user_id=OLD.user_id;
  DELETE FROM interview_sessions WHERE user_id=OLD.user_id;
END;
