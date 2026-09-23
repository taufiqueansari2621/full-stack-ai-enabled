import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Code2,
  Database,
  FileText,
  Heart,
  Lightbulb,
  Link2,
  MessageSquareText,
  NotebookPen,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { projectCards, reviewItems, type NavId } from "./data";
import type { ForgeStore } from "./useForgeStore";
import { curriculumPhases } from "./curriculumCatalog";
import { buildSkillMatrix } from "./domain/skills";
import { forgeApi } from "./services/forgeApi";

const TopicPracticeLab = lazy(() => import("./TopicPracticeLab"));
const InterviewAcademy = lazy(() => import("./InterviewAcademy"));

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
      "A function that remembers variables from where it was created",
      "A private method",
      "Any callback",
    ],
    answer: "A function that remembers variables from where it was created",
    hint: "What can a returned function access after its outer function finishes?",
    explanation:
      "A closure is a function that can still use variables from the place where it was created.",
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
      "This creates a new array from the latest state. It avoids changing the old array by mistake.",
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
      "This index first matches the two filters, then returns the rows in the order the query needs.",
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
  p02: [
    "Write user stories",
    "Create semantic HTML",
    "Build mobile layout",
    "Add responsive breakpoints",
    "Add keyboard navigation",
    "Test screen-reader labels",
    "Optimize images",
    "Run accessibility audit",
    "Deploy",
    "Write case study",
  ],
  p11: [
    "Define component API",
    "Build design tokens",
    "Create reusable components",
    "Document variants",
    "Add keyboard behavior",
    "Write unit tests",
    "Add visual tests",
    "Publish Storybook",
    "Package release",
    "Usage guide",
  ],
  p20: [
    "Model the schema",
    "Write migrations",
    "Build REST endpoints",
    "Validate input",
    "Add authentication",
    "Add authorization",
    "Write integration tests",
    "Document OpenAPI",
    "Add rate limits",
    "Deploy with monitoring",
  ],
  p34: [
    "Choose the problem",
    "Collect a legal dataset",
    "Build baseline",
    "Train model",
    "Measure quality",
    "Analyze errors",
    "Create inference API",
    "Build user interface",
    "Add drift checks",
    "Document model card",
    "Deploy and monitor",
  ],
};
const projectGuidance: Record<
  string,
  { goal: string; actions: string[]; evidence: string }
> = {
  Overview: {
    goal: "Turn the brief into a small, testable product plan before coding.",
    actions: [
      "Write the user and problem in one sentence",
      "List must-have and out-of-scope behavior",
      "Define three measurable success checks",
    ],
    evidence:
      "A README with scope, users, acceptance criteria, and a demo plan.",
  },
  Architecture: {
    goal: "Choose boundaries that keep UI, business rules, data, and infrastructure easy to change.",
    actions: [
      "Draw components and data flow",
      "Record two alternatives and trade-offs",
      "Mark trust boundaries and failure points",
    ],
    evidence: "An architecture diagram plus short decision records.",
  },
  Testing: {
    goal: "Prove important behavior from small functions through the real user flow.",
    actions: [
      "Test normal, edge, and failure cases",
      "Add integration coverage at system boundaries",
      "Run one accessible end-to-end journey",
    ],
    evidence: "Passing tests, coverage notes, and a documented manual test.",
  },
  Deployment: {
    goal: "Ship a repeatable release that can be observed and safely rolled back.",
    actions: [
      "Create a production build and environment checklist",
      "Add health checks, logs, and core metrics",
      "Document deploy and rollback commands",
    ],
    evidence:
      "A live URL, release checklist, monitoring screenshot, and rollback plan.",
  },
  "Decision log": {
    goal: "Explain why important technical choices were made.",
    actions: [
      "State context and constraints",
      "Compare at least two options",
      "Record the decision, consequences, and revisit trigger",
    ],
    evidence:
      "Three concise architecture decision records linked from the README.",
  },
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
  const [mode, setMode] = useState<"quick" | "topics">("quick");
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
      ok
        ? `Correct — +${item.xp} XP`
        : "Answer saved — read the explanation and try again",
    );
  };
  return (
    <div className="page">
      <section className="page-title">
        <div>
          <span className="eyebrow">FOCUSED PRACTICE</span>
          <h1>
            Practice the skill, not just{" "}
            <span className="gradient-text">one answer</span>
          </h1>
          <p>Every answer is saved so you can see what to practice next.</p>
        </div>
        <div className="live-stat">
          <Trophy />
          <div>
            <b>
              {store.metrics.uniqueCorrect}/{challenges.length}
            </b>
            <span>answered correctly</span>
          </div>
        </div>
      </section>
      <div
        className="practice-mode-tabs"
        role="tablist"
        aria-label="Practice mode"
      >
        <button
          role="tab"
          aria-selected={mode === "quick"}
          className={mode === "quick" ? "active" : ""}
          onClick={() => setMode("quick")}
        >
          Quick checks <span>{challenges.length}</span>
        </button>
        <button
          role="tab"
          aria-selected={mode === "topics"}
          className={mode === "topics" ? "active" : ""}
          onClick={() => setMode("topics")}
        >
          Practice by topic <span>Easy · Medium · Hard</span>
        </button>
      </div>
      {mode === "quick" ? (
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
                title={correct ? "Correct" : "Try again"}
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
                saved answers
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
      ) : (
        <Suspense
          fallback={
            <div className="topic-practice-summary panel">
              Opening topic practice…
            </div>
          }
        >
          <TopicPracticeLab store={store} notify={notify} />
        </Suspense>
      )}
    </div>
  );
}

