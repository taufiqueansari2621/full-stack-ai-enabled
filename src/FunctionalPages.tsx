import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Code2,
  FileText,
  FolderKanban,
  Lightbulb,
  MessageSquareText,
  NotebookPen,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import {
  interviewQuestions,
  projectCards,
  reviewItems,
  type NavId,
} from "./data";
import type { ForgeStore } from "./useForgeStore";

export type ToastMessage = { id: number; text: string };
type PageProps = { store: ForgeStore; notify: (text: string) => void };

const challenges = [
  {
    id: "event-order",
    type: "Prediction",
    title: "Event loop ordering",
    topic: "JavaScript",
    prompt: "What is the exact output order?",
    code: "console.log('A')\nsetTimeout(() => console.log('B'), 0)\nPromise.resolve().then(() => console.log('C'))\nconsole.log('D')",
    options: [
      "A → B → C → D",
      "A → D → B → C",
      "A → D → C → B",
      "D → A → C → B",
    ],
    answer: "A → D → C → B",
    hint: "Synchronous work finishes first. Which queue has priority next?",
    explanation:
      "A and D run synchronously. Promise handlers are microtasks, so C runs before timer task B.",
    xp: 60,
  },
  {
    id: "closure",
    type: "Concept",
    title: "Closure reasoning",
    topic: "JavaScript",
    prompt: "Which description is most precise?",
    options: [
      "A function that runs once",
      "A function bundled with references to its lexical environment",
      "A private method",
      "Any callback",
    ],
    answer: "A function bundled with references to its lexical environment",
    hint: "What can a returned function access after its outer function finishes?",
    explanation:
      "A closure is a function plus access to bindings from the lexical environment where it was created.",
    xp: 60,
  },
  {
    id: "mutation",
    type: "Debugging",
    title: "Find the React state bug",
    topic: "React",
    prompt: "What is the safest fix?",
    code: "items.push(item)\nsetItems(items)",
    options: [
      "Call setItems twice",
      "Use setItems(current => [...current, item])",
      "Use a global",
      "Wrap push in setTimeout",
    ],
    answer: "Use setItems(current => [...current, item])",
    hint: "Create a new reference and use the latest state.",
    explanation:
      "The functional immutable update avoids mutation and stale state.",
    xp: 60,
  },
  {
    id: "index",
    type: "Real world",
    title: "Choose a database index",
    topic: "Databases",
    prompt: "Filter tenant and status, then sort newest first.",
    code: "WHERE tenant_id = $1 AND status = $2\nORDER BY created_at DESC",
    options: [
      "(created_at)",
      "(tenant_id, status, created_at DESC)",
      "(status)",
      "One index per column",
    ],
    answer: "(tenant_id, status, created_at DESC)",
    hint: "Match equality filters first, then ordering.",
    explanation:
      "The composite index narrows equalities and can serve the requested order.",
    xp: 80,
  },
];
const projectTasks: Record<string, string[]> = {
  p05: [
    "Define search contract",
    "Build accessible search UI",
    "Implement debouncing",
    "Cancel stale requests",
    "Add URL state",
    "Add cache policy",
    "Cover UI states",
    "Write unit tests",
    "Add integration tests",
    "Measure performance",
    "Deploy and document",
  ],
  p16: [
    "Architecture and roles",
    "Dashboard shell",
    "Data table",
    "Realtime charts",
    "Filters",
    "Error boundaries",
    "Accessibility audit",
    "Virtualization",
    "Performance budget",
    "Unit tests",
    "Integration tests",
    "E2E tests",
    "Observability",
    "Deployment",
    "Case study",
  ],
  p25: [
    "Tenant model",
    "Authentication",
    "Tenant isolation",
    "Role permissions",
    "Audit events",
    "API validation",
    "Database schema",
    "Migrations",
    "Caching",
    "Queues",
    "Idempotency",
    "Rate limits",
    "Unit tests",
    "Integration tests",
    "Security tests",
    "Load tests",
    "Deployment",
    "Runbook",
  ],
  p31: [
    "User stories",
    "Document model",
    "Ingestion",
    "Chunking",
    "Embeddings",
    "Vector index",
    "Keyword retrieval",
    "Hybrid search",
    "Reranking",
    "ACL filtering",
    "Citations",
    "Abstention",
    "Streaming UI",
    "Feedback",
    "Golden dataset",
    "Retrieval evals",
    "Answer evals",
    "Injection tests",
    "Tracing",
    "Cost analysis",
    "Deployment",
  ],
};

