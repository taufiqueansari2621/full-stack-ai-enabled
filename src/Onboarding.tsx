import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Command,
  Target,
} from "lucide-react";
import type { CloudAccount } from "./useCloudAccount";
import "./onboarding.css";

const choices = {
  goal: [
    [
      "frontend-engineer",
      "Frontend Engineer",
      "Build accessible React or Angular products.",
    ],
    [
      "full-stack-engineer",
      "Full Stack Engineer",
      "Own browser, API, and database features.",
    ],
    ["ai-engineer", "AI Engineer", "Build and evaluate production AI systems."],
    [
      "full-stack-ai-engineer",
      "Full Stack AI Engineer",
      "Combine product engineering with AI.",
    ],
    [
      "interview-ready",
      "Interview Ready",
      "Focus learning around hiring loops.",
    ],
    ["dsa-focus", "DSA Focus", "Strengthen problem-solving patterns."],
  ],
  experience: [
    ["complete-beginner", "Complete Beginner", "Start with the foundations."],
    [
      "some-programming",
      "Some Programming Experience",
      "I have written small programs.",
    ],
    ["junior-developer", "Junior Developer", "I build features with guidance."],
    [
      "mid-level-developer",
      "Mid-Level Developer",
      "I own production features.",
    ],
    [
      "experienced-developer",
      "Experienced Developer",
      "I want targeted depth and transfer.",
    ],
  ],
  framework: [
    ["react", "React", "Follow the React specialization."],
    ["angular", "Angular", "Follow the Angular specialization."],
    ["both", "Both", "Study shared foundations and both paths."],
  ],
  dailyMinutes: [
    ["30", "30 minutes/day", "A steady, sustainable pace."],
    ["60", "1 hour/day", "Balanced learning and practice."],
    ["120", "2 hours/day", "Faster progress with project time."],
    ["180", "3+ hours/day", "An intensive engineering schedule."],
  ],
  target: [
    ["learn-from-zero", "Learn from zero", "Build a complete foundation."],
    [
      "first-developer-job",
      "Get my first developer job",
      "Build employable proof.",
    ],
    [
      "switch-technology",
      "Switch technology",
      "Transfer existing engineering skills.",
    ],
    [
      "product-companies",
      "Prepare for product companies",
      "Raise coding and design depth.",
    ],
    ["become-ai-engineer", "Become an AI engineer", "Prioritize the AI path."],
    [
      "improve-system-design",
      "Improve system design",
      "Practice architecture and trade-offs.",
    ],
    [
      "prepare-interviews",
      "Prepare for interviews",
      "Focus recall and communication.",
    ],
  ],
} as const;

const diagnostic = [
  {
    id: "web-foundation",
    question: "Which choice gives a page meaningful structure?",
    options: [
      ["semantic-html", "Semantic HTML elements"],
      ["div-only", "Only generic div elements"],
      ["color-css", "A CSS color variable"],
    ],
  },
  {
    id: "javascript",
    question:
      "A resolved Promise and setTimeout(..., 0) are queued together. What normally runs first?",
    options: [
      ["timer-first", "The timer callback"],
      ["microtask-before-timer", "The Promise microtask"],
      ["random-order", "The order is random"],
    ],
  },
  {
    id: "typescript",
    question: "Why is unknown safer than any?",
    options: [
      ["same-type", "They are identical"],
      ["unknown-needs-narrowing", "Unknown must be narrowed before use"],
      ["unknown-faster", "Unknown runs faster"],
    ],
  },
  {
    id: "backend",
    question:
      "Who must establish the authenticated user for a protected API mutation?",
    options: [
      ["browser-user-id", "A user ID sent by the browser"],
      ["server-validates-identity", "The server from a verified session"],
      ["form-name", "The submitted display name"],
    ],
  },
  {
    id: "data",
    question: "What is an important database-index trade-off?",
    options: [
      ["index-tradeoff", "Faster reads can cost storage and write work"],
      ["always-free", "Indexes have no cost"],
      ["encrypts-data", "Every index encrypts its column"],
    ],
  },
  {
    id: "ai",
    question: "How should a RAG system be evaluated?",
    options: [
      ["answer-only", "Only whether an answer sounds fluent"],
      ["evaluate-retrieval-and-answer", "Measure retrieval and answer quality"],
      ["token-count-only", "Only count tokens"],
    ],
  },
] as const;

const correctAnswers: Record<string, string> = {
  "web-foundation": "semantic-html",
  javascript: "microtask-before-timer",
  typescript: "unknown-needs-narrowing",
  backend: "server-validates-identity",
  data: "index-tradeoff",
  ai: "evaluate-retrieval-and-answer",
};

type FormState = {
  goal: string;
  experience: string;
  framework: string;
  dailyMinutes: string;
  target: string;
  difficulty: string;
  diagnosticAnswers: Record<string, string>;
};