function inlineMarkdown(value: string) {
  return value
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .map((part, index) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={index}>{part.slice(2, -2)}</strong>
      ) : part.startsWith("`") && part.endsWith("`") ? (
        <code key={index}>{part.slice(1, -1)}</code>
      ) : (
        part
      ),
    );
}

function NoteMarkdown({ body }: { body: string }) {
  return (
    <div className="note-markdown">
      {body.split("```").map((section, sectionIndex) =>
        sectionIndex % 2 ? (
          <pre key={sectionIndex}>
            <code>{section.replace(/^\w+\n/, "")}</code>
          </pre>
        ) : (
          section
            .split("\n")
            .filter(Boolean)
            .map((line, lineIndex) =>
              line.startsWith("### ") ? (
                <h4 key={lineIndex}>{inlineMarkdown(line.slice(4))}</h4>
              ) : line.startsWith("## ") ? (
                <h3 key={lineIndex}>{inlineMarkdown(line.slice(3))}</h3>
              ) : line.startsWith("# ") ? (
                <h2 key={lineIndex}>{inlineMarkdown(line.slice(2))}</h2>
              ) : /^[-*] /.test(line) ? (
                <p className="note-list-item" key={lineIndex}>
                  • {inlineMarkdown(line.slice(2))}
                </p>
              ) : (
                <p key={lineIndex}>{inlineMarkdown(line)}</p>
              ),
            )
        ),
      )}
    </div>
  );
}