function Feedback({
  type,
  title,
  text,
}: {
  type: string;
  title: string;
  text: string;
}) {
  return (
    <div className={`feedback-box ${type}`}>
      {type === "success" ? (
        <CheckCircle2 />
      ) : type === "error" ? (
        <CircleAlert />
      ) : (
        <Lightbulb />
      )}
      <div>
        <b>{title}</b>
        <p>{text}</p>
      </div>
    </div>
  );
}

export function PracticePage({ store, notify }: PageProps) {
  const [index, setIndex] = useState(0),
    [selected, setSelected] = useState(""),
    [checked, setChecked] = useState(false),
    [hint, setHint] = useState(false);
  const item = challenges[index],
    correct = checked && selected === item.answer;
  const reset = () => {
    setSelected("");
    setChecked(false);
    setHint(false);
  };
  const submit = () => {
    if (!selected) return;
    const ok = selected === item.answer;
    setChecked(true);
    store.saveAttempt({ challengeId: item.id, correct: ok, answer: selected });
    notify(
      ok ? `Correct — +${item.xp} XP` : "Attempt saved — study the explanation",
    );
  };
  return (
    <div className="page">
      <section className="page-title">
        <div>
          <span className="eyebrow">DELIBERATE PRACTICE</span>
          <h1>
            Train the skill, not{" "}
            <span className="gradient-text">the answer</span>
          </h1>
          <p>Attempts persist and contribute evidence to mastery.</p>
        </div>
        <div className="live-stat">
          <Trophy />
          <div>
            <b>
              {store.metrics.uniqueCorrect}/{challenges.length}
            </b>
            <span>mastered</span>
          </div>
        </div>
      </section>
      <div className="practice-shell">
        <aside className="challenge-list panel">
          {challenges.map((c, i) => {
            const mastered = store.state.practiceAttempts.some(
              (a) => a.challengeId === c.id && a.correct,
            );
            return (
              <button
                key={c.id}
                className={i === index ? "active" : ""}
                onClick={() => {
                  setIndex(i);
                  reset();
                }}
              >
                <span className={mastered ? "mastered" : ""}>
                  {mastered ? <Check /> : i + 1}
                </span>
                <div>
                  <b>{c.title}</b>
                  <small>
                    {c.type} · {c.topic}
                  </small>
                </div>
                <ChevronRight />
              </button>
            );
          })}
        </aside>
        <article className="challenge-workspace panel">
          <div className="challenge-head">
            <div>
              <span className="type-pill">{item.type}</span>
              <span>{item.topic}</span>
            </div>
            <span>
              <Zap /> +{item.xp} XP
            </span>
          </div>
          <h2>{item.title}</h2>
          <p>{item.prompt}</p>
          {item.code && <pre className="code-block">{item.code}</pre>}
          <div className="challenge-options">
            {item.options.map((o) => (
              <button
                key={o}
                disabled={checked}
                className={`${selected === o ? "selected" : ""} ${checked && o === item.answer ? "correct" : ""} ${checked && selected === o && o !== item.answer ? "wrong" : ""}`}
                onClick={() => setSelected(o)}
              >
                <span>{o}</span>
                {checked && o === item.answer && <CheckCircle2 />}
              </button>
            ))}
          </div>
          {hint && !checked && (
            <Feedback type="hint" title="Small hint" text={item.hint} />
          )}{" "}
          {checked && (
            <Feedback
              type={correct ? "success" : "error"}
              title={correct ? "Exactly right" : "Not quite yet"}
              text={item.explanation}
            />
          )}
          <div className="challenge-actions">
            <button
              className="secondary-button"
              disabled={hint || checked}
              onClick={() => setHint(true)}
            >
              <Lightbulb /> Hint
            </button>
            <span>
              {
                store.state.practiceAttempts.filter(
                  (a) => a.challengeId === item.id,
                ).length
              }{" "}
              saved attempts
            </span>
            {checked ? (
              <>
                <button className="secondary-button" onClick={reset}>
                  <RotateCcw /> Retry
                </button>
                <button
                  className="primary-button"
                  onClick={() => {
                    setIndex((index + 1) % challenges.length);
                    reset();
                  }}
                >
                  Next <ArrowRight />
                </button>
              </>
            ) : (
              <button
                className="primary-button"
                disabled={!selected}
                onClick={submit}
              >
                Check answer <ArrowRight />
              </button>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

export function KnowledgePage({ store, notify }: PageProps) {
  const [kind, setKind] = useState<"all" | "note" | "mistake">("all"),
    [form, setForm] = useState<"note" | "mistake" | null>(null),
    [query, setQuery] = useState(""),
    [title, setTitle] = useState(""),
    [topic, setTopic] = useState("JavaScript"),
    [body, setBody] = useState("");
  const entries = store.state.knowledge.filter(
    (e) =>
      (kind === "all" || e.kind === kind) &&
      `${e.title} ${e.body} ${e.topic}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const save = () => {
    if (!form || !title.trim() || !body.trim()) return;
    store.addKnowledge({
      kind: form,
      title: title.trim(),
      body: body.trim(),
      topic,
    });
    setForm(null);
    setTitle("");
    setBody("");
    notify("Saved locally");
  };
  return (
    <div className="page">
      <section className="page-title">
        <div>
          <span className="eyebrow">PERSONAL KNOWLEDGE BASE</span>
          <h1>
            Your engineering <span className="gradient-text">second brain</span>
          </h1>
          <p>Capture insights and useful mistakes.</p>
        </div>
        <div className="page-actions">
          <button
            className="secondary-button"
            onClick={() => setForm("mistake")}
          >
            <CircleAlert /> Log mistake
          </button>
          <button className="primary-button" onClick={() => setForm("note")}>
            <Plus /> New note
          </button>
        </div>
      </section>
      <div className="knowledge-toolbar">
        <div className="search-field">
          <Search />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search knowledge..."
          />
        </div>
        <div className="filter-row compact">
          {(["all", "note", "mistake"] as const).map((x) => (
            <button
              key={x}
              className={kind === x ? "active" : ""}
              onClick={() => setKind(x)}
            >
              {x === "all" ? "Everything" : `${x}s`}
            </button>
          ))}
        </div>
      </div>
      {entries.length ? (
        <div className="knowledge-grid">
          {entries.map((e) => (
            <article className={`knowledge-card panel ${e.kind}`} key={e.id}>
              <div className="knowledge-card-top">
                <div className="knowledge-icon">
                  {e.kind === "note" ? <NotebookPen /> : <CircleAlert />}
                </div>
                <span>{e.kind}</span>
                <button
                  onClick={() => {
                    store.deleteKnowledge(e.id);
                    notify("Entry deleted");
                  }}
                  aria-label={`Delete ${e.title}`}
                >
                  <Trash2 />
                </button>
              </div>
              <span className="topic-label">{e.topic}</span>
              <h2>{e.title}</h2>
              <p>{e.body}</p>
              <small>{new Date(e.createdAt).toLocaleDateString()}</small>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state panel">
          <NotebookPen />
          <h2>No matching entries</h2>
          <button className="primary-button" onClick={() => setForm("note")}>
            Create note
          </button>
        </div>
      )}
      {form && (
        <div className="modal-backdrop" onMouseDown={() => setForm(null)}>
          <div
            className="modal panel"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setForm(null)}>
              <X />
            </button>
            <span className="eyebrow teal">
              {form === "note" ? "CAPTURE AN INSIGHT" : "MISTAKE JOURNAL"}
            </span>
            <h2>
              {form === "note" ? "Create a note" : "Log a useful mistake"}
            </h2>
            <label>
              Title
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label>
              Topic
              <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                {[
                  "JavaScript",
                  "TypeScript",
                  "React",
                  "Backend",
                  "Databases",
                  "System design",
                  "AI engineering",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              Details
              <textarea
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </label>
            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={() => setForm(null)}
              >
                Cancel
              </button>
              <button
                className="primary-button"
                disabled={!title.trim() || !body.trim()}
                onClick={save}
              >
                Save <Check />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProgressPage({
  store,
  navigate,
}: {
  store: ForgeStore;
  navigate: (id: NavId) => void;
}) {
  const accuracy = store.state.practiceAttempts.length
    ? Math.round(
        (store.metrics.correct / store.state.practiceAttempts.length) * 100,
      )
    : 0;
  const metrics = [
    [
      "Understanding",
      Math.min(100, store.state.completedLessons.length * 18),
      `${store.state.completedLessons.length} lessons`,
      "learn",
    ],
    [
      "Practice",
      accuracy,
      `${store.state.practiceAttempts.length} attempts`,
      "practice",
    ],
    [
      "Project usage",
      Math.min(100, store.metrics.completedTasks * 4),
      `${store.metrics.completedTasks} milestones`,
      "projects",
    ],
    [
      "Recall",
      Math.min(100, store.state.completedReviews.length * 22),
      `${store.state.completedReviews.length} reviews`,
      "reviews",
    ],
    [
      "Interview",
      store.metrics.interviewAverage,
      `${store.state.interviewResults.length} answers`,
      "interview",
    ],
  ] as const;
  return (
    <div className="page">
      <section className="page-title">
        <div>
          <span className="eyebrow">EVIDENCE-BASED PROGRESS</span>
          <h1>
            Mastery, not <span className="gradient-text">checkboxes</span>
          </h1>
          <p>Calculated from local learning activity.</p>
        </div>
        <div className="mastery-hero">
          <div>
            <span>Overall mastery</span>
            <b>{store.metrics.mastery}%</b>
            <small>Local evidence</small>
          </div>
          <Target />
        </div>
      </section>
      <div className="metric-grid">
        {metrics.map((m) => (
          <article className="metric-card panel" key={m[0]}>
            <div className="metric-top">
              <span>{m[0]}</span>
              <b>{m[1]}%</b>
            </div>
            <div className="large-bar">
              <i style={{ width: `${m[1]}%` }} />
            </div>
            <small>{m[2]}</small>
          </article>
        ))}
      </div>
      <div className="progress-content">
        <article className="panel evidence-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">YOUR EVIDENCE</span>
              <h2>Learning activity</h2>
            </div>
          </div>
          <div className="evidence-list">
            {metrics.map((m) => (
              <div key={m[0]}>
                <div className="evidence-icon">
                  <CheckCircle2 />
                </div>
                <span>
                  <b>{m[0]}</b>
                  <small>{m[2]}</small>
                </span>
                <strong>{m[1]}%</strong>
              </div>
            ))}
          </div>
        </article>
        <article className="panel next-actions">
          <span className="eyebrow">BEST NEXT ACTIONS</span>
          <h2>Strengthen weak signals</h2>
          {[...metrics]
            .sort((a, b) => a[1] - b[1])
            .slice(0, 3)
            .map((m, i) => (
              <button key={m[0]} onClick={() => navigate(m[3])}>
                <span>{i + 1}</span>
                <div>
                  <b>Improve {m[0].toLowerCase()}</b>
                  <small>{m[2]}</small>
                </div>
                <ArrowRight />
              </button>
            ))}
        </article>
      </div>
    </div>
  );
}

const mentorReplies: Record<string, string> = {
  "Explain this simply":
    "JavaScript is one focused worker with helpers. The worker executes the stack; helpers handle timers and requests, then queue callbacks.",
  "Give me a hint":
    "Write synchronous output first. Then list microtasks and normal tasks separately. Which queue drains first?",
  "Review my approach":
    "State expected behavior, identify the invariant, test the smallest case, then change code.",
  "Ask me a question":
    "A Promise callback and timer are ready together. Which runs first, and why?",
};
export function MentorPage({
  store,
  navigate,
}: {
  store: ForgeStore;
  navigate: (id: NavId) => void;
}) {
  const [messages, setMessages] = useState([
      {
        role: "mentor",
        text: "I am your local learning coach. I guide without pretending a live AI service is connected.",
      },
    ]),
    [input, setInput] = useState("");
  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((c) => [
      ...c,
      { role: "user", text },
      {
        role: "mentor",
        text:
          mentorReplies[text] ??
          `Let’s reason through “${text}”. What did you expect, what happened, and what is the smallest reproduction?`,
      },
    ]);
    setInput("");
  };
  return (
    <div className="page">
      <section className="page-title">
        <div>
          <span className="eyebrow">SOCRATIC COACH</span>
          <h1>
            Think deeper with your{" "}
            <span className="gradient-text">AI mentor</span>
          </h1>
          <p>Transparent local coaching.</p>
        </div>
        <div className="local-badge">
          <CheckCircle2 /> Local mode
        </div>
      </section>
      <div className="mentor-layout">
        <aside className="mentor-context panel">
          <span className="eyebrow">ACTIVE CONTEXT</span>
          <h2>JavaScript event loop</h2>
          <div className="context-stat">
            <span>Mastery</span>
            <b>{store.metrics.mastery}%</b>
          </div>
          <div className="large-bar">
            <i style={{ width: `${store.metrics.mastery}%` }} />
          </div>
          {Object.keys(mentorReplies).map((x) => (
            <button key={x} onClick={() => send(x)}>
              {x}
              <ArrowRight />
            </button>
          ))}
          <button
            className="secondary-button mentor-practice"
            onClick={() => navigate("practice")}
          >
            <Code2 /> Open practice
          </button>
        </aside>
        <article className="mentor-chat panel">
          <div className="chat-header">
            <div className="mentor-orb">
              <Sparkles />
            </div>
            <div>
              <b>Forge Mentor</b>
              <span>Ready · local</span>
            </div>
            <button
              onClick={() =>
                setMessages([
                  {
                    role: "mentor",
                    text: "Fresh session. What should we work through?",
                  },
                ])
              }
            >
              <RotateCcw /> Reset
            </button>
          </div>
          <div className="message-list">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.role}`}>
                <p>{m.text}</p>
              </div>
            ))}
          </div>
          <form
            className="mentor-input"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask or describe what you tried..."
            />
            <button disabled={!input.trim()}>
              <ArrowRight />
            </button>
          </form>
        </article>
      </div>
    </div>
  );
}

