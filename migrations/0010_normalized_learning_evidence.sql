-- Domain projections of the versioned sync snapshot. No learner payloads are discarded.
-- Triggers update each changed collection atomically with its owning snapshot.
PRAGMA foreign_keys = ON;

-- Every projection is owned by a user and kept in sync with that user's snapshot.

CREATE TABLE notes (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  topic TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  record_json TEXT NOT NULL CHECK(json_valid(record_json)),
  PRIMARY KEY(user_id,
  id)
);
CREATE INDEX notes_owner_idx ON notes(user_id, updated_at DESC);

CREATE TABLE practice_attempts (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  challenge_id TEXT NOT NULL,
  correct INTEGER NOT NULL CHECK(correct IN(0,1)),
  answer TEXT NOT NULL,
  attempted_at TEXT NOT NULL,
  PRIMARY KEY(user_id,
  position)
);
CREATE INDEX practice_attempts_owner_idx ON practice_attempts(user_id, challenge_id, attempted_at DESC);

CREATE TABLE review_items (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  next_review_at TEXT NOT NULL,
  streak INTEGER NOT NULL CHECK(streak >= 0),
  record_json TEXT NOT NULL CHECK(json_valid(record_json)),
  PRIMARY KEY(user_id,
  id)
);
CREATE INDEX review_items_owner_idx ON review_items(user_id, next_review_at);

CREATE TABLE interview_results (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  score REAL NOT NULL CHECK(score BETWEEN 0 AND 100),
  created_at TEXT NOT NULL,
  record_json TEXT NOT NULL CHECK(json_valid(record_json)),
  PRIMARY KEY(user_id,
  id)
);
CREATE INDEX interview_results_owner_idx ON interview_results(user_id, created_at DESC);

CREATE TABLE quiz_attempts (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  quiz_id TEXT NOT NULL,
  score REAL NOT NULL CHECK(score BETWEEN 0 AND 100),
  completed_at TEXT NOT NULL,
  record_json TEXT NOT NULL CHECK(json_valid(record_json)),
  PRIMARY KEY(user_id,
  id)
);
CREATE INDEX quiz_attempts_owner_idx ON quiz_attempts(user_id, quiz_id);

CREATE TABLE mastery_artifacts (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  level TEXT NOT NULL,
  response TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(user_id,
  id)
);
CREATE INDEX mastery_artifacts_owner_idx ON mastery_artifacts(user_id, lesson_id);

CREATE TABLE topic_progress (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  PRIMARY KEY(user_id,
  topic_id)
);

CREATE TABLE project_tasks (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  PRIMARY KEY(user_id, project_id, task_id)
);

CREATE TRIGGER sync_learning_delete
AFTER DELETE ON progress_snapshots
BEGIN
  DELETE FROM notes WHERE user_id = OLD.user_id;
  DELETE FROM practice_attempts WHERE user_id = OLD.user_id;
  DELETE FROM review_items WHERE user_id = OLD.user_id;
  DELETE FROM interview_results WHERE user_id = OLD.user_id;
  DELETE FROM quiz_attempts WHERE user_id = OLD.user_id;
  DELETE FROM mastery_artifacts WHERE user_id = OLD.user_id;
  DELETE FROM topic_progress WHERE user_id = OLD.user_id;
  DELETE FROM project_tasks WHERE user_id = OLD.user_id;
END;

INSERT OR REPLACE INTO notes(user_id, id, title, body, topic, updated_at, record_json)
  SELECT s.user_id, json_extract(j.value,'$.id'), json_extract(j.value,'$.title'), json_extract(j.value,'$.body'), coalesce(json_extract(j.value,'$.topic'), ''), coalesce(json_extract(j.value,'$.updatedAt'), json_extract(j.value,'$.createdAt'), s.updated_at), j.value
  FROM progress_snapshots AS s, json_each(s.state_json, '$.knowledge') AS j
  WHERE j.type = 'object' AND json_type(j.value,'$.id') = 'text' AND json_type(j.value,'$.title') = 'text' AND json_type(j.value,'$.body') = 'text';

