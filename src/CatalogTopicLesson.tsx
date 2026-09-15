import { useEffect, useMemo, useState } from "react";
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
import { getTopicKnowledge } from "./topicKnowledge";
import { getTopicSubtopics, type LearningSubtopic } from "./topicSubtopics";

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
  onSelect: (module: CurriculumModule, topic: string, index: number) => void;
}) {
  const guide = guidance[phase.id] ?? guidance.orientation;
  const knowledge = getTopicKnowledge(phase.id, topic);
  const lessonId = catalogLessonId(phase.id, module.id, topic);
  const complete = store.state.completedLessons.includes(lessonId);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [note, setNote] = useState("");
  const [subtopicIndex, setSubtopicIndex] = useState(0);
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
  const topicSubtopics = useMemo<LearningSubtopic[]>(() => {
    const authored = getTopicSubtopics(phase.id, topic);
    if (authored) return authored;
    const processSteps = (knowledge?.steps ?? []).map((step, index) => ({
      id: `process-${index + 1}`,
      title: `Process ${index + 1}`,
      explanation: step,
      example: knowledge?.example ?? guide.example,
      practice: `Explain this step of ${topic}, predict one normal result, then identify one failure case and how you would verify it.`,
    }));
    return [
      {
        id: "foundation",
        title: "Foundation and purpose",
        explanation:
          knowledge?.definition ??
          `${topic} is part of ${module.title}. Start by understanding the problem it solves, its inputs, its output, and the vocabulary used to discuss it.`,
        example: knowledge?.realWorld ?? guide.mentalModel,
        practice: `Describe ${topic} in plain language and give one everyday analogy without copying the definition.`,
      },
      ...processSteps,
      {
        id: "application",
        title: "Real-world application",
        explanation: knowledge?.importance ?? guide.production,
        example: knowledge?.realWorld ?? guide.example,
        practice: `Find where ${topic} appears in a real product and draw the information flowing into and out of it.`,
      },
      {
        id: "professional",
        title: "Professional practice",
        explanation: `${guide.quality} ${guide.production}`,
        example: guide.example,
        practice: `Create a small ${topic} example with a normal case, an edge case, a verification step, and one documented trade-off.`,
      },
    ];
  }, [guide, knowledge, module.title, phase.id, topic]);
  const activeSubtopic = topicSubtopics[subtopicIndex];
  const phaseTopics = useMemo(
    () =>
      phase.modules.flatMap((phaseModule) =>
        phaseModule.topics.map((phaseTopic, phasePosition) => ({
          module: phaseModule,
          topic: phaseTopic,
          position: phasePosition,
        })),
      ),
    [phase],
  );
  const phaseTopicIndex = phaseTopics.findIndex(
    (item) => item.module.id === module.id && item.topic === topic,
  );
  const previousTopic = phaseTopics[phaseTopicIndex - 1];
  const nextTopic = phaseTopics[phaseTopicIndex + 1];
  const { setLearningPosition } = store;

  useEffect(() => {
    setLearningPosition({
      page: "learn",
      course: "Full-Stack + AI",
      module: module.title,
      lesson: topic,
      section: activeSubtopic.title,
    });
  }, [activeSubtopic.title, module.title, setLearningPosition, topic]);

  const selectSubtopic = (nextIndex: number) => {
    setSubtopicIndex(nextIndex);
    window.setTimeout(
      () =>
        document
          .getElementById("subtopic-learning")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      0,
    );
  };

  const goPrevious = () => {
    if (subtopicIndex > 0) selectSubtopic(subtopicIndex - 1);
    else if (previousTopic)
      onSelect(
        previousTopic.module,
        previousTopic.topic,
        previousTopic.position,
      );
  };

  const goNext = () => {
    if (subtopicIndex < topicSubtopics.length - 1)
      selectSubtopic(subtopicIndex + 1);
    else if (nextTopic)
      onSelect(nextTopic.module, nextTopic.topic, nextTopic.position);
  };
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
      <div className="catalog-learning-layout">
        <aside className="related-topics panel" aria-label="Related topics">
          <span className="eyebrow">RELATED TOPICS</span>
          <h2>{phase.title}</h2>
          <p>
            {phaseTopicIndex + 1} of {phaseTopics.length} topics · everything is
            open
          </p>
          <div className="related-topic-groups">
            {phase.modules.map((phaseModule, moduleIndex) => (
              <section key={phaseModule.id}>
                <div className="related-module-title">
                  <span>{String(moduleIndex + 1).padStart(2, "0")}</span>
                  <b>{phaseModule.title}</b>
                </div>
                {phaseModule.topics.map((phaseTopic, phasePosition) => {
                  const active =
                    phaseModule.id === module.id && phaseTopic === topic;
                  const finished = store.state.completedLessons.includes(
                    catalogLessonId(phase.id, phaseModule.id, phaseTopic),
                  );
                  const detailCount = getTopicSubtopics(
                    phase.id,
                    phaseTopic,
                  )?.length;
                  return (
                    <button
                      key={phaseTopic}
                      className={active ? "active" : ""}
                      aria-current={active ? "page" : undefined}
                      onClick={() =>
                        onSelect(phaseModule, phaseTopic, phasePosition)
                      }
                    >
                      <span>{finished ? <Check /> : phasePosition + 1}</span>
                      <span>
                        <b>{phaseTopic}</b>
                        <small>
                          {detailCount
                            ? `${detailCount} detailed subtopics`
                            : "Guided professional lesson"}
                        </small>
                      </span>
                    </button>
                  );
                })}
              </section>
            ))}
          </div>
        </aside>
        <main className="catalog-lesson-body">
          <section className="lesson-overview panel">
            <div>
              <Target />
              <span>
                <b>Learning goal</b>Explain {topic}, place it in the wider
                system, and apply it deliberately.
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
          <section
            className="lesson-section subtopic-workspace panel"
            id="subtopic-learning"
          >
            <div className="subtopic-picker">
              <span className="eyebrow">LEARN STEP BY STEP</span>
              <h2>{topicSubtopics.length} detailed subtopics</h2>
              <div className="subtopic-list">
                {topicSubtopics.map((subtopic, index) => (
                  <button
                    key={subtopic.id}
                    className={index === subtopicIndex ? "active" : ""}
                    aria-current={index === subtopicIndex ? "step" : undefined}
                    onClick={() => selectSubtopic(index)}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {subtopic.title}
                  </button>
                ))}
              </div>
            </div>
            <article className="subtopic-detail">
              <span className="eyebrow teal">
                SUBTOPIC {subtopicIndex + 1} OF {topicSubtopics.length}
              </span>
              <h2>{activeSubtopic.title}</h2>
              <p>{activeSubtopic.explanation}</p>
              <h3>Concrete example</h3>
              <pre className="code-block">
                <code>{activeSubtopic.example}</code>
              </pre>
              <div className="challenge-callout">
                <Code2 />
                <div>
                  <b>Practise this subtopic</b>
                  <p>{activeSubtopic.practice}</p>
                </div>
              </div>
              <div className="subtopic-actions">
                <button
                  disabled={!subtopicIndex && !previousTopic}
                  onClick={goPrevious}
                >
                  <ArrowLeft />
                  {subtopicIndex
                    ? "Previous subtopic"
                    : previousTopic
                      ? "Previous topic"
                      : "Start of phase"}
                </button>
                <button
                  className="primary-button"
                  disabled={
                    subtopicIndex === topicSubtopics.length - 1 && !nextTopic
                  }
                  onClick={goNext}
                >
                  {subtopicIndex < topicSubtopics.length - 1
                    ? "Next subtopic"
                    : nextTopic
                      ? "Continue to next topic"
                      : "End of phase"}
                  <ArrowRight />
                </button>
              </div>
            </article>
          </section>
          <section className="lesson-section panel">
            <span className="eyebrow">WHAT IS IT?</span>
            <h2>Understand {topic} in context</h2>
            <p>
              {knowledge?.definition ?? (
                <>
                  <b>{topic}</b> is one part of {module.title}.{" "}
                  {phase.description} Learn this topic by identifying the
                  problem it solves, the inputs it receives, the result it
                  produces, and the constraints or failure modes that affect
                  that result.
                </>
              )}
            </p>
            {knowledge && (
              <p>
                <b>Why it matters:</b> {knowledge.importance}
              </p>
            )}
            <p>
              Do not learn it as an isolated definition. Connect it to{" "}
              {previous ?? "the module foundation"} before it and{" "}
              {next ?? "the module assessment"} after it.
            </p>
          </section>
          {knowledge && (
            <section className="lesson-section panel">
              <span className="eyebrow">HOW IT WORKS · STEP BY STEP</span>
              <h2>Follow the process</h2>
              <ol className="numbered-process">
                {knowledge.steps.map((step, index) => (
                  <li key={step}>
                    <span>{index + 1}</span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
              <div className="challenge-callout">
                <Lightbulb />
                <div>
                  <b>Real-world example</b>
                  <p>{knowledge.realWorld}</p>
                </div>
              </div>
            </section>
          )}
          <section className="lesson-section panel">
            <span className="eyebrow">BEGINNER → PROFESSIONAL</span>
            <h2>Build understanding in four layers</h2>
            <div className="depth-grid">
              <article>
                <span>01 · BEGINNER</span>
                <h3>Recognize the idea</h3>
                <p>{guide.mentalModel}</p>
              </article>
              <article>
                <span>02 · INTERMEDIATE</span>
                <h3>Connect the moving parts</h3>
                <p>
                  For {topic}, identify the inputs, transformations, outputs,
                  dependencies, and observable failure states. Compare it with{" "}
                  {previous ?? "the foundation concept"} and explain why the
                  distinction matters.
                </p>
              </article>
              <article>
                <span>03 · ADVANCED</span>
                <h3>Reason about trade-offs</h3>
                <p>
                  {guide.quality} Measure correctness before optimizing and
                  state what becomes harder when the design grows.
                </p>
              </article>
              <article>
                <span>04 · PROFESSIONAL</span>
                <h3>Operate it in the real world</h3>
                <p>{guide.production}</p>
              </article>
            </div>
          </section>
          <section className="lesson-section panel">
            <span className="eyebrow">VISUAL MODEL</span>
            <h2>Place {topic} in the learning flow</h2>
            <div
              className="concept-flow"
              role="img"
              aria-label={`${previous ?? "Foundation"} leads to ${topic}, which prepares for ${next ?? "module assessment"}`}
            >
              <div>
                <small>INPUT KNOWLEDGE</small>
                <b>{previous ?? "Foundation"}</b>
              </div>
              <ArrowRight />
              <div className="active">
                <small>CURRENT TOPIC</small>
                <b>{topic}</b>
              </div>
              <ArrowRight />
              <div>
                <small>NEXT APPLICATION</small>
                <b>{next ?? "Module assessment"}</b>
              </div>
            </div>
            <p className="visual-caption">
              Ask at each arrow: what information moves forward, what assumption
              is required, and how would I detect an incorrect result?
            </p>
          </section>
          <section className="lesson-section panel">
            <span className="eyebrow">MENTAL MODEL</span>
            <h2>How to reason about it</h2>
            <p>{guide.mentalModel}</p>
            <pre className="code-block">
              <code>{knowledge?.example ?? guide.example}</code>
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
            <span className="eyebrow">COMMON MISTAKES + BEST PRACTICES</span>
            <h2>Avoid shallow understanding</h2>
            <div className="do-dont-grid">
              <div className="dont">
                <b>Common mistakes</b>
                <ul>
                  <li>
                    Memorizing the definition of {topic} without tracing a
                    concrete example.
                  </li>
                  <li>
                    Testing only the happy path and ignoring invalid, empty,
                    slow, or failed inputs.
                  </li>
                  <li>
                    Copying an implementation without being able to explain each
                    decision.
                  </li>
                  <li>
                    Optimizing before measuring correctness, clarity, or the
                    actual bottleneck.
                  </li>
                </ul>
              </div>
              <div className="do">
                <b>Professional habits</b>
                <ul>
                  <li>
                    Begin with a tiny working example and predict its result
                    before running it.
                  </li>
                  <li>
                    Name assumptions and verify behavior at observable
                    boundaries.
                  </li>
                  <li>
                    Compare at least two approaches and state the trade-off
                    explicitly.
                  </li>
                  <li>
                    Record the mistake, correction, and reusable rule in your
                    notes.
                  </li>
                </ul>
              </div>
            </div>
          </section>
          <section className="lesson-section panel">
            <span className="eyebrow">DELIBERATE PRACTICE</span>
            <h2>Apply {topic}</h2>
            <ol>
              {knowledge && (
                <li>
                  <b>Topic-specific exercise:</b> {knowledge.practice}
                </li>
              )}
              <li>
                Explain {topic} in your own words without using the topic name
                in the first sentence.
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
                  Build or diagram a small example of {topic}. Include one
                  normal case, one edge case, and a short explanation of the
                  trade-off you made.
                </p>
              </div>
            </div>
          </section>
          <section className="lesson-section quiz-card panel">
            <span className="eyebrow teal">REQUIRED CHECKPOINT</span>
            <h2>
              Which learning approach produces useful evidence for {topic}?
            </h2>
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
          <section className="lesson-section panel">
            <span className="eyebrow">INTERVIEW PREPARATION</span>
            <h2>Explain {topic} under pressure</h2>
            <ol>
              <li>
                <b>Beginner:</b> What is {topic}, and what problem does it
                solve?
              </li>
              <li>
                <b>Intermediate:</b> Walk through a concrete {topic} example
                step by step.
              </li>
              <li>
                <b>Advanced:</b> What alternatives exist, and when would you
                choose one?
              </li>
              <li>
                <b>Professional:</b> Describe a production failure involving{" "}
                {topic}. How would you detect, contain, and prevent it?
              </li>
            </ol>
            <div className="challenge-callout">
              <Lightbulb />
              <div>
                <b>Strong-answer structure</b>
                <p>
                  Definition → purpose → mental model → concrete example → edge
                  case → trade-off → verification.
                </p>
              </div>
            </div>
          </section>
          <section className="lesson-section panel">
            <span className="eyebrow">QUICK REVISION</span>
            <h2>Remember the durable ideas</h2>
            <ul>
              <li>
                {topic} belongs to {module.title} within {phase.title}.
              </li>
              <li>{guide.mentalModel}</li>
              <li>{guide.quality}</li>
              <li>
                Real mastery means you can explain, apply, debug, compare, and
                verify the concept without copying.
              </li>
            </ul>
          </section>
          <footer className="topic-navigation panel">
            <button
              disabled={!subtopicIndex && !previousTopic}
              onClick={goPrevious}
            >
              <ArrowLeft />{" "}
              <span>
                <small>
                  {subtopicIndex ? "Previous subtopic" : "Previous topic"}
                </small>
                {subtopicIndex
                  ? topicSubtopics[subtopicIndex - 1].title
                  : (previousTopic?.topic ?? "Start of phase")}
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
              disabled={
                subtopicIndex === topicSubtopics.length - 1 && !nextTopic
              }
              onClick={goNext}
            >
              <span>
                <small>
                  {subtopicIndex < topicSubtopics.length - 1
                    ? "Next subtopic"
                    : "Next topic"}
                </small>
                {subtopicIndex < topicSubtopics.length - 1
                  ? topicSubtopics[subtopicIndex + 1].title
                  : (nextTopic?.topic ?? "End of phase")}
              </span>
              <ArrowRight />
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
