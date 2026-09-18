import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  FileCheck2,
  Gauge,
  Lightbulb,
  Save,
  ShieldCheck,
  Target,
} from "lucide-react";
import {
  curriculumPhases,
  getPhaseModules,
  type CurriculumPhase,
} from "./curriculumCatalog";
import { catalogLessonId } from "./topicIds";
import type { ForgeStore } from "./useForgeStore";

type Difficulty = "easy" | "medium" | "hard";

type Drill = {
  label: string;
  time: string;
  title: string;
  brief: string;
  steps: string[];
  criteria: string[];
  review: string;
};

const difficultyMeta: Record<
  Difficulty,
  { label: string; time: string; support: string }
> = {
  easy: {
    label: "Easy",
    time: "15–25 min",
    support: "Guided · one topic · clear goal",
  },
  medium: {
    label: "Medium",
    time: "35–60 min",
    support: "Independent · combine topics · unusual cases",
  },
  hard: {
    label: "Hard",
    time: "60–120 min",
    support: "Real app · unclear needs · explain your choices",
  },
};

const practiceContext = (phase: CurriculumPhase) => {
  if (["web", "javascript", "typescript", "frontend"].includes(phase.id))
    return "a web page that works on phones and can be used with a keyboard";
  if (phase.id === "backend")
    return "an API for many users that checks data and handles errors";
  if (phase.id === "dsa")
    return "a coding problem with clear speed and memory limits";
  if (phase.id === "system-design")
    return "a system that stays reliable as the number of users changes";
  if (phase.id === "python")
    return "a Python package or data task with type hints and automatic tests";
  if (["machine-learning", "deep-learning"].includes(phase.id))
    return "an experiment that others can repeat, compare, and check for mistakes";
  if (["llm", "rag", "agents", "full-stack-ai"].includes(phase.id))
    return "an AI feature with checked answers, safety limits, speed checks, and cost checks";
  if (phase.id === "devops")
    return "a release process with logs, monitoring, and a safe way to undo a bad release";
  if (phase.id === "career")
    return "a realistic job interview or portfolio review";
  return "a small real-work task with clear inputs, results, and checks";
};

const createDrill = (
  difficulty: Difficulty,
  topic: string,
  moduleTitle: string,
  phase: CurriculumPhase,
): Drill => {
  const meta = difficultyMeta[difficulty];
  const context = practiceContext(phase);
  if (difficulty === "easy")
    return {
      label: meta.label,
      time: meta.time,
      title: `Explain and show ${topic}`,
      brief: `Create the smallest correct example of ${topic} in ${context}. Try from memory first. Then use the official guide to check anything you are unsure about.`,
      steps: [
        `Define ${topic} in your own words and name the problem it solves.`,
        "List the input, what changes, the result, and one thing you assume is true.",
        "Write, draw, or implement the smallest working example.",
        "Guess the result before checking it. Then write what you learned.",
      ],
      criteria: [
        "The explanation uses your own clear words.",
        "The example focuses on this topic without unrelated code.",
        "You check a normal case and one unusual case.",
        "You show what you checked, not only that you finished.",
      ],
      review: `A reviewer asks: “Why is ${topic} needed here, and what would be different without it?”`,
    };
  if (difficulty === "medium")
    return {
      label: meta.label,
      time: meta.time,
      title: `Use ${topic} in a real feature`,
      brief: `Use ${topic} in ${context}. Combine it with one related idea from ${moduleTitle}. Make the result easy to see and test.`,
      steps: [
        "Before coding, write a checklist for empty, invalid, loading, success, and error states where they apply.",
        `Implement or design the feature using ${topic} and one related ${moduleTitle} concept.`,
        "Add a focused test for the normal case and two unusual cases.",
        "Add one realistic bug, use the result or logs to find it, then add a test so it does not return.",
        "Write one other possible approach and explain why you chose this one.",
      ],
      criteria: [
        "Another learner can check the result without guessing what you meant.",
        "The implementation handles at least two meaningful edge or failure cases.",
        "Tests check what a user or another part of the app can see.",
        "Your choice includes a real benefit and cost, not only a preference.",
      ],
      review: `A reviewer changes one requirement. Explain how your ${topic} design changes and which tests must change with it.`,
    };
  return {
    label: meta.label,
    time: meta.time,
    title: `Real app decision: ${topic}`,
    brief: `You are responsible for ${context} in a live app. Use ${topic} when some needs are unclear, parts may fail, outside input may be unsafe, and usage may grow. Write a plan another team could follow.`,
    steps: [
      "Clarify what it must do, quality needs such as speed and safety, expected usage, and what is outside the task.",
      `Design or build the ${topic} solution. Show its boundaries, who owns its data, how it fails, and how you would release it safely.`,
      "Check security risks and measure the slowest or most expensive part before making it faster.",
      "Define tests, logs, useful measurements, alerts, a clear success target, and a way to recover or undo the release.",
      "Compare two useful options. Record your choice, its risks, and later work.",
      "Think ahead: name the three most likely failures and what information would help you tell them apart.",
    ],
    criteria: [
      "Every need connects to a result that can be checked.",
      "You give the right amount of attention to security, accessibility, reliability, speed, and cost.",
      "The plan covers release, monitoring, recovery, and ownership—not only code.",
      "You clearly state benefits, costs, unknowns, and hard-to-reverse choices.",
      "The saved work is strong enough for a portfolio case study or an advanced interview.",
    ],
    review: `A senior reviewer asks: “What will break first with ten times more users, how will you know, and what is the safest way to change it?”`,
  };
};

