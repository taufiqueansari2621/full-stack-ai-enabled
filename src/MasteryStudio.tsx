import { useState } from "react";
import {
  ArrowRight,
  Blocks,
  Bug,
  Check,
  ChevronRight,
  CircleHelp,
  Code2,
  GraduationCap,
  Lightbulb,
  LockKeyhole,
  Save,
  ShieldCheck,
} from "lucide-react";
import type { ForgeStore, MasteryArtifact } from "./useForgeStore";

type LevelId = MasteryArtifact["level"];

type MasteryStudioProps = {
  lessonId: string;
  topic: string;
  moduleTitle: string;
  phaseTitle: string;
  definition: string;
  example: string;
  qualityRule: string;
  productionRule: string;
  store: ForgeStore;
};

type MasteryLevel = {
  id: LevelId;
  label: string;
  level: string;
  icon: typeof GraduationCap;
  outcome: string;
  task: string;
  prompt: string;
  criteria: string[];
  coach: string;
};

export function MasteryStudio({
  lessonId,
  topic,
  moduleTitle,
  phaseTitle,
  definition,
  example,
  qualityRule,
  productionRule,
  store,
}: MasteryStudioProps) {
  const levels: MasteryLevel[] = [
    {
      id: "foundation",
      label: "Explain",
      level: "Beginner",
      icon: GraduationCap,
      outcome: `Explain ${topic} correctly in simple words.`,
      task: `Explain it to a new developer. Say what problem it solves, what goes in, what comes out, and where it fits in ${moduleTitle}.`,
      prompt: "Write your plain-language explanation and one analogy…",
      criteria: [
        "Defines the idea in original words",
        "Names its purpose, input, and result",
        "Uses one clear example or comparison",
      ],
      coach: `Start from this durable definition, then rewrite it: ${definition}`,
    },
    {
      id: "guided",
      label: "Follow",
      level: "Step by step",
      icon: Code2,
      outcome: `Follow ${topic} step by step and connect each step to a result you can see.`,
      task: "Explain the example below. For each line or step, say what it receives, changes, and produces. Guess one result before checking it.",
      prompt: "Trace the worked model in order…",
      criteria: [
        "Preserves the correct execution order",
        "Tracks the important value or state change",
        "Makes a guess that can be tested, then checks it",
      ],
      coach: `Worked model:\n${example}`,
    },
    {
      id: "applied",
      label: "Build",
      level: "Intermediate",
      icon: Blocks,
      outcome: `Use ${topic} in a small realistic ${phaseTitle} scenario.`,
      task: "Design or build the smallest useful example. Include a normal case, an empty or bad input, and the exact check that shows the result is correct.",
      prompt: "Describe what you built, how you tested it, and what happened…",
      criteria: [
        "Produces working code, a diagram, or a clear build plan",
        "Handles both a normal and an edge case",
        "Verifies behavior instead of assuming success",
      ],
      coach: "Reduce the scope until the example can be built and verified in one focused session.",
    },
    {
      id: "debug",
      label: "Fix",
      level: "Advanced",
      icon: Bug,
      outcome: `Find the cause of a ${topic} problem using real clues.`,
      task: "Create or reproduce one realistic problem. Write the expected and actual result, the clues you would inspect, one cause you can test, and a test that keeps the bug fixed.",
      prompt: "Describe the problem and the steps you would use to find the cause…",
      criteria: [
        "Separates expected and actual behavior",
        "Uses real clues to test one possible cause at a time",
        "Ends with a fix for the real cause and a test for the bug",
      ],
      coach: `Use this quality constraint: ${qualityRule}`,
    },
    {
      id: "professional",
      label: "Decide",
      level: "Real work",
      icon: ShieldCheck,
      outcome: `Explain and defend a real-app decision involving ${topic}.`,
      task: "Write a short decision note. Include the situation, limits, chosen approach, another option, costs, possible failure, monitoring, safety, and a plan to undo or recover.",
      prompt: "Write the decision and explain why you chose it…",
      criteria: [
        "Names real constraints and a rejected alternative",
        "Explains reliability, safety, and maintenance needs",
        "Defines what to measure, how to handle failure, and how to recover",
      ],
      coach: productionRule,
    },
  ];

  const artifacts = store.state.masteryArtifacts.filter(
    (artifact) => artifact.lessonId === lessonId,
  );
  const firstIncomplete = levels.findIndex(
    (level) => !artifacts.some((artifact) => artifact.level === level.id),
  );
  const [activeIndex, setActiveIndex] = useState(
    firstIncomplete === -1 ? levels.length - 1 : firstIncomplete,
  );
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      artifacts.map((artifact) => [artifact.level, artifact.response]),
    ),
  );
  const [showCoach, setShowCoach] = useState(false);
  const [savedLevel, setSavedLevel] = useState<LevelId | null>(null);
  const active = levels[activeIndex];
  const response = drafts[active.id] ?? "";
  const savedArtifact = artifacts.find(
    (artifact) => artifact.level === active.id,
  );
  const completedCount = levels.filter((level) =>
    artifacts.some((artifact) => artifact.level === level.id),
  ).length;

  const selectLevel = (index: number) => {
    setActiveIndex(index);
    setShowCoach(false);
    setSavedLevel(null);
  };

  const saveArtifact = () => {
    if (response.trim().length < 80) return;
    store.saveMasteryArtifact({
      lessonId,
      level: active.id,
      response: response.trim(),
    });
    setSavedLevel(active.id);
  };

  return (
    <section className="lesson-section mastery-studio panel">
      <div className="mastery-studio-head">
        <div>
          <span className="eyebrow teal">BEGINNER → REAL WORK</span>
          <h2>Build your skill</h2>
          <p>
            Start by explaining the idea. Then build, fix, and make a real-world
            decision. Your work is saved at every level.
          </p>
        </div>
        <div className="mastery-studio-score" aria-label={`${completedCount} of 5 skill levels saved`}>
          <strong>{completedCount}/5</strong>
          <span>levels saved</span>
        </div>
      </div>

      <div className="mastery-level-tabs" role="tablist" aria-label="Skill levels">
        {levels.map((level, index) => {
          const complete = artifacts.some(
            (artifact) => artifact.level === level.id,
          );
          const unlocked =
            index === 0 ||
            artifacts.some((artifact) => artifact.level === levels[index - 1].id);
          const Icon = level.icon;
          return (
            <button
              key={level.id}
              role="tab"
              aria-selected={activeIndex === index}
              aria-controls="mastery-level-panel"
              className={activeIndex === index ? "active" : complete ? "complete" : ""}
              disabled={!unlocked}
              onClick={() => selectLevel(index)}
            >
              <span>{complete ? <Check /> : unlocked ? <Icon /> : <LockKeyhole />}</span>
              <span><b>{level.label}</b><small>{level.level}</small></span>
            </button>
          );
        })}
      </div>

      <div className="mastery-level-panel" id="mastery-level-panel" role="tabpanel">
        <div className="mastery-level-main">
          <span className="eyebrow">LEVEL {activeIndex + 1} · {active.level.toUpperCase()}</span>
          <h3>{active.outcome}</h3>
          <div className="mastery-task">
            <CircleHelp />
            <div><b>Your task</b><p>{active.task}</p></div>
          </div>
          <textarea
            value={response}
            onChange={(event) => {
              setDrafts((current) => ({ ...current, [active.id]: event.target.value }));
              setSavedLevel(null);
            }}
            placeholder={active.prompt}
            aria-label={`${active.label} saved work`}
          />
          <div className="mastery-response-meta">
            <span>{response.trim().length}/80 characters · write at least 80</span>
            {savedArtifact && <span>Saved {new Date(savedArtifact.updatedAt).toLocaleDateString()}</span>}
          </div>
          <button className="hint-button mastery-coach-button" onClick={() => setShowCoach((value) => !value)}>
            <Lightbulb /> {showCoach ? "Hide help" : "Show help"}
          </button>
          {showCoach && <pre className="mastery-coach"><code>{active.coach}</code></pre>}
        </div>

        <aside className="mastery-rubric">
          <span className="eyebrow">WHAT GOOD WORK INCLUDES</span>
          <ul>
            {active.criteria.map((criterion) => <li key={criterion}><Check /> {criterion}</li>)}
          </ul>
          <div className="mastery-evidence-note">
            <ShieldCheck />
            <p><b>Saved work is one step</b>Quizzes, review, projects, and interviews also help check your skill.</p>
          </div>
        </aside>
      </div>

      <div className="mastery-studio-actions">
        <button className="secondary-button" disabled={response.trim().length < 80} onClick={saveArtifact}>
          <Save /> {savedLevel === active.id ? "Work saved" : savedArtifact ? "Update saved work" : "Save my work"}
        </button>
        {activeIndex < levels.length - 1 && (
          <button
            className="primary-button"
            disabled={!artifacts.some((artifact) => artifact.level === active.id) && savedLevel !== active.id}
            onClick={() => selectLevel(activeIndex + 1)}
          >
            Next level <ArrowRight />
          </button>
        )}
        {activeIndex === levels.length - 1 && completedCount === levels.length && (
          <span className="mastery-complete"><Check /> All skill levels completed</span>
        )}
      </div>
      <p className="mastery-next-note">
        <ChevronRight /> Next step: pass the quick check, then use this topic in Practice or Projects.
      </p>
    </section>
  );
}
