import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  Code2,
  Lightbulb,
  NotebookPen,
  Target,
} from "lucide-react";
import type { CurriculumModule, CurriculumPhase } from "./curriculumCatalog";
import type { ForgeStore } from "./useForgeStore";
import { catalogLessonId } from "./topicIds";

type Guidance = {
  mentalModel: string;
  production: string;
  quality: string;
  example: string;
};
const guidance: Record<string, Guidance> = {
  orientation: {
    mentalModel:
      "Trace the system from human intent to an exact instruction, then identify the tool that executes it and the feedback it returns.",
    production:
      "Professional developers make environments repeatable, keep changes versioned, and use diagnostic evidence instead of guessing.",
    quality:
      "Prefer reversible steps, meaningful names, small changes, and written verification.",
    example: "# Observe before changing\npwd\nls\ngit status",
  },
  web: {
    mentalModel:
      "Start with the document’s meaning, apply layout and presentation, then verify the result with keyboard, responsive, and accessibility checks.",
    production:
      "Production pages must remain understandable without styling, adapt to screen and text size, and communicate every interactive state.",
    quality:
      "Use semantic HTML first, predictable CSS rules, visible focus, sufficient contrast, and progressive enhancement.",
    example:
      '<main>\n  <h1>Meaning before styling</h1>\n  <button type="button">Continue</button>\n</main>',
  },
  javascript: {
    mentalModel:
      "Follow values through expressions and function calls. Track scope, mutation, control flow, and asynchronous boundaries explicitly.",
    production:
      "Application code must handle invalid input, loading, success, empty, and failure states without blocking the main thread.",
    quality:
      "Prefer small pure functions, explicit data transformations, immutable updates, and tests at observable boundaries.",
    example:
      "function transform(input) {\n  if (input == null) throw new Error('Input required');\n  return { value: input, updatedAt: Date.now() };\n}",
  },
  typescript: {
    mentalModel:
      "Treat a type as a set of allowed values and use narrowing to prove which member exists before an operation.",
    production:
      "Types should model valid domain states, preserve information at boundaries, and make invalid combinations difficult to represent.",
    quality:
      "Avoid any, validate unknown external data, prefer discriminated unions, and keep public types intentional.",
    example:
      "type Result<T> =\n  | { status: 'ok'; data: T }\n  | { status: 'error'; message: string };",
  },
  frontend: {
    mentalModel:
      "UI is a projection of state. Identify the source of truth, events that change it, and the render output for every state.",
    production:
      "A production interface must be accessible, resilient to slow or failed data, testable, and measurable under realistic load.",
    quality:
      "Keep state close to its owner, use semantic controls, avoid unnecessary effects, and measure before optimizing.",
    example:
      "function Status({loading}:{loading:boolean}) {\n  return loading ? <p>Loading…</p> : <p>Ready</p>;\n}",
  },
  backend: {
    mentalModel:
      "Trace a request through transport, validation, authorization, domain logic, persistence, and the response.",
    production:
      "Services must protect ownership, validate at trust boundaries, handle retries safely, and emit useful logs and metrics.",
    quality:
      "Separate controllers from domain logic, use transactions for atomic work, parameterize queries, and return consistent errors.",
    example:
      "app.post('/items', validate(inputSchema), async (req, res) => {\n  const item = await service.create(req.user.id, req.body);\n  res.status(201).json(item);\n});",
  },
  "system-design": {
    mentalModel:
      "Begin with requirements and constraints, estimate scale, define interfaces and data flow, then identify bottlenecks and failure modes.",
    production:
      "Good designs state trade-offs, degradation behavior, security boundaries, observability, and recovery procedures.",
    quality:
      "Do not add distributed components without a requirement; every cache, queue, replica, and partition adds consistency and operational costs.",
    example:
      "Client → API gateway → Service → Database\n                    ↘ Queue → Worker",
  },
  python: {
    mentalModel:
      "Follow objects, types, control flow, and exceptions; distinguish the language runtime from installed packages and environments.",
    production:
      "Pin dependencies, isolate environments, add type hints and tests, and make data-processing steps deterministic and observable.",
    quality:
      "Prefer clear functions, context managers for resources, explicit exception handling, and vectorized data operations when appropriate.",
    example:
      "def normalize(value: float, maximum: float) -> float:\n    if maximum == 0:\n        raise ValueError('maximum must be non-zero')\n    return value / maximum",
  },
  "machine-learning": {
    mentalModel:
      "Define the prediction task, data and metric first; split data correctly; build a baseline; then improve through measured experiments.",
    production:
      "Model quality depends on representative data, leakage prevention, reproducible pipelines, monitoring, and a safe fallback.",
    quality:
      "Compare against a baseline, keep test data untouched, report more than one metric, and inspect errors by meaningful slices.",
    example:
      "pipeline.fit(X_train, y_train)\npredictions = pipeline.predict(X_valid)\nscore = metric(y_valid, predictions)",
  },
  "deep-learning": {
    mentalModel:
      "A model maps tensors through parameterized operations; loss measures error; gradients show how parameters should change.",
    production:
      "Training requires reproducible data, checkpoints, resource monitoring, validation, and documented inference constraints.",
    quality:
      "Inspect shapes, establish a small overfit test, monitor train/validation curves, and save preprocessing with the model.",
    example:
      "optimizer.zero_grad()\noutput = model(batch)\nloss = criterion(output, target)\nloss.backward()\noptimizer.step()",
  },
  llm: {
    mentalModel:
      "An LLM predicts tokens from context. The application supplies instructions and evidence, validates outputs, and controls any consequential action.",
    production:
      "Reliable LLM features need structured outputs, evaluation sets, timeouts, cost limits, safety checks, and graceful fallback.",
    quality:
      "Separate instructions from untrusted data, validate schemas, test adversarial inputs, and never treat fluent output as verified truth.",
    example:
      "const result = await model.generate({\n  input,\n  responseFormat: schema,\n  timeout: 10_000\n});",
  },
  rag: {
    mentalModel:
      "Ingest and segment sources, retrieve relevant evidence for a query, then generate an answer constrained by that evidence.",
    production:
      "Authorization must happen before retrieval. Systems should cite sources, abstain when evidence is weak, and measure retrieval separately from generation.",
    quality:
      "Evaluate chunking, recall, ranking, faithfulness, latency, and cost on a versioned question set.",
    example:
      "query → retrieve candidates → filter permissions\n      → rerank → build context → answer with citations",
  },
  agents: {
    mentalModel:
      "An agent observes state, selects a permitted action, executes a tool, evaluates the result, and repeats until a bounded stop condition.",
    production:
      "Tool access needs least privilege, schema validation, idempotency, budgets, audit logs, and human approval for high-impact actions.",
    quality:
      "Prefer deterministic workflows when steps are known; use agentic choice only where it creates measurable value.",
    example:
      "while (!done && steps < MAX_STEPS) {\n  const action = await policy.next(state);\n  state = await executeApproved(action);\n}",
  },
  "full-stack-ai": {
    mentalModel:
      "Trace identity, data, model context, streaming output, persistence, evaluation, and user feedback across the complete system.",
    production:
      "The product must enforce ownership, protect secrets, control cost, tolerate model failure, and expose evidence behind generated answers.",
    quality:
      "Use typed boundaries between UI, API, data, and AI providers; test deterministic rules separately from probabilistic quality.",
    example:
      "React UI → Typed API → Domain service\n                    ↘ AI gateway → Model\n                    ↘ PostgreSQL / Vector index",
  },
  devops: {
    mentalModel:
      "A delivery pipeline turns a versioned change into a repeatable artifact, verifies it, deploys it, observes it, and supports rollback.",
    production:
      "Secrets stay outside images and source control; deployments use health checks, staged rollout, monitoring, backups, and recovery tests.",
    quality:
      "Automate repeatable checks, pin tool versions, build immutable artifacts, and make rollback simpler than emergency repair.",
    example:
      "commit → lint/test → build image → scan\n       → deploy staging → verify → production",
  },
  career: {
    mentalModel:
      "Strong interview evidence connects a clear claim to a specific situation, action, measured result, and honest trade-off.",
    production:
      "Portfolio material should explain the problem, constraints, decisions, implementation, verification, and what you would improve.",
    quality:
      "Practise aloud, use real project evidence, quantify only what you measured, and adapt depth to the interviewer’s question.",
    example:
      "Context → Decision → Implementation → Evidence\n        → Trade-off → Next improvement",
  },
};
export function CatalogTopicLesson({
  phase,
  module,
  topic,
  position,
  store,
  onBack,
  onSelect,
}: {
  phase: CurriculumPhase;
  module: CurriculumModule;
  topic: string;
  position: number;
  store: ForgeStore;
  onBack: () => void;
  onSelect: (topic: string, index: number) => void;
}) {
  const guide = guidance[phase.id] ?? guidance.orientation;
  const lessonId = catalogLessonId(phase.id, module.id, topic);
  const complete = store.state.completedLessons.includes(lessonId);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [note, setNote] = useState("");
  const options = useMemo(
    () => [
      `Study ${topic} in the context of ${module.title}, practise it, and verify the result`,
      `Memorize the name ${topic} without applying it`,
      "Skip directly to tools and ignore the underlying model",
      "Assume production behavior without testing failure cases",
    ],
    [module.title, topic],
  );
  const correct = options[0];
  const previous = module.topics[position - 1],
    next = module.topics[position + 1];
  return (
    <div className="page catalog-lesson">
      <button className="back-link" onClick={onBack}>
        <ChevronLeft /> {phase.title} · {module.title}
      </button>
      <section className="curriculum-head">
        <div>
          <span className="eyebrow teal">
            {phase.title.toUpperCase()} · TOPIC {position + 1}
          </span>
          <h1>{topic}</h1>
          <p>
            A complete guided introduction within {module.title}, available
            without prerequisite locking.
          </p>
        </div>
        <span className={`status-pill ${complete ? "complete" : "active"}`}>
          {complete ? "Completed" : "In progress"}
        </span>
      </section>
      <main className="catalog-lesson-body">
        <section className="lesson-overview panel">
          <div>
            <Target />
            <span>
              <b>Learning goal</b>Explain {topic}, place it in the wider system,
              and apply it deliberately.
            </span>
          </div>
          <div>
            <BookOpen />
            <span>
              <b>Context</b>
              {module.title} · {phase.title}
            </span>
          </div>
          <div>
            <CheckCircle2 />
            <span>
              <b>Completion</b>Read, practise, and pass the checkpoint.
            </span>
          </div>
        </section>
        <section className="lesson-section panel">
          <span className="eyebrow">WHAT IS IT?</span>
          <h2>Understand {topic} in context</h2>
          <p>
            <b>{topic}</b> is one part of {module.title}. {phase.description}{" "}
            Learn this topic by identifying the problem it solves, the inputs it
            receives, the result it produces, and the constraints or failure
            modes that affect that result.
          </p>
          <p>
            Do not learn it as an isolated definition. Connect it to{" "}
            {previous ?? "the module foundation"} before it and{" "}
            {next ?? "the module assessment"} after it.
          </p>
        </section>
        <section className="lesson-section panel">
          <span className="eyebrow">MENTAL MODEL</span>
          <h2>How to reason about it</h2>
          <p>{guide.mentalModel}</p>
          <pre className="code-block">
            <code>{guide.example}</code>
          </pre>
        </section>
        <section className="lesson-section panel">
          <span className="eyebrow">PRODUCTION PERSPECTIVE</span>
          <h2>Use it beyond a tutorial</h2>
          <p>{guide.production}</p>
          <div className="challenge-callout">
            <Lightbulb />
            <div>
              <b>Quality rule</b>
              <p>{guide.quality}</p>
            </div>
          </div>
        </section>
        <section className="lesson-section panel">
          <span className="eyebrow">DELIBERATE PRACTICE</span>
          <h2>Apply {topic}</h2>
          <ol>
            <li>
              Explain {topic} in your own words without using the topic name in
              the first sentence.
            </li>
            <li>
              Draw or list its inputs, processing steps, outputs, and two
              failure cases.
            </li>
            <li>
              Create the smallest example that demonstrates the idea, then
              change one assumption and predict the result.
            </li>
            <li>
              Describe where this appears in a production {phase.title} system
              and how you would verify it.
            </li>
          </ol>
          <div className="challenge-callout">
            <Code2 />
            <div>
              <b>Challenge</b>
              <p>
                Build or diagram a small example of {topic}. Include one normal
                case, one edge case, and a short explanation of the trade-off
                you made.
              </p>
            </div>
          </div>
        </section>
        <section className="lesson-section quiz-card panel">
          <span className="eyebrow teal">REQUIRED CHECKPOINT</span>
          <h2>Which learning approach produces useful evidence for {topic}?</h2>
          <div className="challenge-options">
            {options.map((option) => (
              <button
                key={option}
                disabled={checked}
                className={`${answer === option ? "selected" : ""} ${checked && option === correct ? "correct" : ""}`}
                onClick={() => setAnswer(option)}
              >
                {option}
                {checked && option === correct && <Check />}
              </button>
            ))}
          </div>
          {checked && (
            <div
              className={`quiz-feedback ${answer === correct ? "success" : "error"}`}
            >
              <Lightbulb />
              <p>
                {answer === correct
                  ? "Correct. Understanding requires context, application, and verification."
                  : "Review the practice sequence: explanation alone is not evidence that you can apply the topic."}
              </p>
            </div>
          )}
          <div className="learning-actions">
            <button
              disabled={!answer || checked}
              onClick={() => {
                setChecked(true);
                store.saveAttempt({
                  challengeId: `${lessonId}-check`,
                  answer,
                  correct: answer === correct,
                });
              }}
            >
              Check answer
            </button>
          </div>
        </section>
        <section className="lesson-section panel">
          <span className="eyebrow">YOUR NOTES</span>
          <h2>Capture your explanation</h2>
          <textarea
            className="topic-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={`Explain ${topic}, record an example, or note a question…`}
          />
          <button
            className="secondary-button"
            disabled={!note.trim()}
            onClick={() => {
              store.addKnowledge({
                kind: "note",
                title: topic,
                body: note,
                topic: phase.title,
              });
              setNote("");
            }}
          >
            <NotebookPen /> Save note
          </button>
        </section>
        <footer className="topic-navigation panel">
          <button
            disabled={!previous}
            onClick={() => previous && onSelect(previous, position - 1)}
          >
            <ArrowLeft />{" "}
            <span>
              <small>Previous</small>
              {previous ?? "Start of module"}
            </span>
          </button>
          <button
            className="primary-button"
            disabled={!checked || answer !== correct || complete}
            onClick={() => store.completeLesson(lessonId)}
          >
            {complete ? "Completed" : "Mark topic complete"}
            <Check />
          </button>
          <button
            disabled={!next}
            onClick={() => next && onSelect(next, position + 1)}
          >
            <span>
              <small>Next</small>
              {next ?? "End of module"}
            </span>
            <ArrowRight />
          </button>
        </footer>
      </main>
    </div>
  );
}