INSERT OR REPLACE INTO practice_attempts(user_id, position, challenge_id, correct, answer, attempted_at)
  SELECT s.user_id, j.key, json_extract(j.value,'$.challengeId'), json_extract(j.value,'$.correct'), coalesce(json_extract(j.value,'$.answer'), ''), coalesce(json_extract(j.value,'$.attemptedAt'), s.updated_at)
  FROM progress_snapshots AS s, json_each(s.state_json, '$.practiceAttempts') AS j
  WHERE j.type = 'object' AND json_type(j.value,'$.challengeId') = 'text' AND json_type(j.value,'$.correct') IN ('true','false');

INSERT OR REPLACE INTO review_items(user_id, id, source_id, topic, next_review_at, streak, record_json)
  SELECT s.user_id, json_extract(j.value,'$.id'), json_extract(j.value,'$.sourceId'), coalesce(json_extract(j.value,'$.topic'), ''), json_extract(j.value,'$.nextReviewAt'), max(0, coalesce(json_extract(j.value,'$.streak'), 0)), j.value
  FROM progress_snapshots AS s, json_each(s.state_json, '$.reviewSchedule') AS j
  WHERE j.type = 'object' AND json_type(j.value,'$.id') = 'text' AND json_type(j.value,'$.sourceId') = 'text' AND json_type(j.value,'$.nextReviewAt') = 'text';

INSERT OR REPLACE INTO interview_results(user_id, id, question, answer, score, created_at, record_json)
  SELECT s.user_id, json_extract(j.value,'$.id'), coalesce(json_extract(j.value,'$.question'), ''), coalesce(json_extract(j.value,'$.answer'), ''), min(100,max(0,coalesce(json_extract(j.value,'$.score'),0))), coalesce(json_extract(j.value,'$.createdAt'),s.updated_at), j.value
  FROM progress_snapshots AS s, json_each(s.state_json, '$.interviewResults') AS j
  WHERE j.type = 'object' AND json_type(j.value,'$.id') = 'text';

INSERT OR REPLACE INTO quiz_attempts(user_id, id, quiz_id, score, completed_at, record_json)
  SELECT s.user_id, json_extract(j.value,'$.id'), json_extract(j.value,'$.quizId'), min(100,max(0,coalesce(json_extract(j.value,'$.score'),0))), coalesce(json_extract(j.value,'$.completedAt'),s.updated_at), j.value
  FROM progress_snapshots AS s, json_each(s.state_json, '$.quizResults') AS j
  WHERE j.type = 'object' AND json_type(j.value,'$.id') = 'text' AND json_type(j.value,'$.quizId') = 'text';

INSERT OR REPLACE INTO mastery_artifacts(user_id, id, lesson_id, level, response, updated_at)
  SELECT s.user_id, json_extract(j.value,'$.id'), json_extract(j.value,'$.lessonId'), coalesce(json_extract(j.value,'$.level'), ''), coalesce(json_extract(j.value,'$.response'), ''), coalesce(json_extract(j.value,'$.updatedAt'),s.updated_at)
  FROM progress_snapshots AS s, json_each(s.state_json, '$.masteryArtifacts') AS j
  WHERE j.type = 'object' AND json_type(j.value,'$.id') = 'text' AND json_type(j.value,'$.lessonId') = 'text';

INSERT OR REPLACE INTO topic_progress(user_id, topic_id)
  SELECT s.user_id, j.value
  FROM progress_snapshots AS s, json_each(s.state_json, '$.completedLessons') AS j
  WHERE j.type = 'text';

INSERT OR IGNORE INTO project_tasks(user_id, project_id, task_id)
  SELECT s.user_id, p.key, t.value FROM progress_snapshots AS s, json_each(s.state_json, '$.projectTasks') AS p, json_each(p.value) AS t
  WHERE p.type = 'array' AND t.type = 'text';

CREATE TRIGGER sync_learning_insert
AFTER INSERT ON progress_snapshots
BEGIN
  DELETE FROM notes WHERE user_id = NEW.user_id;