export function KnowledgePage({
  store,
  notify,
  cloudEnabled = false,
}: PageProps & { cloudEnabled?: boolean }) {
  const [kind, setKind] = useState<"all" | "note" | "mistake" | "favorite">(
      "all",
    ),
    [form, setForm] = useState<"note" | "mistake" | null>(null),
    [editId, setEditId] = useState<string | null>(null),
    [query, setQuery] = useState(""),
    [title, setTitle] = useState(""),
    [topic, setTopic] = useState("JavaScript"),
    [body, setBody] = useState(""),
    [tags, setTags] = useState(""),
    [topicLink, setTopicLink] = useState(""),
    [projectLink, setProjectLink] = useState(""),
    [aiAnswer, setAiAnswer] = useState<Record<string, string>>({});
  const entries = store.state.knowledge.filter(
    (e) =>
      (kind === "all" ||
        e.kind === kind ||
        (kind === "favorite" && e.favorite)) &&
      `${e.title} ${e.body} ${e.topic} ${(e.tags ?? []).join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const save = () => {
    if (!form || !title.trim() || !body.trim()) return;
    const entry = {
      kind: form,
      title: title.trim(),
      body: body.trim(),
      topic,
      tags: tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 10),
      topicLink: topicLink.trim() || undefined,
      projectLink: projectLink.trim() || undefined,
    };
    if (editId) store.updateKnowledge(editId, entry);
    else store.addKnowledge(entry);
    setForm(null);
    setTitle("");
    setBody("");
    setTags("");
    setTopicLink("");
    setProjectLink("");
    setEditId(null);
    notify(editId ? "Note updated" : "Note saved");
  };
  return (
    <div className="page">
      <section className="page-title">
        <div>
          <span className="eyebrow">MY NOTES</span>
          <h1>
            Save what you <span className="gradient-text">learn</span>
          </h1>
          <p>Keep helpful notes and mistakes you do not want to repeat.</p>
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
            placeholder="Search your notes..."
          />
        </div>
        <div className="filter-row compact">
          {(["all", "note", "mistake", "favorite"] as const).map((x) => (
            <button
              key={x}
              className={kind === x ? "active" : ""}
              onClick={() => setKind(x)}
            >
              {x === "all"
                ? "Everything"
                : x === "favorite"
                  ? "Favorites"
                  : `${x}s`}
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
              <NoteMarkdown body={e.body} />
              {(e.tags ?? []).length > 0 && (
                <div className="note-tags">
                  {e.tags?.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              )}
              {(e.topicLink || e.projectLink) && (
                <div className="note-links">
                  <Link2 />{" "}
                  {[e.topicLink, e.projectLink].filter(Boolean).join(" · ")}
                </div>
              )}
              <div className="note-actions">
                <button
                  aria-label={`${e.favorite ? "Remove" : "Add"} ${e.title} ${e.favorite ? "from" : "to"} favorites`}
                  onClick={() =>
                    store.updateKnowledge(e.id, { favorite: !e.favorite })
                  }
                >
                  <Heart fill={e.favorite ? "currentColor" : "none"} />{" "}
                  {e.favorite ? "Favorited" : "Favorite"}
                </button>
                <button
                  onClick={() => {
                    setEditId(e.id);
                    setForm(e.kind);
                    setTitle(e.title);
                    setTopic(e.topic);
                    setBody(e.body);
                    setTags((e.tags ?? []).join(", "));
                    setTopicLink(e.topicLink ?? "");
                    setProjectLink(e.projectLink ?? "");
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    store.addKnowledgeToReview(e.id, "flashcard");
                    notify("Converted to a review flashcard");
                  }}
                >
                  Flashcard
                </button>
                <button
                  onClick={() => {
                    store.addKnowledgeToReview(e.id, "concept");
                    notify("Added to review queue");
                  }}
                >
                  Add to Review
                </button>
                <button
                  disabled={!cloudEnabled}
                  onClick={() =>
                    void forgeApi
                      .askAi({
                        mode: "explain",
                        message: `Help me improve and understand this note: ${e.title}`,
                        level: 2,
                        context: {
                          note: `${e.title} (${e.topic})\n${e.body}`.slice(
                            0,
                            4000,
                          ),
                        },
                      })
                      .then((answer) =>
                        setAiAnswer((current) => ({
                          ...current,
                          [e.id]: answer.response,
                        })),
                      )
                      .catch((reason) =>
                        notify(
                          reason instanceof Error
                            ? reason.message
                            : "Forge AI is unavailable",
                        ),
                      )
                  }
                >
                  <MessageSquareText /> Ask AI
                </button>
              </div>
              {aiAnswer[e.id] && (
                <div className="note-ai-answer">
                  <Sparkles />
                  <p>{aiAnswer[e.id]}</p>
                </div>
              )}
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
            <button
              className="modal-close"
              onClick={() => setForm(null)}
              aria-label="Close note form"
            >
              <X aria-hidden="true" />
            </button>
            <span className="eyebrow teal">
              {form === "note" ? "SAVE A NOTE" : "LEARN FROM A MISTAKE"}
            </span>
            <h2>
              {editId
                ? "Edit saved knowledge"
                : form === "note"
                  ? "Create a note"
                  : "Log a useful mistake"}
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
            <label>
              Tags
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="async, debugging, interview"
              />
            </label>
            <label>
              Topic link
              <input
                value={topicLink}
                onChange={(e) => setTopicLink(e.target.value)}
                placeholder="Lesson or topic name"
              />
            </label>
            <label>
              Project link
              <input
                value={projectLink}
                onChange={(e) => setProjectLink(e.target.value)}
                placeholder="Project name or ID"
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
  const [now] = useState(() => Date.now());
  const [selectedSkill, setSelectedSkill] = useState("javascript");
  const accuracy = store.state.practiceAttempts.length
    ? Math.round(
        (store.metrics.correct / store.state.practiceAttempts.length) * 100,
      )
    : 0;
  const matrix = buildSkillMatrix(store.state, now);
  const selected =
    matrix.find((item) => item.id === selectedSkill) ?? matrix[0];
  const strong = matrix.filter((item) => item.state === "Strong").length;
  const solved = new Set(
    store.state.practiceAttempts
      .filter((item) => item.correct)
      .map((item) => item.challengeId),
  ).size;
  const retained = store.state.reviewSchedule.filter(
    (item) => item.streak > 0,
  ).length;
  const retention = store.state.reviewSchedule.length
    ? Math.round((retained / store.state.reviewSchedule.length) * 100)
    : 0;
  const analytics = [
    [
      "Study time",
      `${Math.floor(store.state.learnedMinutes / 60)}h ${store.state.learnedMinutes % 60}m`,
      "Recorded learning sessions",
    ],
    [
      "Topics completed",
      String(store.state.completedLessons.length),
      "Completion, not mastery",
    ],
    ["Topics strong", String(strong), "Multiple evidence types"],
    [
      "Practice attempts",
      String(store.state.practiceAttempts.length),
      `${accuracy}% answer accuracy`,
    ],
    ["Problems solved", String(solved), "Unique correct challenges"],
    [
      "Project milestones",
      String(store.metrics.completedTasks),
      "Saved build evidence",
    ],
    [
      "Review retention",
      `${retention}%`,
      `${retained}/${store.state.reviewSchedule.length} recalled`,
    ],
    [
      "Interview attempts",
      String(store.state.interviewResults.length),
      `${store.metrics.interviewAverage}% average rubric score`,
    ],
  ];
  const recentDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - index));
    return date;
  });
  return (
    <div className="page">
      <section className="page-title">
        <div>
          <span className="eyebrow">YOUR PROGRESS</span>
          <h1>
            See what you have <span className="gradient-text">practiced</span>
          </h1>
          <p>
            Your scores come from lessons, practice, projects, reviews, and
            interviews.
          </p>
        </div>
        <div className="mastery-hero">
          <div>
            <span>Current evidence state</span>
            <b>{store.metrics.masteryState}</b>
            <small>{store.metrics.mastery}% of evidence types present</small>
          </div>
          <Target />
        </div>
      </section>
      <div className="analytics-grid">
        {analytics.map(([label, value, detail]) => (
          <article className="panel analytics-card" key={label}>
            <span>{label}</span>
            <b>{value}</b>
            <small>{detail}</small>
          </article>
        ))}
      </div>
      <section className="weekly-activity panel">
        <div>
          <span className="eyebrow">LAST SEVEN DAYS</span>
          <h2>Weekly activity</h2>
          <p>
            Activity marks days with saved learning evidence. Empty days are
            information, not a penalty.
          </p>
        </div>
        <div className="activity-bars">
          {recentDays.map((date) => {
            const key = date.toISOString().slice(0, 10);
            const active = store.state.activityDates.includes(key);
            return (
              <div key={key}>
                <i
                  style={{ height: active ? "100%" : "12%" }}
                  className={active ? "active" : ""}
                />
                <span>
                  {date.toLocaleDateString(undefined, { weekday: "short" })}
                </span>
              </div>
            );
          })}
        </div>
      </section>
      <section className="skill-matrix-layout">
        <article className="panel skill-matrix">
          <div>
            <span className="eyebrow">SKILL MATRIX</span>
            <h2>State backed by evidence</h2>
          </div>
          {matrix.map((skill) => (
            <button
              key={skill.id}
              className={selected.id === skill.id ? "active" : ""}
              onClick={() => setSelectedSkill(skill.id)}
            >
              <span>
                <b>{skill.name}</b>
                <small>{skill.evidence[0] ?? "No evidence saved yet"}</small>
              </span>
              <strong
                className={`skill-state ${skill.state.toLowerCase().replace(" ", "-")}`}
              >
                {skill.state}
              </strong>
            </button>
          ))}
        </article>
        <aside className="panel skill-evidence-detail">
          <span className="eyebrow">WHY THIS STATE</span>
          <h2>{selected.name}</h2>
          <strong
            className={`skill-state ${selected.state.toLowerCase().replace(" ", "-")}`}
          >
            {selected.state}
          </strong>
          {selected.evidence.length ? (
            <ul>
              {selected.evidence.map((item) => (
                <li key={item}>
                  <CheckCircle2 /> {item}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              Forge has no saved evidence for this skill yet. Self-reported
              experience does not mark it mastered.
            </p>
          )}
          <button
            className="primary-button"
            onClick={() => navigate(selected.action)}
          >
            Build {selected.name} evidence <ArrowRight />
          </button>
        </aside>
      </section>
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

type MentorMessage = {
  role: "mentor" | "user";
  text: string;
  sources?: string[];
};
const stopWords = new Set(
  "a an and are as at be by can do for from how i in is it of on or that the this to what when where which why with you your".split(
    " ",
  ),
);
const terms = (value: string) =>
  Array.from(
    new Set(
      value
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s-]/g, " ")
        .split(/\s+/)
        .filter((term) => term.length > 1 && !stopWords.has(term)),
    ),
  );

export function MentorPage({
  store,
  navigate,
}: {
  store: ForgeStore;
  navigate: (id: NavId) => void;
}) {
  const [messages, setMessages] = useState<MentorMessage[]>([
      {
        role: "mentor" as const,
        text: "I am your trainable Forge Tutor. Ask about the course or add your own notes below. I retrieve the most relevant material first and clearly say when the answer is only general guidance.",
      },
    ]),
    [input, setInput] = useState(""),
    [trainingOpen, setTrainingOpen] = useState(false),
    [sourceTitle, setSourceTitle] = useState(""),
    [sourceBody, setSourceBody] = useState("");
  const trainingSources = store.state.knowledge.filter(
    (entry) => entry.topic === "AI Tutor Source",
  );
  const courseSources = useMemo(
    () =>
      curriculumPhases.flatMap((phase) =>
        phase.modules.flatMap((module) =>
          module.topics.map((topic) => ({
            title: topic,
            body: `${phase.title}. ${phase.description} Section: ${module.title}. Topic: ${topic}.`,
          })),
        ),
      ),
    [],
  );
  const answerQuestion = (question: string) => {
    const queryTerms = terms(question);
    const candidates = [
      ...trainingSources.map((entry) => ({
        title: entry.title,
        body: entry.body,
        custom: true,
      })),
      ...courseSources.map((entry) => ({ ...entry, custom: false })),
    ]
      .map((source) => ({
        ...source,
        score: queryTerms.reduce(
          (score, term) =>
            score +
            (terms(`${source.title} ${source.body}`).includes(term)
              ? source.title.toLowerCase().includes(term)
                ? 3
                : 1
              : 0),
          0,
        ),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    const relevant = candidates.filter((source) => source.score > 0);
    if (!relevant.length)
      return {
        text: `I could not find “${question}” in your course or added sources. General guidance: define the goal, list what you already know, test the smallest example, and verify the answer with an official source. Add trusted material to Train your tutor if you want grounded answers on this subject.`,
        sources: ["General guidance — not from your training data"],
      };
    const best = relevant[0];
    const customContext = relevant
      .filter((source) => source.custom)
      .map((source) => source.body)
      .join(" ")
      .slice(0, 700);
    return {
      text: customContext
        ? `Based on your training material, the key idea is: ${customContext} To apply it to “${question}”, start with the smallest working example, state the expected result, then test the normal, edge, and failure cases. If the result affects production, also check security, performance, and observability.`
        : `This is covered in ${best.title}. It belongs to ${best.body} A strong answer should explain the idea in plain language, show one concrete example, name a common failure, and describe how you would test or verify it. Open the matching lesson for the full guided explanation and practice.`,
      sources: relevant.map(
        (source) =>
          `${source.custom ? "Your source" : "Forge course"}: ${source.title}`,
      ),
    };
  };
  const send = (text: string) => {
    if (!text.trim()) return;
    const reply = mentorReplies[text]
      ? { text: mentorReplies[text], sources: ["Forge guided coaching"] }
      : answerQuestion(text);
    setMessages((c) => [
      ...c,
      { role: "user" as const, text },
      {
        role: "mentor" as const,
        ...reply,
      },
    ]);
    setInput("");
  };
  return (
    <div className="page">
      <section className="page-title">
        <div>
          <span className="eyebrow">LEARNING HELP</span>
          <h1>
            Work through a problem with{" "}
            <span className="gradient-text">guided help</span>
          </h1>
          <p>Get simple questions and hints that help you find the answer.</p>
        </div>
        <div className="local-badge">
          <CheckCircle2 /> Private local RAG
        </div>
      </section>
      <div className="mentor-layout">
        <aside className="mentor-context panel">
          <span className="eyebrow">CURRENT TOPIC</span>
          <h2>JavaScript event loop</h2>
          <div className="context-stat">
            <span>Progress</span>
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
          <button
            className="secondary-button mentor-train-button"
            onClick={() => setTrainingOpen((open) => !open)}
            aria-expanded={trainingOpen}
          >
            <Upload /> {trainingOpen ? "Close trainer" : "Train your tutor"}
          </button>
        </aside>
        <article className="mentor-chat panel">
          <div className="chat-header">
            <div className="mentor-orb">
              <Sparkles />
            </div>
            <div>
              <b>Forge Mentor</b>
              <span>
                Ready · {courseSources.length + trainingSources.length} indexed
                sources
              </span>
            </div>
            <button
              onClick={() =>
                setMessages([
                  {
                    role: "mentor" as const,
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
                {m.sources?.length ? (
                  <div className="mentor-citations">
                    {m.sources.map((source) => (
                      <span key={source}>{source}</span>
                    ))}
                  </div>
                ) : null}
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
            <button
              disabled={!input.trim()}
              aria-label="Send message to Forge Mentor"
            >
              <ArrowRight aria-hidden="true" />
            </button>
          </form>
        </article>
      </div>
      {trainingOpen && (
        <section
          className="mentor-training panel"
          aria-labelledby="mentor-training-title"
        >
          <div className="section-head">
            <div>
              <span className="eyebrow teal">YOUR KNOWLEDGE BASE</span>
              <h2 id="mentor-training-title">
                Train the tutor with your content
              </h2>
            </div>
            <span>{trainingSources.length} custom sources</span>
          </div>
          <p>
            Paste notes, documentation, policies, or project knowledge. It stays
            in this browser and is searched together with all{" "}
            {courseSources.length} course topics.
          </p>
          <div className="mentor-training-form">
            <label>
              Source title
              <input
                value={sourceTitle}
                onChange={(event) => setSourceTitle(event.target.value)}
                placeholder="Example: Our API authentication guide"
              />
            </label>
            <label>
              Training content
              <textarea
                value={sourceBody}
                onChange={(event) => setSourceBody(event.target.value)}
                placeholder="Paste accurate, trusted content here…"
              />
            </label>
            <button
              className="primary-button"
              disabled={
                sourceTitle.trim().length < 3 || sourceBody.trim().length < 40
              }
              onClick={() => {
                store.addKnowledge({
                  kind: "note",
                  title: sourceTitle.trim(),
                  body: sourceBody.trim(),
                  topic: "AI Tutor Source",
                });
                setSourceTitle("");
                setSourceBody("");
              }}
            >
              <Plus /> Add to knowledge base
            </button>
          </div>
          <div className="mentor-source-list">
            {trainingSources.map((source) => (
              <article key={source.id}>
                <div>
                  <b>{source.title}</b>
                  <span>
                    {source.body.slice(0, 120)}
                    {source.body.length > 120 ? "…" : ""}
                  </span>
                </div>
                <button
                  onClick={() => store.deleteKnowledge(source.id)}
                  aria-label={`Remove ${source.title}`}
                >
                  <Trash2 />
                </button>
              </article>
            ))}
            {!trainingSources.length && (
              <div className="mentor-empty-source">
                No custom content yet. The tutor can still search the complete
                Forge curriculum.
              </div>
            )}
          </div>
          <aside className="mentor-trust-note">
            <Lightbulb />
            <span>
              <b>Reliable by design:</b> answers show their sources. Local
              retrieval is fast and private, but it is not a replacement for a
              reasoning language model; uncertain or unrelated questions are
              labeled as general guidance.
            </span>
          </aside>
        </section>
      )}
    </div>
  );
}

export function ProjectsHub({
  store,
  notify,
  openCodeWorkspace,
}: PageProps & {
  openCodeWorkspace: (project: { id: string; title: string }) => void;
}) {
  const [filter, setFilter] = useState("All projects"),
    [selected, setSelected] = useState<string | null>(null);
  const recommendedStarted = (store.state.projectTasks.p05?.length ?? 0) > 0;
  const visible = projectCards.filter(
    (p) =>
      filter === "All projects" ||
      (filter === "In progress" &&
        (store.state.projectTasks[p.id]?.length ?? 0) > 0) ||
      (filter === "Frontend" &&
        ["Frontend", "JavaScript", "React", "Angular"].includes(p.type)) ||
      (filter === "Backend" && p.type === "Backend") ||
      (filter === "AI enabled" && p.type.includes("AI")),
  );
  return (
    <>
      <div className="page">
        <section className="page-title">
          <div>
            <span className="eyebrow">LEARN BY BUILDING</span>
            <h1>
              Project <span className="gradient-text">workshop</span>
            </h1>
            <p>
              Build real projects one clear step at a time. Your work is saved.
            </p>
          </div>
          <button className="primary-button" onClick={() => setSelected("p05")}>
            {recommendedStarted ? "Continue P05" : "Start P05"}
            <ArrowRight aria-hidden="true" />
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
              aria-pressed={filter === x}
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
            const ProjectIcon =
              p.type === "Angular" || p.type === "React"
                ? BarChart3
                : p.type === "Backend"
                  ? Database
                  : p.type.includes("AI")
                    ? BrainCircuit
                    : Search;
            return (
              <article className={`project-card panel ${p.accent}`} key={p.id}>
                <div className="project-card-head">
                  <span className="project-code">{p.code}</span>
                  <span className="status-pill active">
                    {progress ? "In progress" : "Up next"}
                  </span>
                </div>
                <div className="project-symbol">
                  <ProjectIcon aria-hidden="true" />
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
                    <CheckCircle2 aria-hidden="true" />
                    {done} of {tasks.length} steps
                  </span>
                  <span>
                    <Clock3 aria-hidden="true" />
                    {p.hours}
                  </span>
                  <button
                    className="project-open-button"
                    onClick={() => setSelected(p.id)}
                    aria-label={`Open ${p.title}`}
                  >
                    <span>Open project</span>
                    <ArrowRight aria-hidden="true" />
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
          openCodeWorkspace={openCodeWorkspace}
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
  openCodeWorkspace,
}: {
  projectId: string;
  store: ForgeStore;
  close: () => void;
  notify: (text: string) => void;
  openCodeWorkspace: (project: { id: string; title: string }) => void;
}) {
  const [tab, setTab] = useState("Steps"),
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
          <button
            className="workspace-close"
            onClick={close}
            aria-label="Close project workspace"
          >
            <X aria-hidden="true" />
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
        <button
          className="primary-button project-code-workspace-action"
          onClick={() => openCodeWorkspace({ id: projectId, title })}
        >
          <Code2 /> Open coding workspace
        </button>
        <main className="workspace-main">
          <aside className="workspace-nav panel">
            {[
              "Overview",
              "Steps",
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
            {tab === "Steps" ? (
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
                            ? "Project step reopened"
                            : "Project step complete — +20 XP",
                        );
                      }}
                    >
                      <span>{complete ? <Check /> : i + 1}</span>
                      <div>
                        <b>{task}</b>
                        <small>
                          Build it, test it, and save what you learned.
                        </small>
                      </div>
                      <em>{complete ? "Complete" : "Mark done"}</em>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="workspace-tab">
                <BrainCircuit />
                <span className="eyebrow teal">GUIDED PROJECT COACH</span>
                <h3>{projectGuidance[tab]?.goal ?? `${tab} workspace`}</h3>
                <p>
                  Use this checklist for <b>{title}</b>. Complete it with your
                  own evidence instead of only marking tasks done.
                </p>
                <ol className="project-guidance-list">
                  {(
                    projectGuidance[tab]?.actions ?? [
                      "Describe the goal",
                      "Do the work",
                      "Save evidence",
                    ]
                  ).map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ol>
                <aside className="project-evidence-callout">
                  <Target />
                  <div>
                    <b>Evidence to save</b>
                    <span>
                      {projectGuidance[tab]?.evidence ??
                        "Notes and a tested result."}
                    </span>
                  </div>
                </aside>
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

export function InterviewTrainer({ store, notify }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="page loading-page panel">
          Opening Interview Academy…
        </div>
      }
    >
      <InterviewAcademy store={store} notify={notify} />
    </Suspense>
  );
}

export function LearningExperience({
  store,
  notify,
  navigate,
}: PageProps & { navigate: (id: NavId) => void }) {
  const { setLearningPosition } = store;
  const savedTab = store.state.currentPosition.section.startsWith(
    "Visualization",
  )
    ? "visual"
    : store.state.currentPosition.section.startsWith("Knowledge")
      ? "check"
      : "lesson";
  const [level, setLevel] = useState(0),
    [tab, setTab] = useState<"lesson" | "visual" | "check">(savedTab),
    [step, setStep] = useState(0),
    [answer, setAnswer] = useState(""),
    [feedback, setFeedback] = useState(""),
    complete = store.state.completedLessons.includes("js-event-loop");
  useEffect(() => {
    setLearningPosition({
      page: "learn",
      course: "JavaScript",
      module: "Asynchronous JavaScript",
      lesson: "How the event loop really works",
      section:
        tab === "visual"
          ? `Visualization · Step ${step + 1}`
          : tab === "check"
            ? "Knowledge check"
            : `${["Beginner", "Technical", "Practical", "Advanced", "Interview"][level]} explanation`,
    });
  }, [level, setLearningPosition, step, tab]);
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
  const [now] = useState(() => Date.now());
  const scheduled = [...store.state.reviewSchedule].sort(
    (a, b) =>
      new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime(),
  );
  const due = scheduled.filter(
    (item) => new Date(item.nextReviewAt).getTime() <= now,
  );
  const labels = {
    again: "Again · 10 min",
    hard: "Hard · 1 day",
    good: "Good",
    easy: "Easy",
  } as const;
  return (
    <div className="page">
      <section className="page-title">
        <div>
          <span className="eyebrow">REVIEW AT THE RIGHT TIME</span>
          <h1>
            Make knowledge <span className="gradient-text">stick</span>
          </h1>
          <p>
            Weak answers return sooner. Confident recall earns a longer gap.
            Signed-in schedules sync across devices.
          </p>
        </div>
        <div className="review-summary">
          <div>
            <b>{due.length}</b>
            <span>due now</span>
          </div>
        </div>
      </section>
      <div className="review-queue panel">
        {due.map((item, index) => (
          <article className="queue-row review-due-row" key={item.id}>
            <div className={`review-icon r${index % 4}`}>
              <RotateCcw />
            </div>
            <div className="queue-main">
              <b>{item.topic}</b>
              <span>
                {item.kind} recall ·{" "}
                {item.streak
                  ? `${item.streak} successful recalls`
                  : "new weak signal"}
              </span>
            </div>
            <div
              className="review-ratings"
              aria-label={`Rate recall for ${item.topic}`}
            >
              {(Object.keys(labels) as (keyof typeof labels)[]).map(
                (rating) => (
                  <button
                    key={rating}
                    onClick={() => {
                      store.rateReview(item.id, rating);
                      notify(`Next review scheduled: ${labels[rating]}`);
                    }}
                  >
                    {labels[rating]}
                  </button>
                ),
              )}
            </div>
          </article>
        ))}
        {!due.length && (
          <div className="review-empty">
            <CheckCircle2 />
            <div>
              <b>You are caught up</b>
              <span>
                {scheduled.length
                  ? `Next review ${new Date(scheduled[0].nextReviewAt).toLocaleString()}.`
                  : "Weak quiz, coding, and interview signals will appear here automatically."}
              </span>
            </div>
          </div>
        )}
        <div className="review-recommendations">
          <span className="eyebrow">OPTIONAL PRACTICE</span>
          {reviewItems.slice(0, 3).map((item, index) => (
            <button
              key={item.title}
              onClick={() => navigate(index === 1 ? "practice" : "learn")}
            >
              <span>
                <b>{item.title}</b>
                <small>{item.type}</small>
              </span>
              <ArrowRight />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
