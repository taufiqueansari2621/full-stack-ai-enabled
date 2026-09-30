# Project and interview record repositories

Add owner-keyed user_projects and interview_sessions projections to the real D1
schema, retaining existing normalized project_tasks and interview_results rows.
New interview answers carry a stable session ID and planned question count.
Historical answers without a session ID remain individually labelled legacy
practice records; never infer a fictional completed session from timestamps.

Forward-only migration backfills from snapshots and synchronizes through atomic
insert/update/delete triggers. Do not change snapshot contents, revisions, or
timestamps. Snapshot sync remains the compatible write contract; typed domain
repositories read indexed project/milestone/session/answer records independently
without downloading the complete progress snapshot.

Expose authenticated owner-scoped, bounded cursor APIs and a lazy cloud-records
panel in My Progress. Show loading, empty, error/retry, and offline states, plus
saved session answers on request. No public publication or automatic progress
credit. Scores remain learner-reported structure scores, not secure judge scores.

Verify backfill, owner isolation, stable grouping, reset/cascade, stale CAS
rejection, query pagination, and real cloud UI/API behavior. Obtain a managed D1
recovery bookmark before the additive migration; never export private records.