INSERT OR REPLACE INTO notes(user_id, id, title, body, topic, updated_at, record_json)
  SELECT NEW.user_id, json_extract(j.value,'$.id'), json_extract(j.value,'$.title'), json_extract(j.value,'$.body'), coalesce(json_extract(j.value,'$.topic'), ''), coalesce(json_extract(j.value,'$.updatedAt'), json_extract(j.value,'$.createdAt'), NEW.updated_at), j.value
  FROM json_each(NEW.state_json, '$.knowledge') AS j
  WHERE j.type = 'object' AND json_type(j.value,'$.id') = 'text' AND json_type(j.value,'$.title') = 'text' AND json_type(j.value,'$.body') = 'text';
  DELETE FROM practice_attempts WHERE user_id = NEW.user_id;
INSERT OR REPLACE INTO practice_attempts(user_id, position, challenge_id, correct, answer, attempted_at)
  SELECT NEW.user_id, j.key, json_extract(j.value,'$.challengeId'), json_extract(j.value,'$.correct'), coalesce(json_extract(j.value,'$.answer'), ''), coalesce(json_extract(j.value,'$.attemptedAt'), NEW.updated_at)
  FROM json_each(NEW.state_json, '$.practiceAttempts') AS j
  WHERE j.type = 'object' AND json_type(j.value,'$.challengeId') = 'text' AND json_type(j.value,'$.correct') IN ('true','false');
  DELETE FROM review_items WHERE user_id = NEW.user_id;
INSERT OR REPLACE INTO review_items(user_id, id, source_id, topic, next_review_at, streak, record_json)
  SELECT NEW.user_id, json_extract(j.value,'$.id'), json_extract(j.value,'$.sourceId'), coalesce(json_extract(j.value,'$.topic'), ''), json_extract(j.value,'$.nextReviewAt'), max(0, coalesce(json_extract(j.value,'$.streak'), 0)), j.value
  FROM json_each(NEW.state_json, '$.reviewSchedule') AS j
  WHERE j.type = 'object' AND json_type(j.value,'$.id') = 'text' AND json_type(j.value,'$.sourceId') = 'text' AND json_type(j.value,'$.nextReviewAt') = 'text';
  DELETE FROM interview_results WHERE user_id = NEW.user_id;
INSERT OR REPLACE INTO interview_results(user_id, id, question, answer, score, created_at, record_json)
  SELECT NEW.user_id, json_extract(j.value,'$.id'), coalesce(json_extract(j.value,'$.question'), ''), coalesce(json_extract(j.value,'$.answer'), ''), min(100,max(0,coalesce(json_extract(j.value,'$.score'),0))), coalesce(json_extract(j.value,'$.createdAt'),NEW.updated_at), j.value
  FROM json_each(NEW.state_json, '$.interviewResults') AS j
  WHERE j.type = 'object' AND json_type(j.value,'$.id') = 'text';
  DELETE FROM quiz_attempts WHERE user_id = NEW.user_id;
INSERT OR REPLACE INTO quiz_attempts(user_id, id, quiz_id, score, completed_at, record_json)
  SELECT NEW.user_id, json_extract(j.value,'$.id'), json_extract(j.value,'$.quizId'), min(100,max(0,coalesce(json_extract(j.value,'$.score'),0))), coalesce(json_extract(j.value,'$.completedAt'),NEW.updated_at), j.value
  FROM json_each(NEW.state_json, '$.quizResults') AS j
  WHERE j.type = 'object' AND json_type(j.value,'$.id') = 'text' AND json_type(j.value,'$.quizId') = 'text';
  DELETE FROM mastery_artifacts WHERE user_id = NEW.user_id;
INSERT OR REPLACE INTO mastery_artifacts(user_id, id, lesson_id, level, response, updated_at)
  SELECT NEW.user_id, json_extract(j.value,'$.id'), json_extract(j.value,'$.lessonId'), coalesce(json_extract(j.value,'$.level'), ''), coalesce(json_extract(j.value,'$.response'), ''), coalesce(json_extract(j.value,'$.updatedAt'),NEW.updated_at)
  FROM json_each(NEW.state_json, '$.masteryArtifacts') AS j
  WHERE j.type = 'object' AND json_type(j.value,'$.id') = 'text' AND json_type(j.value,'$.lessonId') = 'text';
  DELETE FROM topic_progress WHERE user_id = NEW.user_id;