export function ProjectsHub({ store, notify }: PageProps) {
  const [filter, setFilter] = useState("All projects"),
    [selected, setSelected] = useState<string | null>(null);
  const visible = projectCards.filter(
    (p) =>
      filter === "All projects" ||
      (filter === "In progress" &&
        (store.state.projectTasks[p.id]?.length ?? 0) > 0) ||
      (filter === "Frontend" && ["JavaScript", "Angular"].includes(p.type)) ||
      (filter === "Backend" && p.type === "Backend") ||
      (filter === "AI enabled" && p.type.includes("AI")),
  );
  return (
    <>
      <div className="page">
        <section className="page-title">
          <div>
            <span className="eyebrow">BUILD TO UNDERSTAND</span>
            <h1>
              Project <span className="gradient-text">workshop</span>
            </h1>
            <p>Complete persistent engineering milestones.</p>
          </div>
          <button className="primary-button" onClick={() => setSelected("p05")}>
            <Plus /> Continue P05
          </button>
        </section>
        <div className="filter-row">
          {[
            "All projects",
            "In progress",
            "Frontend",
            "Backend",
            "AI enabled",
          ].map((x) => (
            <button
              key={x}
              className={filter === x ? "active" : ""}
              onClick={() => setFilter(x)}
            >
              {x}
            </button>
          ))}
        </div>
        <div className="projects-grid">
          {visible.map((p) => {
            const tasks = projectTasks[p.id] ?? [],
              done = store.state.projectTasks[p.id]?.length ?? 0,
              progress = tasks.length
                ? Math.round((done / tasks.length) * 100)
                : 0;
            return (
              <article className={`project-card panel ${p.accent}`} key={p.id}>
                <div className="project-card-head">
                  <span className="project-code">{p.code}</span>
                  <span className="status-pill active">
                    {progress ? "In progress" : "Up next"}
                  </span>
                </div>
                <div className="project-symbol">
                  <FolderKanban />
                </div>
                <span className="eyebrow">
                  {p.type} · {p.level}
                </span>
                <h2>{p.title}</h2>
                <p>{p.description}</p>
                <div className="project-progress">
                  <span>
                    <b>{progress}%</b>
                  </span>
                  <div className="bar">
                    <i style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="project-footer">
                  <span>
                    <CheckCircle2 />
                    {done}/{tasks.length}
                  </span>
                  <span>
                    <Clock3 />
                    {p.hours}
                  </span>
                  <button onClick={() => setSelected(p.id)}>
                    <ArrowRight />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      {selected && (
        <ProjectWorkspace
          projectId={selected}
          store={store}
          close={() => setSelected(null)}
          notify={notify}
        />
      )}
    </>
  );
}
export function ProjectWorkspace({
  projectId,
  store,
  close,
  notify,
}: {
  projectId: string;
  store: ForgeStore;
  close: () => void;
  notify: (text: string) => void;
}) {
  const [tab, setTab] = useState("Milestones"),
    tasks = projectTasks[projectId] ?? projectTasks.p05,
    done = store.state.projectTasks[projectId] ?? [],
    title = projectCards.find((p) => p.id === projectId)?.title ?? "Project";
  return (
    <div className="workspace-overlay">
      <div className="project-workspace">
        <header>
          <button className="back-link" onClick={close}>
            <ChevronLeft /> All projects
          </button>
          <div>
            <span className="eyebrow">PROJECT WORKSPACE</span>
            <h1>{title}</h1>
          </div>
          <button className="workspace-close" onClick={close}>
            <X />
          </button>
        </header>
        <div className="workspace-summary panel">
          <div>
            <span>Progress</span>
            <b>{Math.round((done.length / tasks.length) * 100)}%</b>
          </div>
          <div className="large-bar">
            <i style={{ width: `${(done.length / tasks.length) * 100}%` }} />
          </div>
          <span>
            {done.length}/{tasks.length} saved locally
          </span>
        </div>
        <main className="workspace-main">
          <aside className="workspace-nav panel">
            {[
              "Overview",
              "Milestones",
              "Architecture",
              "Testing",
              "Deployment",
              "Decision log",
            ].map((x) => (
              <button
                key={x}
                className={tab === x ? "active" : ""}
                onClick={() => setTab(x)}
              >
                <FileText />
                {x}
              </button>
            ))}
          </aside>
          <section className="milestone-panel panel">
            <span className="eyebrow">{tab.toUpperCase()}</span>
            <h2>{tab}</h2>
            {tab === "Milestones" ? (
              <div className="milestone-list">
                {tasks.map((task, i) => {
                  const id = `${projectId}-${i + 1}`,
                    complete = done.includes(id);
                  return (
                    <button
                      key={task}
                      className={complete ? "done" : ""}
                      onClick={() => {
                        store.toggleProjectTask(projectId, id);
                        notify(
                          complete
                            ? "Milestone reopened"
                            : "Milestone complete — +20 XP",
                        );
                      }}
                    >
                      <span>{complete ? <Check /> : i + 1}</span>
                      <div>
                        <b>{task}</b>
                        <small>Implement, verify, and capture evidence.</small>
                      </div>
                      <em>{complete ? "Complete" : "Mark done"}</em>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="workspace-tab">
                <BrainCircuit />
                <h3>{tab} workspace</h3>
                <p>
                  Capture decisions and evidence for this area in your project
                  documentation.
                </p>
                <button
                  className="secondary-button"
                  onClick={() => notify(`${tab} entry saved as a future task`)}
                >
                  Add entry <Plus />
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function grade(answer: string) {
  const v = answer.toLowerCase(),
    checks = [
      answer.trim().length >= 100,
      /stack/.test(v),
      /microtask|promise/.test(v),
      /task|timer|settimeout/.test(v),
      /example|project|used/.test(v),
      /trade.?off|starv|block|risk/.test(v),
    ];
  return {
    score: Math.round((checks.filter(Boolean).length / checks.length) * 100),
    feedback: [
      "Develop the answer",
      "Explain the stack",
      "Explain microtasks",
      "Compare tasks",
      "Give an example",
      "Mention a trade-off",
    ].filter((_, i) => !checks[i]),
  };
}
export function InterviewTrainer({ store, notify }: PageProps) {
  const [started, setStarted] = useState(false),
    [question, setQuestion] = useState(0),
    [answer, setAnswer] = useState(""),
    [result, setResult] = useState<{
      score: number;
      feedback: string[];
    } | null>(null);
  const submit = () => {
    const r = grade(answer);
    setResult(r);
    store.saveInterview({
      question: interviewQuestions[question],
      answer,
      score: r.score,
      feedback: r.feedback,
    });
    notify(`Answer saved · ${r.score}%`);
  };
  if (!started)
    return (
      <div className="page">
        <section className="page-title">
          <div>
            <span className="eyebrow">PRACTICE UNDER PRESSURE</span>
            <h1>
              Interview <span className="gradient-text">training room</span>
            </h1>
            <p>Transparent scoring and history.</p>
          </div>
          <div className="live-stat">
            <MessageSquareText />
            <div>
              <b>{store.metrics.interviewAverage}%</b>
              <span>average</span>
            </div>
          </div>
        </section>
        <article className="mock-card featured interview-launch">
          <div className="mock-icon">
            <MessageSquareText />
          </div>
          <h2>JavaScript technical screen</h2>
          <p>Four questions · structured rubric</p>
          <button className="primary-button" onClick={() => setStarted(true)}>
            Start <ArrowRight />
          </button>
        </article>
      </div>
    );
  return (
    <div className="page interview-session">
      <button className="back-link" onClick={() => setStarted(false)}>
        <ChevronLeft /> End practice
      </button>
      <div className="interview-top">
        <span>QUESTION {question + 1} OF 4</span>
        <span>Local rubric</span>
      </div>
      <article className="interview-question panel">
        <div className="interviewer">
          <div>
            <Sparkles />
          </div>
          <span>Forge Interviewer</span>
        </div>
        <h1>{interviewQuestions[question]}</h1>
        <p>Include definition, internals, example, and trade-offs.</p>
        <textarea
          disabled={!!result}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        {result && (
          <div
            className={`interview-result ${result.score >= 67 ? "success" : "warning"}`}
          >
            <div>
              <b>{result.score}%</b>
            </div>
            <div>
              {result.feedback.length ? (
                <ul>
                  {result.feedback.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              ) : (
                <p>Excellent depth.</p>
              )}
            </div>
          </div>
        )}
        <div className="interview-actions">
          <button
            className="secondary-button"
            onClick={() => notify("Use one concrete execution trace")}
          >
            <Lightbulb /> Clarify
          </button>
          {result ? (
            <button
              className="primary-button"
              onClick={() => {
                setQuestion((question + 1) % 4);
                setAnswer("");
                setResult(null);
              }}
            >
              Next <ArrowRight />
            </button>
          ) : (
            <button
              className="primary-button"
              disabled={answer.trim().length < 30}
              onClick={submit}
            >
              Submit <ArrowRight />
            </button>
          )}
        </div>
      </article>
    </div>
  );
}

export function LearningExperience({
  store,
  notify,
  navigate,
}: PageProps & { navigate: (id: NavId) => void }) {
  const [level, setLevel] = useState(0),
    [tab, setTab] = useState<"lesson" | "visual" | "check">("lesson"),
    [step, setStep] = useState(0),
    [answer, setAnswer] = useState(""),
    [feedback, setFeedback] = useState(""),
    complete = store.state.completedLessons.includes("js-event-loop");
  const content = [
    [
      "One worker, several helpers",
      "JavaScript executes one stack at a time. Browser helpers handle timers and requests, then queue callbacks.",
    ],
    [
      "Stack, host APIs, and queues",
      "The current stack finishes first. Microtasks drain before the next normal task.",
    ],
    [
      "Product engineering use",
      "Use this model to debounce search, cancel requests, and prevent races.",
    ],
    [
      "Starvation and rendering",
      "Long tasks block rendering. Endless microtasks can starve tasks.",
    ],
    [
      "Interview explanation",
      "Define the stack, host APIs, queues, example, and trade-offs.",
    ],
  ][level];
  return (
    <div className="page learning-experience">
      <button className="back-link" onClick={() => navigate("roadmap")}>
        <ChevronLeft /> Roadmap
      </button>
      <section className="lesson-hero">
        <div>
          <span className="eyebrow teal">JAVASCRIPT · ASYNC</span>
          <h1>How the event loop really works</h1>
        </div>
        <div className="lesson-status">
          <span>{complete ? "MASTERED" : "IN PROGRESS"}</span>
          <b>{complete ? "100%" : "68%"}</b>
        </div>
      </section>
      <div className="depth-selector">
        {["Beginner", "Technical", "Practical", "Advanced", "Interview"].map(
          (x, i) => (
            <button
              key={x}
              className={i === level ? "active" : ""}
              onClick={() => setLevel(i)}
            >
              {x}
            </button>
          ),
        )}
      </div>
      <div className="learning-tabs">
        {(["lesson", "visual", "check"] as const).map((x) => (
          <button
            key={x}
            className={tab === x ? "active" : ""}
            onClick={() => setTab(x)}
          >
            {x === "lesson" ? (
              <BookOpen />
            ) : x === "visual" ? (
              <BrainCircuit />
            ) : (
              <Code2 />
            )}
            {x}
          </button>
        ))}
      </div>
      <article className="learning-surface panel">
        {tab === "lesson" && (
          <>
            <h2>{content[0]}</h2>
            <p>{content[1]}</p>
            <div className="learning-actions">
              <button
                className="secondary-button"
                disabled={!level}
                onClick={() => setLevel(level - 1)}
              >
                Simpler
              </button>
              <button
                className="primary-button"
                disabled={level === 4}
                onClick={() => setLevel(level + 1)}
              >
                Go deeper
              </button>
            </div>
          </>
        )}
        {tab === "visual" && (
          <>
            <h2>Step through execution</h2>
            <pre className="code-block">{challenges[0].code}</pre>
            <div className="execution-grid">
              <div>
                <span>Stack</span>
                <b>{step < 2 ? "A, D" : "empty"}</b>
              </div>
              <div>
                <span>Microtasks</span>
                <b>{step === 2 ? "run C" : "C waiting"}</b>
              </div>
              <div>
                <span>Tasks</span>
                <b>{step === 3 ? "run B" : "B waiting"}</b>
              </div>
              <div>
                <span>Output</span>
                <b>{["—", "A D", "A D C", "A D C B"][step]}</b>
              </div>
            </div>
            <div className="learning-actions">
              <button onClick={() => setStep(0)}>Reset</button>
              <button
                className="primary-button"
                onClick={() => setStep(step >= 3 ? 0 : step + 1)}
              >
                Next step
              </button>
            </div>
          </>
        )}
        {tab === "check" && (
          <>
            <h2>What is the output?</h2>
            <div className="challenge-options">
              {challenges[0].options.map((x) => (
                <button
                  key={x}
                  className={answer === x ? "selected" : ""}
                  onClick={() => setAnswer(x)}
                >
                  {x}
                </button>
              ))}
            </div>
            {feedback && (
              <Feedback
                type={feedback.startsWith("Correct") ? "success" : "error"}
                title="Reasoning"
                text={feedback}
              />
            )}
            <button
              className="primary-button"
              disabled={!answer}
              onClick={() => {
                const ok = answer === challenges[0].answer;
                setFeedback(
                  ok
                    ? "Correct: synchronous A/D, microtask C, timer B."
                    : "Separate synchronous, microtasks, and tasks.",
                );
                store.saveAttempt({
                  challengeId: "lesson-event",
                  correct: ok,
                  answer,
                });
                notify(ok ? "Correct — +60 XP" : "Try once more");
              }}
            >
              Check answer
            </button>
          </>
        )}
      </article>
      <footer className="lesson-completion panel">
        <div>
          <CheckCircle2 />
          <span>
            <b>{complete ? "Lesson completed" : "Record this milestone"}</b>
            <small>Saved locally.</small>
          </span>
        </div>
        <button
          className="primary-button"
          disabled={complete}
          onClick={() => {
            store.completeLesson("js-event-loop");
            notify("Lesson complete — +120 XP");
          }}
        >
          {complete ? "Completed" : "Mark complete"} <Check />
        </button>
      </footer>
    </div>
  );
}

export function ReviewsWorkspace({
  store,
  notify,
  navigate,
}: PageProps & { navigate: (id: NavId) => void }) {
  const done = store.state.completedReviews;
  return (
    <div className="page">
      <section className="page-title">
        <div>
          <span className="eyebrow">SPACED REPETITION</span>
          <h1>
            Make knowledge <span className="gradient-text">stick</span>
          </h1>
          <p>Your queue persists.</p>
        </div>
        <div className="review-summary">
          <div>
            <b>{reviewItems.length - done.length}</b>
            <span>left</span>
          </div>
        </div>
      </section>
      <div className="review-queue panel">
        {reviewItems.map((item, i) => {
          const complete = done.includes(item.title);
          return (
            <div
              className={`queue-row ${complete ? "complete" : ""}`}
              key={item.title}
            >
              <button
                className="check-button"
                onClick={() => {
                  if (complete) store.undoReview(item.title);
                  else store.completeReview(item.title);
                  notify(
                    complete ? "Returned to queue" : "Review complete — +25 XP",
                  );
                }}
              >
                {complete ? <Check /> : i + 1}
              </button>
              <div className={`review-icon r${i}`}>
                <RotateCcw />
              </div>
              <div className="queue-main">
                <b>{item.title}</b>
                <span>{item.type}</span>
              </div>
              <button
                className="round-action"
                onClick={() =>
                  navigate(
                    i === 1 ? "practice" : i === 3 ? "interview" : "learn",
                  )
                }
              >
                <ArrowRight />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
