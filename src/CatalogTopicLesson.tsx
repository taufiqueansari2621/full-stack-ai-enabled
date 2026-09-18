import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  PanelLeftClose,
  PanelLeftOpen,
  Target,
} from "lucide-react";
import type { CurriculumModule, CurriculumPhase } from "./curriculumCatalog";
import type { ForgeStore } from "./useForgeStore";
import { catalogLessonId } from "./topicIds";
import { getTopicKnowledge } from "./topicKnowledge";
import { getTopicSubtopics, type LearningSubtopic } from "./topicSubtopics";
import { DeepDiveLab } from "./DeepDiveLab";
import { InteractiveExampleLab } from "./InteractiveExampleLab";
import { MasteryStudio } from "./MasteryStudio";
import { getTopicExampleCases } from "./topicExampleCases";

const TopicResourcesPanel = lazy(() => import("./TopicResourcesPanel"));

type Guidance = {
  mentalModel: string;
  production: string;
  quality: string;
  example: string;
};
const guidance: Record<string, Guidance> = {
  orientation: {
    mentalModel:
      "Follow the path from what a person wants, to the exact instruction, to the tool that runs it, and finally to the result.",
    production:
      "In real work, developers use repeatable setups, save changes with Git, and inspect errors before changing code.",
    quality:
      "Make small changes, use clear names, keep an easy way back, and write down how you checked the result.",
    example: "# Observe before changing\npwd\nls\ngit status",
  },
  web: {
    mentalModel:
      "Start with the page’s meaning. Add layout and style. Then check it with a keyboard and at different screen sizes.",
    production:
      "A real website should still make sense without styling, work at every screen size, and clearly show loading, success, and errors.",
    quality:
      "Choose HTML elements by meaning, keep CSS predictable, show keyboard focus, and use readable color contrast.",
    example:
      '<main>\n  <h1>Meaning before styling</h1>\n  <button type="button">Continue</button>\n</main>',
  },
  javascript: {
    mentalModel:
      "Follow each value as the code runs. Note where it was created, when it changes, which path runs, and where work waits.",
    production:
      "Real apps must handle bad input, loading, success, empty results, and errors without freezing the page.",
    quality:
      "Use small functions, make data changes clear, avoid changing shared values directly, and test results a user can see.",
    example:
      "function transform(input) {\n  if (input == null) throw new Error('Input required');\n  return { value: input, updatedAt: Date.now() };\n}",
  },
  typescript: {
    mentalModel:
      "A type describes which values are allowed. Narrowing means checking the value before you use it in a specific way.",
    production:
      "In a real app, types should describe valid states and make impossible combinations hard to create.",
    quality:
      "Avoid `any`. Check data that comes from outside the app. Use clear types for each possible state.",
    example:
      "type Result<T> =\n  | { status: 'ok'; data: T }\n  | { status: 'error'; message: string };",
  },
  frontend: {
    mentalModel:
      "The screen shows the current data. Find where that data lives, what actions change it, and what the user sees after each change.",
    production:
      "A real interface must be accessible, handle slow or failed data, and stay testable when many people use it.",
    quality:
      "Keep data near the component that owns it, use proper HTML controls, and measure a real problem before optimizing.",
    example:
      "function Status({loading}:{loading:boolean}) {\n  return loading ? <p>Loading…</p> : <p>Ready</p>;\n}",
  },
  backend: {
    mentalModel:
      "Follow a request from the network, through input checks and permission checks, into the main logic and database, then back as a response.",
    production:
      "A real service must protect each user’s data, check outside input, retry safely, and record useful logs and measurements.",
    quality:
      "Keep request handling separate from business rules. Use safe database queries and return errors in one clear format.",
    example:
      "app.post('/items', validate(inputSchema), async (req, res) => {\n  const item = await service.create(req.user.id, req.body);\n  res.status(201).json(item);\n});",
  },
  "system-design": {
    mentalModel:
      "First list what the system must do and its limits. Estimate usage, draw how data moves, then find slow points and likely failures.",
    production:
      "A good real-world design explains its choices, what happens during failure, how it is monitored, and how it recovers.",
    quality:
      "Do not add a cache, queue, replica, or partition unless it solves a real need. Each one makes the system harder to operate.",
    example:
      "Client → API gateway → Service → Database\n                    ↘ Queue → Worker",
  },
  python: {
    mentalModel:
      "Follow values and the path the code takes. Keep Python itself, installed packages, and the project environment as separate ideas.",
    production:
      "For real projects, lock package versions, use a separate environment, add type hints and tests, and log each data step.",
    quality:
      "Prefer clear functions, context managers for resources, explicit exception handling, and vectorized data operations when appropriate.",
    example:
      "def normalize(value: float, maximum: float) -> float:\n    if maximum == 0:\n        raise ValueError('maximum must be non-zero')\n    return value / maximum",
  },
  "machine-learning": {
    mentalModel:
      "First define what you want to predict, which data you will use, and how success is measured. Build a simple first model, then improve it with tests.",
    production:
      "Model quality depends on representative data, leakage prevention, reproducible pipelines, monitoring, and a safe fallback.",
    quality:
      "Compare against a baseline, keep test data untouched, report more than one metric, and inspect errors by meaningful slices.",
    example:
      "pipeline.fit(X_train, y_train)\npredictions = pipeline.predict(X_valid)\nscore = metric(y_valid, predictions)",
  },
  "deep-learning": {
    mentalModel:
      "A model changes input tensors through layers. The loss measures the error, and gradients show how the model should change to reduce it.",
    production:
      "Real training needs repeatable data, saved checkpoints, resource monitoring, validation, and clear limits for live predictions.",
    quality:
      "Check tensor shapes, first prove the model can learn a tiny sample, compare training and validation results, and save data preparation with the model.",
    example:
      "optimizer.zero_grad()\noutput = model(batch)\nloss = criterion(output, target)\nloss.backward()\noptimizer.step()",
  },
  llm: {
    mentalModel:
      "A large language model (LLM) predicts the next pieces of text from the information it receives. The app must check its output before using it.",
    production:
      "A reliable LLM feature needs a clear output format, test questions, time limits, cost limits, safety checks, and a backup when it fails.",
    quality:
      "Keep instructions separate from outside data, check the output format, test unsafe or misleading input, and never assume a confident answer is true.",
    example:
      "const result = await model.generate({\n  input,\n  responseFormat: schema,\n  timeout: 10_000\n});",
  },
  rag: {
    mentalModel:
      "RAG prepares source documents, finds the parts related to a question, and asks the model to answer from those sources.",
    production:
      "Check permissions before searching documents. Show sources, say when information is weak, and test search separately from the final answer.",
    quality:
      "Use a saved set of questions to check document splitting, search coverage, result order, answer accuracy, speed, and cost.",
    example:
      "query → retrieve candidates → filter permissions\n      → rerank → build context → answer with citations",
  },
  agents: {
    mentalModel:
      "An AI agent checks the current situation, chooses an allowed action, uses a tool, checks the result, and stops after clear limits are reached.",
    production:
      "Give tools only the access they need. Check every input, limit cost and steps, keep a history, and ask a person before risky actions.",
    quality:
      "Use a fixed workflow when the steps are known. Let the agent choose steps only when that freedom brings a result you can measure.",
    example:
      "while (!done && steps < MAX_STEPS) {\n  const action = await policy.next(state);\n  state = await executeApproved(action);\n}",
  },
  "full-stack-ai": {
    mentalModel:
      "Follow the user, data, model input, live output, saved result, quality check, and feedback through the whole app.",
    production:
      "A real product must protect each user’s data and secrets, control cost, keep working when the model fails, and show the sources behind answers.",
    quality:
      "Use clear TypeScript or Python types between the interface, API, data, and AI services. Test fixed rules separately from model answer quality.",
    example:
      "React UI → Typed API → Domain service\n                    ↘ AI gateway → Model\n                    ↘ PostgreSQL / Vector index",
  },
  devops: {
    mentalModel:
      "A delivery pipeline takes a saved code change, builds it the same way each time, tests it, deploys it, watches it, and can undo it safely.",
    production:
      "Keep secrets out of code and container images. Release in safe stages, check app health, monitor problems, keep backups, and test recovery.",
    quality:
      "Automate repeatable checks, save exact tool versions, build the same release package each time, and make undoing a release easy.",
    example:
      "commit → lint/test → build image → scan\n       → deploy staging → verify → production",
  },
  career: {
    mentalModel:
      "A strong interview answer explains the situation, what you did, the measured result, and the cost of your choice.",
    production:
      "A portfolio project should explain the problem, limits, choices, code, tests, result, and what you would improve next.",
    quality:
      "Practice aloud, use real project examples, give numbers only when you measured them, and match the detail to the question.",
    example:
      "Situation → Choice → What you built → Result\n        → Benefit and cost → Next improvement",
  },
};
const angularGuidance: Guidance = {
  mentalModel:
    "An Angular app is a tree of components. Templates show the interface, services share logic, the router changes pages, and Signals or Observables update data over time.",
  production:
    "Large Angular apps group code by feature, load pages only when needed, type API data, handle errors in one place, support accessibility, measure updates, and automate tests and releases.",
  quality:
    "Prefer standalone components, clearly choose where services live, type changing data, clean up subscriptions, and test what users can see and do.",
  example:
    "@Component({\n  selector: 'app-status',\n  standalone: true,\n  template: `<p>{{ status() }}</p>`\n})\nexport class StatusComponent {\n  status = signal('Ready');\n}",
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
  const guide =
    phase.id === "frontend" && module.track === "angular"
      ? angularGuidance
      : (guidance[phase.id] ?? guidance.orientation);
  const knowledge = getTopicKnowledge(phase.id, topic);
  const lessonId = catalogLessonId(phase.id, module.id, topic);
  const complete = store.state.completedLessons.includes(lessonId);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [note, setNote] = useState("");
  const [topicsVisible, setTopicsVisible] = useState(true);
  const topicRailRef = useRef<HTMLElement | null>(null);
  const topicScrollerRef = useRef<HTMLDivElement | null>(null);
  const options = useMemo(
    () => [
      `Learn what ${topic} means, practice it, and check that your result works`,
      `Memorize the words for ${topic} without using it`,
      "Use a tool without learning why it works",
      "Assume it works without testing errors",
    ],
    [topic],
  );
  const correct = options[0];
  const previous = module.topics[position - 1],
    next = module.topics[position + 1];
  const topicSubtopics = useMemo<LearningSubtopic[]>(() => {
    const authored = getTopicSubtopics(phase.id, topic);
    if (authored) return authored;
    const processSteps = (knowledge?.steps ?? []).map((step, index) => ({
      id: `process-${index + 1}`,
      title: `Step ${index + 1}: ${step}`,
      explanation: step,
      example: `BEFORE\nWrite what is true before this step.\n\nACTION\n${step}\n\nAFTER\nWrite the value, state, file, request, or visible result that changed.`,
      practice: `Trace this exact step of ${topic}. Record what exists before it, what acts, what changes, and the first result you can check.`,
    }));
    return [
      {
        id: "foundation",
        title: "The basics and why they matter",
        explanation:
          knowledge?.definition ??
          `${topic} is part of ${module.title}. Start by understanding the problem it solves, its inputs, its output, and the vocabulary used to discuss it.`,
        example: `PROBLEM IT SOLVES\n${knowledge?.importance ?? guide.production}`,
        practice: `Explain ${topic} in your own words. Add one everyday example.`,
      },
      {
        id: "mental-model",
        title: "A simple way to think about it",
        explanation: `${guide.mentalModel} List the important words for ${topic}. For each word, say what goes in, what changes, and what comes out.`,
        example: `INPUT → ${topic} → VISIBLE RESULT\n   ↘ check state, errors, time, and limits`,
        practice: `Draw ${topic} as boxes and arrows. Label who acts, what data moves, and where you can check the result.`,
      },
      ...processSteps,
      {
        id: "implementation",
        title: "Build it step by step",
        explanation: `Start with the smallest working example of ${topic}. Guess the result, build one step, check it, and only then add more.`,
        example: knowledge?.example ?? guide.example,
        practice: `Create a small ${topic} example. Explain each important line, then add one useful feature without copying a finished answer.`,
      },
      {
        id: "application",
        title: "Use it in a real app",
        explanation: knowledge?.importance ?? guide.production,
        example:
          knowledge?.realWorld ??
          `Find ${topic} inside a real ${phase.title} product. Follow the input through each important step to the result a user or another system receives.`,
        practice: `Find ${topic} in a real product. Draw what information goes in and what result comes out.`,
      },
      {
        id: "debugging",
        title: "Find and fix problems",
        explanation: `Learn how ${topic} can fail. Write what you expected and what happened. Reproduce the smallest version, inspect the result, test one possible cause, and add a test for the fix.`,
        example: `Expected result → actual result → clues → possible cause → small test → real cause → test for the fix`,
        practice: `Describe three ${topic} problems: bad input, a timing problem, and a problem connecting to another part. Explain how you would find each cause.`,
      },
      {
        id: "testing",
        title: "Check that it works",
        explanation: `${guide.quality} Test what ${topic} does from the outside. Include a normal case, an unusual case, bad input, and an error case.`,
        example: `1. Set up a real input\n2. Perform one action\n3. Check the public result\n4. Repeat with an unusual input\n5. Keep a test for every fixed bug`,
        practice: `Write a test plan for ${topic}. Include a small unit test, a connection test, a safety or accessibility check, and a test for a fixed bug.`,
      },
      {
        id: "performance-security",
        title: "Speed and safety",
        explanation: `Measure how much time and memory ${topic} uses. Find outside input, private data, and unnecessary access before you change anything.`,
        example: `Measure → find the slow or unsafe point → change one cause → compare results → write down the cost`,
        practice: `Name one safety risk and one speed risk for ${topic}. Say what you would measure and how you would reduce each risk.`,
      },
      {
        id: "professional",
        title: "Use it in real work",
        explanation: `${guide.quality} ${guide.production}`,
        example: `REAL-WORK CHECKLIST\n□ Clear owner and boundary\n□ Normal, unusual, and failure behavior\n□ Tests and useful logs\n□ Safety, accessibility, speed, and cost\n□ Release and recovery plan`,
        practice: `Create a small ${topic} example with a normal case, an unusual case, a clear check, and one cost or limitation.`,
      },
      {
        id: "interview",
        title: "Explain it in an interview",
        explanation: `A strong answer explains what ${topic} is, why it is useful, how it works, a real example, what can fail, other choices, and how you checked it.`,
        example: `What it is → why it matters → how it works → example → error → other choice → cost → check`,
        practice: `Answer four questions about ${topic}, from beginner to senior level. Start with correct use, then explain wider system costs and change risks.`,
      },
    ];
  }, [guide, knowledge, module.title, phase.id, phase.title, topic]);
  const exampleCases = useMemo(
    () =>
      getTopicExampleCases({
        phaseId: phase.id,
        topic,
        moduleTitle: module.title,
        definition:
          knowledge?.definition ??
          `${topic} is an important part of ${module.title}.`,
        realWorld:
          knowledge?.realWorld ??
          `A real ${phase.title} product uses ${topic} to turn a clear input into a result that a user or another system can check.`,
        example: knowledge?.example ?? guide.example,
        practice:
          knowledge?.practice ??
          `Build the smallest useful ${topic} example and check its result.`,
        qualityRule: guide.quality,
      }),
    [guide, knowledge, module.title, phase.id, phase.title, topic],
  );
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
      section: "Complete Lesson",
    });
  }, [module.title, setLearningPosition, topic]);

  useEffect(() => {
    if (!topicsVisible) return;
    const frame = window.requestAnimationFrame(() => {
      const desktopRail = topicRailRef.current;
      const mobileScroller = topicScrollerRef.current;
      const activeTopic = desktopRail?.querySelector<HTMLButtonElement>(
        '[aria-current="page"]',
      );
      if (!activeTopic) return;

      if (window.matchMedia("(max-width: 900px)").matches) {
        if (!mobileScroller) return;
        const scrollerBox = mobileScroller.getBoundingClientRect();
        const topicBox = activeTopic.getBoundingClientRect();
        mobileScroller.scrollLeft +=
          topicBox.left -
          scrollerBox.left -
          (scrollerBox.width - topicBox.width) / 2;
        return;
      }

      if (!desktopRail) return;
      const railBox = desktopRail.getBoundingClientRect();
      const topicBox = activeTopic.getBoundingClientRect();
      desktopRail.scrollTop +=
        topicBox.top - railBox.top - (railBox.height - topicBox.height) / 2;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [topic, topicsVisible]);

  const goPrevious = () => {
    if (previousTopic)
      onSelect(
        previousTopic.module,
        previousTopic.topic,
        previousTopic.position,
      );
  };

  const goNext = () => {
    if (nextTopic)
      onSelect(nextTopic.module, nextTopic.topic, nextTopic.position);
  };
  return (
    <div className="page catalog-lesson">
      <div className="lesson-toolbar">
        <button className="back-link" onClick={onBack}>
          <ChevronLeft /> {phase.title} · {module.title}
        </button>
        <button
          className="secondary-button topic-rail-toggle"
          aria-expanded={topicsVisible}
          onClick={() => setTopicsVisible((visible) => !visible)}
        >
          {topicsVisible ? <PanelLeftClose /> : <PanelLeftOpen />}
          {topicsVisible ? "Hide course topics" : "Show course topics"}
        </button>
      </div>
      <section className="curriculum-head">
        <div>
          <span className="eyebrow teal">
            {phase.title.toUpperCase()} · TOPIC {position + 1}
          </span>
          <h1>{topic}</h1>
          <p>
            One complete lesson, from the basic idea to using it in real work.
          </p>
        </div>
        <span className={`status-pill ${complete ? "complete" : "active"}`}>
          {complete ? "Completed" : "In progress"}
        </span>
      </section>
      <div
        className={`catalog-learning-layout ${topicsVisible ? "" : "topics-hidden"}`}
      >
        {topicsVisible && (
          <aside
            ref={topicRailRef}
            className="related-topics panel"
            aria-label="Course topics"
          >
          <span className="eyebrow teal">COURSE TOPICS</span>
          <h2>{phase.title}</h2>
          <p>
            {phaseTopicIndex + 1} of {phaseTopics.length} topics · everything is
            open
          </p>
          <div ref={topicScrollerRef} className="related-topic-groups">
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
                        <small>{phaseModule.title}</small>
                      </span>
                    </button>
                  );
                })}
              </section>
            ))}
          </div>
          </aside>
        )}
        <main className="catalog-lesson-body">
          <section className="lesson-overview panel">
            <div>
              <Target />
              <span>
                <b>What you will learn</b>Explain {topic}, show where it fits,
                and use it in an example.
              </span>
            </div>
            <div>
              <BookOpen />
              <span>
                <b>Course section</b>
                {module.title} · {phase.title}
              </span>
            </div>
            <div>
              <CheckCircle2 />
              <span>
                <b>To finish</b>Read the lesson, practice, and pass the quick check.
              </span>
            </div>
          </section>
          <Suspense
            fallback={
              <section className="lesson-resources panel resource-panel-loading">
                Loading official resources…
              </section>
            }
          >
            <TopicResourcesPanel
              phaseId={phase.id}
              moduleTrack={module.track}
              topic={topic}
            />
          </Suspense>
          <InteractiveExampleLab
            lessonId={lessonId}
            topic={topic}
            cases={exampleCases}
            store={store}
          />
          <section className="lesson-section full-learning-mode panel">
            <div className="full-learning-intro">
              <span className="eyebrow teal">COMPLETE LESSON</span>
              <h2>Learn {topic} from the basics to real work</h2>
              <p>
                Read the sections in order. Each one explains an idea, shows an
                example, and gives you a short task.
              </p>
              <div className="full-learning-summary">
                <span><b>{topicSubtopics.length}</b> lesson sections</span>
                <span><b>3</b> interactive examples</span>
                <span><b>1</b> deeper practice</span>
                <span><b>5</b> skill levels</span>
                <span><b>1</b> quick check</span>
              </div>
            </div>
            <div className="full-learning-flow" aria-label={`${topic} lesson sections`}>
              {topicSubtopics.map((subtopic, index) => (
                <article key={subtopic.id} className="full-learning-chapter">
                  <header>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <small>LESSON PART {index + 1} OF {topicSubtopics.length}</small>
                      <h3>{subtopic.title}</h3>
                    </div>
                  </header>
                  <p className="full-learning-explanation">{subtopic.explanation}</p>
                  <div className="full-learning-example">
                    <span className="eyebrow">EXAMPLE</span>
                    <pre className="code-block"><code>{subtopic.example}</code></pre>
                  </div>
                  <div className="challenge-callout">
                    <Code2 />
                    <div>
                      <b>Try it now</b>
                      <p>{subtopic.practice}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <section className="lesson-section panel">
            <span className="eyebrow">WHAT IS IT?</span>
            <h2>What {topic} means</h2>
            <p>
              {knowledge?.definition ?? (
                <>
                  <b>{topic}</b> is one part of {module.title}.{" "}
                  {phase.description} Learn this topic by identifying the
                  problem it solves, what goes in, what comes out, and what can
                  go wrong.
                </>
              )}
            </p>
            {knowledge && (
              <p>
                <b>Why it matters:</b> {knowledge.importance}
              </p>
            )}
            <p>
              Connect it to {previous ?? "the earlier basics"} before it and{" "}
              {next ?? "the section test"} after it.
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
          <DeepDiveLab
            key={`deep-dive-${lessonId}`}
            topic={topic}
            phaseTitle={phase.title}
            lessonId={lessonId}
            mentalModel={guide.mentalModel}
            qualityRule={guide.quality}
            productionRule={guide.production}
            example={knowledge?.example ?? guide.example}
            store={store}
          />
          <MasteryStudio
            key={`mastery-${lessonId}`}
            lessonId={lessonId}
            topic={topic}
            moduleTitle={module.title}
            phaseTitle={phase.title}
            definition={knowledge?.definition ?? `${topic} is a core concept within ${module.title}.`}
            example={knowledge?.example ?? guide.example}
            qualityRule={guide.quality}
            productionRule={guide.production}
            store={store}
          />
          <section className="lesson-section panel">
            <span className="eyebrow">HOW IT CONNECTS</span>
            <h2>See what comes before and after {topic}</h2>
            <div
              className="concept-flow"
              role="img"
              aria-label={`${previous ?? "Foundation"} leads to ${topic}, which prepares for ${next ?? "the section test"}`}
            >
              <div>
                <small>LEARN THIS FIRST</small>
                <b>{previous ?? "Foundation"}</b>
              </div>
              <ArrowRight />
              <div className="active">
                <small>YOU ARE HERE</small>
                <b>{topic}</b>
              </div>
              <ArrowRight />
              <div>
                <small>LEARN THIS NEXT</small>
                <b>{next ?? "Section test"}</b>
              </div>
            </div>
            <p className="visual-caption">
              At each arrow, ask: what moves forward, what must already be true,
              and how can I tell if the result is wrong?
            </p>
          </section>
          <section className="lesson-section panel">
            <span className="eyebrow">SIMPLE WAY TO THINK ABOUT IT</span>
            <h2>Follow the idea</h2>
            <p>{guide.mentalModel}</p>
            <pre className="code-block">
              <code>{knowledge?.example ?? guide.example}</code>
            </pre>
          </section>
          <section className="lesson-section panel">
            <span className="eyebrow">USE IT IN A REAL APP</span>
            <h2>Move from a tutorial to real work</h2>
            <p>{guide.production}</p>
            <div className="challenge-callout">
              <Lightbulb />
              <div>
                <b>Good habit</b>
                <p>{guide.quality}</p>
              </div>
            </div>
          </section>
          <section className="lesson-section panel">
            <span className="eyebrow">MISTAKES AND GOOD HABITS</span>
            <h2>Learn it well</h2>
            <div className="do-dont-grid">
              <div className="dont">
                <b>Common mistakes</b>
                <ul>
                  <li>
                    Memorizing the definition of {topic} without tracing a
                    concrete example.
                  </li>
                  <li>
                    Testing only the normal case and ignoring empty, bad, slow,
                    or failed input.
                  </li>
                  <li>
                    Copying an implementation without being able to explain each
                    decision.
                  </li>
                  <li>
                    Trying to make it faster before finding the real slow part.
                  </li>
                </ul>
              </div>
              <div className="do">
                <b>Good work habits</b>
                <ul>
                  <li>
                    Begin with a tiny working example and predict its result
                    before running it.
                  </li>
                  <li>
                    Write down what you assume, then check the result where one
                    part connects to another.
                  </li>
                  <li>
                    Compare two choices and clearly state the cost of each.
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
            <span className="eyebrow">PRACTICE</span>
            <h2>Use {topic} yourself</h2>
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
                Describe where this appears in a real {phase.title} app and how
                you would check that it works.
              </li>
            </ol>
            <div className="challenge-callout">
              <Code2 />
              <div>
                <b>Challenge</b>
                <p>
                  Build or diagram a small example of {topic}. Include one
                  normal case, one unusual case, and a short explanation of the
                  cost of your choice.
                </p>
              </div>
            </div>
          </section>
          <section className="lesson-section quiz-card panel">
            <span className="eyebrow teal">QUICK CHECK</span>
            <h2>
              What is the best way to learn {topic}?
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
                    ? "Correct. Learn the idea, use it, and check the result."
                    : "Try again. Reading an explanation does not show that you can use the topic."}
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
            <h2>Save what you learned</h2>
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
            <span className="eyebrow">INTERVIEW PRACTICE</span>
            <h2>Explain {topic} clearly</h2>
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
                <b>Professional:</b> Describe a real-app failure involving{" "}
                {topic}. How would you find, limit, and prevent it?
              </li>
            </ol>
            <div className="challenge-callout">
              <Lightbulb />
              <div>
                <b>A clear answer order</b>
                <p>
                  Meaning → purpose → how it works → example → unusual case →
                  cost → how you checked it.
                </p>
              </div>
            </div>
          </section>
          <section className="lesson-section panel">
            <span className="eyebrow">QUICK REVIEW</span>
            <h2>Remember the main ideas</h2>
            <ul>
              <li>
                {topic} belongs to {module.title} within {phase.title}.
              </li>
              <li>{guide.mentalModel}</li>
              <li>{guide.quality}</li>
              <li>
                You know the topic when you can explain it, use it, fix a
                problem, compare choices, and check the result without copying.
              </li>
            </ul>
          </section>
          <footer className="topic-navigation panel">
            <button
              disabled={!previousTopic}
              onClick={goPrevious}
            >
              <ArrowLeft />{" "}
              <span>
                <small>Previous topic</small>
                {previousTopic?.topic ?? "Start of phase"}
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
              disabled={!nextTopic}
              onClick={goNext}
            >
              <span>
                <small>Next topic</small>
                {nextTopic?.topic ?? "End of phase"}
              </span>
              <ArrowRight />
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