export default function TopicPracticeLab({
  store,
  notify,
}: {
  store: ForgeStore;
  notify: (message: string) => void;
}) {
  const initialPhaseIndex = Math.max(
    0,
    curriculumPhases.findIndex((phase) => phase.id === "javascript"),
  );
  const [phaseIndex, setPhaseIndex] = useState(initialPhaseIndex);
  const [moduleIndex, setModuleIndex] = useState(0);
  const [topicIndex, setTopicIndex] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const phase = curriculumPhases[phaseIndex];
  const modules = getPhaseModules(phase, store.state.frontendFrameworkPath);
  const activeModule = modules[moduleIndex] ?? modules[0];
  const topic = activeModule.topics[topicIndex] ?? activeModule.topics[0];
  const lessonId = catalogLessonId(phase.id, activeModule.id, topic);
  const saved = store.state.topicPracticeArtifacts.find(
    (item) => item.lessonId === lessonId && item.difficulty === difficulty,
  );
  const artifactKey = `${lessonId}:${difficulty}`;
  const response = drafts[artifactKey] ?? saved?.response ?? "";
  const drill = createDrill(difficulty, topic, activeModule.title, phase);
  const totalTopics = curriculumPhases.reduce(
    (phaseTotal, item) =>
      phaseTotal +
      getPhaseModules(item, store.state.frontendFrameworkPath).reduce(
        (moduleTotal, moduleItem) => moduleTotal + moduleItem.topics.length,
        0,
      ),
    0,
  );

  const save = () => {
    if (response.trim().length < 80) return;
    store.saveTopicPracticeArtifact({
      lessonId,
      difficulty,
      response: response.trim(),
    });
    notify(`${drill.label} ${topic} work saved — +15 XP`);
  };

  return (
    <div className="topic-practice-lab">
      <section className="topic-practice-summary panel">
        <div>
          <span className="eyebrow teal">PRACTICE ANY TOPIC</span>
          <h2>{totalTopics * 3} practice tasks</h2>
          <p>
            Every visible topic has an Easy, Medium, and Hard task. Responses
            are saved. They are not marked correct automatically.
          </p>
        </div>
        <div className="topic-practice-score">
          <b>{store.state.topicPracticeArtifacts.length}</b>
          <span>answers saved</span>
        </div>
      </section>

      <section className="practice-path-picker panel" aria-label="Choose a topic drill">
        <label>
          <span>Course stage</span>
          <select
            aria-label="Practice phase"
            value={phaseIndex}
            onChange={(event) => {
              setPhaseIndex(Number(event.target.value));
              setModuleIndex(0);
              setTopicIndex(0);
            }}
          >
            {curriculumPhases.map((item, index) => (
              <option value={index} key={item.id}>{item.title}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Section</span>
          <select
            aria-label="Practice module"
            value={moduleIndex}
            onChange={(event) => {
              setModuleIndex(Number(event.target.value));
              setTopicIndex(0);
            }}
          >
            {modules.map((item, index) => (
              <option value={index} key={item.id}>{item.title}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Topic</span>
          <select
            aria-label="Practice topic"
            value={topicIndex}
            onChange={(event) => setTopicIndex(Number(event.target.value))}
          >
            {activeModule.topics.map((item, index) => (
              <option value={index} key={item}>{item}</option>
            ))}
          </select>
        </label>
      </section>

      <div className="difficulty-picker" aria-label="Choose difficulty">
        {(Object.keys(difficultyMeta) as Difficulty[]).map((level) => {
          const artifact = store.state.topicPracticeArtifacts.some(
            (item) => item.lessonId === lessonId && item.difficulty === level,
          );
          return (
            <button
              key={level}
              className={difficulty === level ? "active" : ""}
              aria-pressed={difficulty === level}
              onClick={() => setDifficulty(level)}
            >
              <span>{artifact ? <Check /> : level === "easy" ? <Target /> : level === "medium" ? <Code2 /> : <Gauge />}</span>
              <div><b>{difficultyMeta[level].label}</b><small>{difficultyMeta[level].support}</small></div>
            </button>
          );
        })}
      </div>

      <section className={`topic-drill panel ${difficulty}`}>
        <header>
          <div>
            <span className="eyebrow">{phase.title.toUpperCase()} · {activeModule.title.toUpperCase()}</span>
            <h2>{drill.title}</h2>
          </div>
          <span className="drill-time"><Clock3 /> {drill.time}</span>
        </header>
        <p className="drill-brief">{drill.brief}</p>
        <div className="drill-columns">
          <article>
            <h3><Code2 /> Steps</h3>
            <ol>{drill.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          </article>
          <article>
            <h3><FileCheck2 /> What success looks like</h3>
            <ul>{drill.criteria.map((criterion) => <li key={criterion}><CheckCircle2 />{criterion}</li>)}</ul>
          </article>
        </div>
        <div className="drill-review">
          <Lightbulb />
          <div><b>One more question</b><p>{drill.review}</p></div>
        </div>
        <label className="practice-artifact-editor">
          <span>Your answer, code, tests, links, and what you learned</span>
          <textarea
            value={response}
            onChange={(event) =>
              setDrafts((current) => ({
                ...current,
                [artifactKey]: event.target.value,
              }))
            }
            placeholder={`Write your ${drill.label.toLowerCase()} answer for ${topic}. Include what you built, how you checked it, mistakes you found, and why you made your choices.`}
          />
        </label>
        <footer>
          <span>{response.trim().length}/80 minimum characters {saved && "· saved previously"}</span>
          <button className="primary-button" disabled={response.trim().length < 80} onClick={save}>
            <Save /> {saved ? "Update my work" : "Save my work"}
          </button>
        </footer>
        <div className="practice-evidence-note">
          <ShieldCheck /> Saving records your work. To complete the topic, you still need the related tests, projects, reviews, and quizzes.
        </div>
      </section>
    </div>
  );
}