INSERT OR REPLACE INTO topic_progress(user_id, topic_id)
  SELECT NEW.user_id, j.value
  FROM json_each(NEW.state_json, '$.completedLessons') AS j
  WHERE j.type = 'text';
  DELETE FROM project_tasks WHERE user_id = NEW.user_id;
INSERT OR IGNORE INTO project_tasks(user_id, project_id, task_id)
  SELECT NEW.user_id, p.key, t.value FROM json_each(NEW.state_json, '$.projectTasks') AS p, json_each(p.value) AS t
  WHERE p.type = 'array' AND t.type = 'text';
END;

CREATE TRIGGER sync_learning_update
AFTER UPDATE ON progress_snapshots
BEGIN
  DELETE FROM notes WHERE user_id = NEW.user_id AND json_extract(OLD.state_json,'$.knowledge') IS NOT json_extract(NEW.state_json,'$.knowledge');
INSERT OR REPLACE INTO notes(user_id, id, title, body, topic, updated_at, record_json)
  SELECT NEW.user_id, json_extract(j.value,'$.id'), json_extract(j.value,'$.title'), json_extract(j.value,'$.body'), coalesce(json_extract(j.value,'$.topic'), ''), coalesce(json_extract(j.value,'$.updatedAt'), json_extract(j.value,'$.createdAt'), NEW.updated_at), j.value
  FROM json_each(NEW.state_json, '$.knowledge') AS j
  WHERE j.type = 'object' AND json_type(j.value,'$.id') = 'text' AND json_type(j.value,'$.title') = 'text' AND json_type(j.value,'$.body') = 'text' AND json_extract(OLD.state_json,'$.knowledge') IS NOT json_extract(NEW.state_json,'$.knowledge');
  DELETE FROM practice_attempts WHERE user_id = NEW.user_id AND json_extract(OLD.state_json,'$.practiceAttempts') IS NOT json_extract(NEW.state_json,'$.practiceAttempts');
INSERT OR REPLACE INTO practice_attempts(user_id, position, challenge_id, correct, answer, attempted_at)
  SELECT NEW.user_id, j.key, json_extract(j.value,'$.challengeId'), json_extract(j.value,'$.correct'), coalesce(json_extract(j.value,'$.answer'), ''), coalesce(json_extract(j.value,'$.attemptedAt'), NEW.updated_at)
  FROM json_each(NEW.state_json, '$.practiceAttempts') AS j
  WHERE j.type = 'object' AND json_type(j.value,'$.challengeId') = 'text' AND json_type(j.value,'$.correct') IN ('true','false') AND json_extract(OLD.state_json,'$.practiceAttempts') IS NOT json_extract(NEW.state_json,'$.practiceAttempts');
  DELETE FROM review_items WHERE user_id = NEW.user_id AND json_extract(OLD.state_json,'$.reviewSchedule') IS NOT json_extract(NEW.state_json,'$.reviewSchedule');
INSERT OR REPLACE INTO review_items(user_id, id, source_id, topic, next_review_at, streak, record_json)
  SELECT NEW.user_id, json_extract(j.value,'$.id'), json_extract(j.value,'$.sourceId'), coalesce(json_extract(j.value,'$.topic'), ''), json_extract(j.value,'$.nextReviewAt'), max(0, coalesce(json_extract(j.value,'$.streak'), 0)), j.value
  FROM json_each(NEW.state_json, '$.reviewSchedule') AS j
  WHERE j.type = 'object' AND json_type(j.value,'$.id') = 'text' AND json_type(j.value,'$.sourceId') = 'text' AND json_type(j.value,'$.nextReviewAt') = 'text' AND json_extract(OLD.state_json,'$.reviewSchedule') IS NOT json_extract(NEW.state_json,'$.reviewSchedule');
  DELETE FROM interview_results WHERE user_id = NEW.user_id AND json_extract(OLD.state_json,'$.interviewResults') IS NOT json_extract(NEW.state_json,'$.interviewResults');
