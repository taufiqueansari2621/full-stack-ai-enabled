# P34 — Industrial AI Operations Platform

Build a multi-tenant operations product that receives simulated equipment telemetry, detects anomalies, helps engineers investigate incidents, and answers questions using approved manuals and maintenance history.

## Why this is the capstone

This project joins the roadmap's major skills in one credible product: frontend architecture, realtime data, backend services, databases, ML inference, permission-aware RAG, safe agent tools, evaluation, security, and operations.

## Users and outcomes

- **Operator:** sees equipment health and acknowledges alerts.
- **Reliability engineer:** investigates anomalies and compares historical signals.
- **Maintenance lead:** creates work orders and reviews AI recommendations.
- **Tenant admin:** manages sites, users, roles, devices, and documents.

Example measurable outcomes:

- an alert becomes visible within five seconds of anomaly detection;
- common operational questions achieve at least 85% grounded-answer pass rate;
- every RAG answer cites accessible source passages;
- no cross-tenant data appears in authorization and retrieval tests;
- p95 non-AI API latency remains below the documented local/load-test target.

## Recommended stack

- React or Angular with TypeScript for the web application;
- Node.js/TypeScript for identity, tenants, assets, alerts, and work orders;
- Python/FastAPI for anomaly inference, document ingestion, retrieval, and AI orchestration;
- PostgreSQL for transactional data, Redis for caching/coordination, object storage for documents;
- PostgreSQL vector extension or a dedicated vector database only after documenting the trade-off;
- SSE for one-way alert feeds or WebSockets when bidirectional realtime behavior is required;
- Docker Compose locally, CI for checks, and one documented cloud deployment.

## Core domain model

```text
Tenant -> Site -> Asset -> Sensor -> Telemetry
                         -> Alert -> Investigation -> WorkOrder
Tenant -> User -> Role/Permission
Tenant -> Document -> Chunk -> Embedding
Question -> RetrievalTrace -> Answer -> Citation -> Feedback
```

Every tenant-owned table and retrieval record must carry enforceable tenant scope. Do not rely only on a client-provided tenant identifier.

## Architecture

```text
Device simulator -> ingestion API/queue -> telemetry store
                                      -> anomaly service -> alerts

Web app -> product API -> PostgreSQL/Redis -> realtime alert stream
       -> AI gateway -> retrieval service -> approved document index
                     -> model provider
                     -> evaluation/tracing store

AI tool request -> policy check -> typed tool -> audit log -> result
```

Keep product workflows deterministic. Use the model to classify, summarize, retrieve, and propose actions; require authorization checks and human confirmation before changing operational state.

## Milestones

### 1. Product foundation

- define scope, architecture decision records, API contract, data model, and threat model;
- create tenant, site, asset, sensor, user, role, alert, and work-order models;
- add authentication plus server-side tenant and role enforcement;
- seed two tenants so isolation can be tested continuously.

### 2. Realtime operations dashboard

- simulate at least 1,000 devices with configurable event rates;
- show fleet health, asset detail, telemetry charts, and alert feed;
- support filtering, URL state, pagination, reconnect, and stale-data indicators;
- measure rendering and message-handling performance.

### 3. Anomaly service

- begin with a transparent statistical baseline;
- create a versioned dataset and time-aware train/validation split;
- compare the baseline with one ML approach using precision, recall, F1, and false alerts per asset/day;
- version features/model/config and expose inference reason codes;
- monitor input drift and inference latency.

### 4. Permission-aware RAG

- ingest manuals, procedures, and synthetic maintenance reports;
- parse, clean, chunk, embed, index, and retain source metadata;
- apply tenant/site/document ACL filters before results reach the model;
- add hybrid retrieval, reranking, citations, and an abstain path;
- evaluate retrieval recall separately from answer groundedness.

### 5. Copilot and safe tools

- stream cited answers into an investigation workspace;
- allow typed, narrow tools such as `getAssetHistory`, `compareSensors`, and `draftWorkOrder`;
- validate tool arguments and results, enforce permissions again at execution, and record audit events;
- require explicit confirmation before creating a work order;
- limit iterations, time, tokens, and tool permissions.

### 6. Production hardening

- cover unit, integration, contract, end-to-end, load, and AI evaluation tests;
- add timeouts, idempotency, retries with backoff, dead-letter handling, and graceful degradation;
- emit structured logs, metrics, and distributed traces with correlation IDs;
- create dashboards/alerts for error rate, p95 latency, queue depth, anomaly rate, retrieval quality, token use, and cost;
- document secrets, retention, backup, migrations, rollback, incident response, and data deletion.

## Evaluation suite

Version a small golden set containing:

- answerable and unanswerable questions;
- conflicting or outdated documents;
- questions requiring tenant/site restrictions;
- prompt-injection text inside documents;
- tool requests from allowed and forbidden roles;
- ambiguous asset names and missing telemetry.

Track retrieval recall@k, groundedness, citation correctness, task success, safety violations, p50/p95 latency, tokens, and estimated cost. CI should fail only on stable deterministic checks; run probabilistic evaluations with documented thresholds and variance.

## Required test scenarios

- Tenant A cannot access Tenant B through APIs, search, citations, caches, streams, or tool calls.
- Duplicate telemetry does not create duplicate operational effects.
- Realtime disconnect/reconnect does not silently lose current state.
- Model, vector store, queue, or cache failure produces safe and useful fallback behavior.
- Malicious document instructions cannot override system policy or invoke tools.
- A tool cannot execute with missing confirmation, invalid arguments, or insufficient permission.

## Portfolio deliverables

- deployed demo using synthetic/non-sensitive data;
- 3–5 minute product video and screenshots;
- architecture, sequence, deployment, and data-model diagrams;
- setup guide, environment example, seed command, and one-command local start;
- API documentation and architecture decision records;
- benchmark and AI evaluation report with real numbers;
- threat model, known limitations, operating runbook, and future plan;
- case study explaining one failure, one optimization, and one major trade-off.

## Interview questions

- Why split product APIs and AI services, and when would a modular monolith be better?
- How is tenant isolation enforced across relational, cache, vector, and realtime paths?
- Why did you choose SSE or WebSockets, and how does reconnection work?
- How did you avoid time-series leakage while evaluating anomaly detection?
- How do retrieval metrics differ from answer-quality metrics?
- How do you defend against indirect prompt injection and unsafe tool use?
- What happens when the model or vector database is unavailable?
- Which component fails first at 10x traffic, and what evidence supports that answer?
- How are quality, latency, and cost regressions detected before deployment?
- What would you simplify for a three-person team, and what would you add for regulated production use?