export function Onboarding({ account }: { account: CloudAccount }) {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<FormState>({
    goal: "",
    experience: "",
    framework: "",
    dailyMinutes: "",
    target: "",
    difficulty: "balanced",
    diagnosticAnswers: {},
  });
  const sections = [
    "Goal",
    "Experience",
    "Technology",
    "Study time",
    "Target",
    "Diagnostic",
    "Your roadmap",
  ];
  const selected = [
    form.goal,
    form.experience,
    form.framework,
    form.dailyMinutes,
    form.target,
  ];
  const canContinue =
    step < 5
      ? Boolean(selected[step])
      : Object.keys(form.diagnosticAnswers).length === diagnostic.length;
  const optionSet = step < 5 ? Object.values(choices)[step] : null;
  const score = Number(plan?.diagnosticScore ?? 0);
  const phaseLabel = useMemo(() => {
    const phase = String(plan?.recommendedPhase ?? "phase-00");
    return (
      (
        {
          "phase-00": "Orientation & setup",
          "phase-01": "Web foundations",
          "phase-03": "Frontend engineering",
          "phase-05": "Backend and systems",
        } as Record<string, string>
      )[phase] ?? "Foundations"
    );
  }, [plan]);

  const advance = async () => {
    if (step < 5) return setStep((current) => current + 1);
    if (step === 5) {
      const diagnosticScore = Object.entries(correctAnswers).reduce(
        (total, [question, answer]) =>
          total + (form.diagnosticAnswers[question] === answer ? 1 : 0),
        0,
      );
      const recommendedPhase =
        diagnosticScore <= 1
          ? "phase-00"
          : diagnosticScore <= 3
            ? "phase-01"
            : diagnosticScore <= 4
              ? "phase-03"
              : "phase-05";
      setPlan({
        diagnosticScore,
        recommendedPhase,
        dailyMissionMinutes: Number(form.dailyMinutes),
        weeklyTargetMinutes: Number(form.dailyMinutes) * 6,
      });
      setStep(6);
    }
  };

  const finish = async () => {
    const result = await account.saveOnboarding({
      ...form,
      dailyMinutes: Number(form.dailyMinutes),
    });
    if (result) await account.refreshProfile();
  };

  return (
    <main className="onboarding-shell">
      <header className="onboarding-brand">
        <span>
          <Command /> FORGE
        </span>
        <small>Personal setup</small>
      </header>
      <div className="onboarding-progress" aria-label={`Step ${step + 1} of 7`}>
        {sections.map((label, index) => (
          <span key={label} className={index <= step ? "active" : ""}>
            <i />
            {label}
          </span>
        ))}
      </div>
      <section className="onboarding-card panel">
        {step < 5 && optionSet && (
          <>
            <span className="eyebrow teal">STEP {step + 1} OF 7</span>
            <h1>
              {
                [
                  "What do you want to become?",
                  "Where are you starting?",
                  "Choose your frontend path",
                  "How much time can you study?",
                  "What is your immediate target?",
                ][step]
              }
            </h1>
            <p>
              Your answer shapes the route, not your mastery. Forge still asks
              you to prove what you know.
            </p>
            <div className="onboarding-options">
              {optionSet.map(([value, label, description]) => {
                const key = Object.keys(choices)[step] as keyof typeof choices;
                return (
                  <button
                    key={value}
                    type="button"
                    className={selected[step] === value ? "selected" : ""}
                    onClick={() => setForm({ ...form, [key]: value })}
                  >
                    <span>
                      <b>{label}</b>
                      <small>{description}</small>
                    </span>
                    {selected[step] === value && <CheckCircle2 />}
                  </button>
                );
              })}
            </div>
          </>
        )}
        {step === 5 && (
          <>
            <span className="eyebrow teal">STEP 6 OF 7 · DIAGNOSTIC</span>
            <h1>Find the right starting point</h1>
            <p>
              This short check suggests where to begin. It never marks a skill
              mastered.
            </p>
            <label className="difficulty-choice">
              Challenge level
              <select
                value={form.difficulty}
                onChange={(event) =>
                  setForm({ ...form, difficulty: event.target.value })
                }
              >
                <option value="beginner">Beginner-friendly</option>
                <option value="balanced">Balanced</option>
                <option value="challenging">Challenging</option>
              </select>
            </label>
            <div className="diagnostic-list">
              {diagnostic.map((question, index) => (
                <fieldset key={question.id}>
                  <legend>
                    {index + 1}. {question.question}
                  </legend>
                  {question.options.map(([value, label]) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name={question.id}
                        checked={form.diagnosticAnswers[question.id] === value}
                        onChange={() =>
                          setForm({
                            ...form,
                            diagnosticAnswers: {
                              ...form.diagnosticAnswers,
                              [question.id]: value,
                            },
                          })
                        }
                      />
                      {label}
                    </label>
                  ))}
                </fieldset>
              ))}
            </div>
          </>
        )}
        {step === 6 && plan && (
          <div className="roadmap-result">
            <Target />
            <span className="eyebrow teal">YOUR PERSONAL ROADMAP</span>
            <h1>Start with {phaseLabel}</h1>
            <p>
              Your diagnostic found {score} of {diagnostic.length} foundation
              signals. This is a starting recommendation—not a mastery claim.
            </p>
            <div className="roadmap-plan-grid">
              <div>
                <small>Daily mission</small>
                <b>{String(plan.dailyMissionMinutes)} minutes</b>
              </div>
              <div>
                <small>Weekly target</small>
                <b>{String(plan.weeklyTargetMinutes)} minutes</b>
              </div>
              <div>
                <small>Suggested start</small>
                <b>{phaseLabel}</b>
              </div>
            </div>
            <button
              className="primary-button"
              disabled={account.profileLoading}
              onClick={() => void finish()}
            >
              {account.profileLoading
                ? "Saving your roadmap…"
                : "Open my Forge dashboard"}{" "}
              <ArrowRight />
            </button>
          </div>
        )}
        {account.error && (
          <div className="account-error" role="alert">
            {account.error}
          </div>
        )}
        {step < 6 && (
          <footer className="onboarding-actions">
            <button
              className="secondary-button"
              disabled={step === 0}
              onClick={() => setStep((current) => current - 1)}
            >
              <ArrowLeft /> Back
            </button>
            <button
              className="primary-button"
              disabled={!canContinue || account.profileLoading}
              onClick={() => void advance()}
            >
              {account.profileLoading
                ? "Building your roadmap…"
                : step === 5
                  ? "Build my roadmap"
                  : "Continue"}
              <ArrowRight />
            </button>
          </footer>
        )}
      </section>
    </main>
  );
}