INSERT OR REPLACE INTO interview_results(user_id, id, question, answer, score, created_at, record_json)
  SELECT NEW.user_id, json_extract(j.value,'$.id'), coalesce(json_extract(j.value,'$.question'), ''), coalesce(json_extract(j.value,'$.answer'), ''), min(100,max(0,coalesce(json_extract(j.value,'$.score'),0))), coalesce(json_extract(j.value,'$.createdAt'),NEW.updated_at), j.value
  FROM json_each(NEW.state_json, '$.interviewResults') AS j
  WHERE j.type = 'object' AND json_type(j.value,'$.id') = 'text' AND json_extract(OLD.state_json,'$.interviewResults') IS NOT json_extract(NEW.state_json,'$.interviewResults');
  DELETE FROM quiz_attempts WHERE user_id = NEW.user_id AND json_extract(OLD.state_json,'$.quizResults') IS NOT json_extract(NEW.state_json,'$.quizResults');
INSERT OR REPLACE INTO quiz_attempts(user_id, id, quiz_id, score, completed_at, record_json)
  SELECT NEW.user_id, json_extract(j.value,'$.id'), json_extract(j.value,'$.quizId'), min(100,max(0,coalesce(json_extract(j.value,'$.score'),0))), coalesce(json_extract(j.value,'$.completedAt'),NEW.updated_at), j.value
  FROM json_each(NEW.state_json, '$.quizResults') AS j
  WHERE j.type = 'object' AND json_type(j.value,'$.id') = 'text' AND json_type(j.value,'$.quizId') = 'text' AND json_extract(OLD.state_json,'$.quizResults') IS NOT json_extract(NEW.state_json,'$.quizResults');
  DELETE FROM mastery_artifacts WHERE user_id = NEW.user_id AND json_extract(OLD.state_json,'$.masteryArtifacts') IS NOT json_extract(NEW.state_json,'$.masteryArtifacts');
INSERT OR REPLACE INTO mastery_artifacts(user_id, id, lesson_id, level, response, updated_at)
  SELECT NEW.user_id, json_extract(j.value,'$.id'), json_extract(j.value,'$.lessonId'), coalesce(json_extract(j.value,'$.level'), ''), coalesce(json_extract(j.value,'$.response'), ''), coalesce(json_extract(j.value,'$.updatedAt'),NEW.updated_at)
  FROM json_each(NEW.state_json, '$.masteryArtifacts') AS j
  WHERE j.type = 'object' AND json_type(j.value,'$.id') = 'text' AND json_type(j.value,'$.lessonId') = 'text' AND json_extract(OLD.state_json,'$.masteryArtifacts') IS NOT json_extract(NEW.state_json,'$.masteryArtifacts');
  DELETE FROM topic_progress WHERE user_id = NEW.user_id AND json_extract(OLD.state_json,'$.completedLessons') IS NOT json_extract(NEW.state_json,'$.completedLessons');
INSERT OR REPLACE INTO topic_progress(user_id, topic_id)
  SELECT NEW.user_id, j.value
  FROM json_each(NEW.state_json, '$.completedLessons') AS j
  WHERE j.type = 'text' AND json_extract(OLD.state_json,'$.completedLessons') IS NOT json_extract(NEW.state_json,'$.completedLessons');
  DELETE FROM project_tasks WHERE user_id = NEW.user_id AND json_extract(OLD.state_json,'$.projectTasks') IS NOT json_extract(NEW.state_json,'$.projectTasks');
INSERT OR IGNORE INTO project_tasks(user_id, project_id, task_id)
  SELECT NEW.user_id, p.key, t.value FROM json_each(NEW.state_json, '$.projectTasks') AS p, json_each(p.value) AS t
  WHERE p.type = 'array' AND t.type = 'text' AND json_extract(OLD.state_json,'$.projectTasks') IS NOT json_extract(NEW.state_json,'$.projectTasks');
END;
