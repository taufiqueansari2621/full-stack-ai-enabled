# Project Ladder

The 34 projects are deliberate practice, not 34 portfolio obligations. Build small projects quickly, then invest deeply in a few showcase systems.

## Tiers

| Tier | Projects | Expected finish |
|---|---|---|
| Foundation | P01–P12 | Working feature, focused tests, short learning note |
| Frontend | P13–P20 | Polished UX, accessibility, performance, component architecture |
| Backend | P21–P27 | API contract, data design, auth, resilience, observability |
| Applied AI | P28–P33 | Baseline, dataset, evaluation, safety, cost and latency evidence |
| Capstone | P34 | Integrated, deployed, production-style case study |

## Catalog

### Foundation builds

- [P01 Responsive Portfolio](P01_RESPONSIVE_PORTFOLIO.md) — semantics, responsive CSS, accessibility, SEO.
- [P02 E-commerce Product Page](P02_ECOMMERCE_PRODUCT_PAGE.md) — product UI and client state.
- [P03 Dashboard Without a Framework](P03_DASHBOARD_NO_FRAMEWORK.md) — DOM, events, modular JavaScript.
- [P04 Expense Tracker](P04_EXPENSE_TRACKER.md) — state, persistence, calculations.
- [P05 Search Dashboard](P05_SEARCH_DASHBOARD.md) — debounce, caching, pagination, URL state.
- [P06 Realtime Ticker](P06_REALTIME_TICKER.md) — streaming updates and rendering performance.
- [P07 Promise Implementation](P07_PROMISE_IMPLEMENTATION.md) — asynchronous control flow internals.
- [P08 Event Emitter](P08_EVENT_EMITTER.md) — publish/subscribe and cleanup.
- [P09 Utility Library](P09_UTILITY_LIBRARY.md) — debounce, throttle, packaging, tests.
- [P10 LRU Cache](P10_LRU_CACHE.md) — O(1) cache operations and invariants.
- [P11 Task Queue](P11_TASK_QUEUE.md) — concurrency, retries, cancellation.
- [P12 Typed API SDK](P12_TYPED_API_SDK.md) — generics, contracts, error types.

### Frontend systems

- [P13 Angular Admin](P13_ANGULAR_ADMIN.md)
- [P14 Component Library](P14_COMPONENT_LIBRARY.md)
- [P15 IoT Command Center](P15_IOT_5000_DEVICES.md)
- [P16 Enterprise Dashboard](P16_ENTERPRISE_DASHBOARD.md)
- [P17 React Task Manager](P17_REACT_TASK_MANAGER.md)
- [P18 React E-commerce](P18_REACT_ECOMMERCE.md)
- [P19 React Analytics](P19_REACT_ANALYTICS.md)
- [P20 Angular vs React CRM](P20_ANGULAR_VS_REACT_CRM.md)

### Backend and platform systems

- [P21 Node REST API](P21_NODE_REST_API.md)
- [P22 File Service](P22_FILE_SERVICE.md)
- [P23 Job Service](P23_JOB_SERVICE.md)
- [P24 Notification Service](P24_NOTIFICATION_SERVICE.md)
- [P25 Multi-tenant SaaS](P25_MULTI_TENANT_SAAS.md)
- [P26 E-commerce Backend](P26_ECOMMERCE_BACKEND.md)
- [P27 Realtime Platform](P27_REALTIME_PLATFORM.md)

### AI-enabled systems

- [P28 IoT Anomaly ML](P28_IOT_ANOMALY_ML.md)
- [P29 Time-series AI](P29_TIME_SERIES_AI.md)
- [P30 AI Support Copilot](P30_AI_SUPPORT_COPILOT.md)
- [P31 Enterprise RAG](P31_ENTERPRISE_RAG.md)
- [P32 Engineering Agent](P32_ENGINEERING_AGENT.md)
- [P33 AI Evaluation Platform](P33_AI_EVAL_PLATFORM.md)
- [P34 Industrial AI Capstone](P34_INDUSTRIAL_AI_CAPSTONE.md)

## Build protocol

### 1. Define

- problem, target user, and success metric;
- must-have, should-have, and deliberately excluded scope;
- three main user stories and failure scenarios;
- architecture, data model, API contract, and threat assumptions.

### 2. Deliver a vertical slice

Build one complete path through UI, API, data, and tests before adding many features. Seed realistic demo data and make local setup reproducible.

### 3. Harden

- validate at trust boundaries;
- add authentication, authorization, rate limits, and audit events where relevant;
- cover loading, empty, error, offline, forbidden, and partial-success states;
- add unit, integration, contract, and end-to-end tests in proportion to risk;
- measure performance instead of claiming it is fast.

### 4. Operate

- structured logs with request or trace IDs;
- health/readiness checks;
- metrics for traffic, errors, latency, and saturation;
- retry, timeout, idempotency, and graceful-degradation strategy;
- migration, backup, and rollback notes.

### 5. Present

Every showcase README should contain:

```text
Problem -> Demo -> Architecture -> Key decisions -> Setup
-> Testing -> Security -> Measurements -> Trade-offs -> Next steps
```

## AI project acceptance criteria

In addition to normal software quality, P28–P34 should include:

- a simple baseline and versioned test dataset;
- explicit quality metrics and pass thresholds;
- evaluation by category, not only one average score;
- latency percentiles and estimated cost per successful task;
- injection, data-leakage, harmful-output, and tool-abuse tests;
- prompt/model/config version in traces;
- fallback and human approval for consequential actions.

## Project scorecard

Score each category from 0–3. A showcase project should reach at least 24/30 with no zero.

| Category | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Product | unclear | feature list | clear users | measured outcome |
| Architecture | absent | accidental | documented | justified trade-offs |
| Code | fragile | works | modular | maintainable and typed |
| Tests | none | happy path | risk-based suite | CI plus failure coverage |
| UX/accessibility | broken | basic | complete states | audited and polished |
| Security | ignored | basic auth | threat-aware | tested controls |
| Performance | unknown | guessed | measured | budget and regression checks |
| Operations | none | logs | metrics/traces | alerts and runbook |
| AI quality | unknown/N/A | demo-based | dataset/evals | regression and safety gates |
| Communication | absent | setup only | good README | compelling case study/demo |

