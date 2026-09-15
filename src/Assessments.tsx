import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  CircleAlert,
  LockKeyhole,
  Printer,
  RotateCcw,
  Target,
  Trophy,
} from "lucide-react";
import type { LearnerProfile } from "./useLocalProfiles";
import type { ForgeStore } from "./useForgeStore";
import { curriculumLessons } from "./curriculum";

type Question = {
  id: string;
  topic: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
};
const foundationQuiz: Question[] = [
  {
    id: "q1",
    topic: "Computer basics",
    prompt:
      "What primarily holds values that a running program is actively using?",
    options: ["RAM", "SSD", "Monitor", "Keyboard"],
    answer: "RAM",
    explanation:
      "RAM is fast working memory for active programs. An SSD provides persistent storage.",
  },
  {
    id: "q2",
    topic: "How the web works",
    prompt: "Which sequence best represents opening a new website?",
    options: [
      "URL → DNS → connection → HTTP request → response → render",
      "HTML → DNS → keyboard → server",
      "HTTP → CSS → DNS → storage",
      "Server → URL → DNS → browser installation",
    ],
    answer: "URL → DNS → connection → HTTP request → response → render",
    explanation:
      "The browser parses the URL, resolves the hostname, connects, exchanges HTTP messages, then renders returned resources.",
  },
  {
    id: "q3",
    topic: "HTML structure",
    prompt:
      "Where does the primary visible content of an HTML document belong?",
    options: ["body", "head", "title", "doctype"],
    answer: "body",
    explanation:
      "The body contains user-facing document content. The head contains metadata and linked resources.",
  },
  {
    id: "q4",
    topic: "Accessibility",
    prompt: "Which control should trigger an action on the current page?",
    options: [
      "A native button",
      "A div with a click handler",
      "A styled span",
      "A heading",
    ],
    answer: "A native button",
    explanation:
      "A native button already provides the correct role, keyboard activation, focus behavior, and disabled semantics.",
  },
  {
    id: "q5",
    topic: "Forms",
    prompt:
      "Why must a server validate data even when an HTML form uses required fields?",
    options: [
      "Client validation can be bypassed",
      "required only works on mobile",
      "Servers cannot read HTML",
      "It improves CSS",
    ],
    answer: "Client validation can be bypassed",
    explanation:
      "Anything sent by a client is untrusted. Client checks improve UX; server checks protect the system and its data.",
  },
  {
    id: "q6",
    topic: "CSS box model",
    prompt:
      "With box-sizing: border-box, what is included in the declared width?",
    options: [
      "Content, padding, and border",
      "Only content",
      "Content and margin",
      "Only padding",
    ],
    answer: "Content, padding, and border",
    explanation:
      "border-box includes padding and border inside the declared size. Margin remains outside.",
  },
  {
    id: "q7",
    topic: "Responsive design",
    prompt: "What is the strongest reason to choose a responsive breakpoint?",
    options: [
      "The content no longer fits or reads well",
      "A popular phone width",
      "Every 100 pixels",
      "The framework requires it",
    ],
    answer: "The content no longer fits or reads well",
    explanation:
      "Content-driven breakpoints respond to real layout pressure and survive devices that were not explicitly targeted.",
  },
  {
    id: "q8",
    topic: "JavaScript values",
    prompt: "What does return do inside a JavaScript function?",
    options: [
      "Ends the call and provides a value to its caller",
      "Always prints to the console",
      "Creates a global variable",
      "Repeats the function",
    ],
    answer: "Ends the call and provides a value to its caller",
    explanation:
      "return completes the current function call and makes its result available to the calling expression.",
  },
  {
    id: "q9",
    topic: "JavaScript arrays",
    prompt:
      "Which method creates a new array containing only items that pass a test?",
    options: ["filter", "find", "push", "forEach"],
    answer: "filter",
    explanation:
      "filter evaluates every item and returns a new array containing those whose callback returned a truthy value.",
  },
  {
    id: "q10",
    topic: "Async JavaScript",
    prompt:
      "What executes after synchronous code but before the next timer task?",
    options: [
      "Queued microtasks",
      "Another script download",
      "CSS layout in every case",
      "Nothing",
    ],
    answer: "Queued microtasks",
    explanation:
      "After the current stack finishes, the event loop drains microtasks before selecting the next task such as a timer callback.",
  },
];

export function QuizzesPage({
  store,
  notify,
}: {
  store: ForgeStore;
  notify: (text: string) => void;
}) {
  const [started, setStarted] = useState(false),
    [index, setIndex] = useState(0),
    [answers, setAnswers] = useState<Record<string, string>>({}),
    [submitted, setSubmitted] = useState(false);
  const latest = [...store.state.quizResults]
    .reverse()
    .find((item) => item.quizId === "foundation-assessment");
  const correct = foundationQuiz.filter(
    (item) => answers[item.id] === item.answer,
  ).length;
  const score = Math.round((correct / foundationQuiz.length) * 100);
  const weakTopics = foundationQuiz
    .filter((item) => answers[item.id] !== item.answer)
    .map((item) => item.topic);
  const reset = () => {
    setStarted(true);
    setIndex(0);
    setAnswers({});
    setSubmitted(false);
  };
  if (!started)
    return (
      <div className="page">
        <section className="page-title">
          <div>
            <span className="eyebrow teal">ASSESSMENTS</span>
            <h1>Quizzes that prove understanding</h1>
            <p>
              Answers, scores, weak topics, and recommendations are saved to
              your local profile.
            </p>
          </div>
          {latest && (
            <div className="live-stat">
              <Trophy />
              <div>
                <b>{latest.score}%</b>
                <span>latest foundation score</span>
              </div>
            </div>
          )}
        </section>
        <article className="assessment-launch panel">
          <Award />
          <div>
            <span className="eyebrow">FOUNDATION PATH ASSESSMENT</span>
            <h2>Computer, Web, HTML, CSS & JavaScript Foundations</h2>
            <p>
              10 questions · passing score 80% · explanations and revision
              guidance included
            </p>
            <div className="assessment-tags">
              <span>Multiple choice</span>
              <span>Concept reasoning</span>
              <span>Saved result</span>
            </div>
          </div>
          <button className="primary-button" onClick={reset}>
            {latest ? "Retry assessment" : "Start assessment"}
            <ArrowRight />
          </button>
        </article>
      </div>
    );
  if (submitted)
    return (
      <div className="page">
        <button className="back-link" onClick={() => setStarted(false)}>
          <ArrowLeft /> All quizzes
        </button>
        <section
          className={`assessment-result panel ${score >= 80 ? "passed" : "needs-review"}`}
        >
          <div>
            {score >= 80 ? <CheckCircle2 /> : <CircleAlert />}
            <span>{score >= 80 ? "PASSED" : "NEEDS REVIEW"}</span>
            <h1>
              {correct} / {foundationQuiz.length}
            </h1>
            <p>{score}% accuracy · passing score 80%</p>
          </div>
          <button className="secondary-button" onClick={reset}>
            <RotateCcw /> Retry quiz
          </button>
        </section>
        <div className="answer-review">
          {foundationQuiz.map((item, questionIndex) => {
            const ok = answers[item.id] === item.answer;
            return (
              <article
                className={`panel ${ok ? "correct" : "wrong"}`}
                key={item.id}
              >
                <span>
                  QUESTION {questionIndex + 1} · {item.topic.toUpperCase()}
                </span>
                <h2>{item.prompt}</h2>
                <p>
                  <b>Your answer:</b> {answers[item.id] ?? "Not answered"}
                </p>
                {!ok && (
                  <p>
                    <b>Correct answer:</b> {item.answer}
                  </p>
                )}
                <div>
                  <LightExplanation ok={ok} text={item.explanation} />
                </div>
              </article>
            );
          })}
        </div>
        {score < 80 && (
          <section className="revision-plan panel">
            <Target />
            <div>
              <h2>Recommended revision</h2>
              <p>Review these weak areas before retrying:</p>
              <div>
                {weakTopics.map((topic) => (
                  <span key={topic}>{topic}</span>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    );
  const item = foundationQuiz[index];
  return (
    <div className="page quiz-session">
      <button className="back-link" onClick={() => setStarted(false)}>
        <ArrowLeft /> Exit assessment
      </button>
      <div className="quiz-session-top">
        <span>
          QUESTION {index + 1} / {foundationQuiz.length}
        </span>
        <b>{Math.round(((index + 1) / foundationQuiz.length) * 100)}%</b>
      </div>
      <div className="bar">
        <i
          style={{ width: `${((index + 1) / foundationQuiz.length) * 100}%` }}
        />
      </div>
      <article className="quiz-question panel">
        <span className="eyebrow teal">{item.topic.toUpperCase()}</span>
        <h1>{item.prompt}</h1>
        <div className="challenge-options">
          {item.options.map((option) => (
            <button
              className={answers[item.id] === option ? "selected" : ""}
              key={option}
              onClick={() => setAnswers({ ...answers, [item.id]: option })}
            >
              <span>{option}</span>
            </button>
          ))}
        </div>
      </article>
      <footer className="quiz-navigation">
        <button
          className="secondary-button"
          disabled={!index}
          onClick={() => setIndex(index - 1)}
        >
          <ArrowLeft /> Previous
        </button>
        {index < foundationQuiz.length - 1 ? (
          <button
            className="primary-button"
            disabled={!answers[item.id]}
            onClick={() => setIndex(index + 1)}
          >
            Next <ArrowRight />
          </button>
        ) : (
          <button
            className="primary-button"
            disabled={Object.keys(answers).length !== foundationQuiz.length}
            onClick={() => {
              setSubmitted(true);
              store.saveQuiz({
                quizId: "foundation-assessment",
                score,
                correct,
                total: foundationQuiz.length,
                weakTopics,
              });
              notify(
                score >= 80
                  ? `Assessment passed · ${score}%`
                  : `Assessment saved · review ${weakTopics.length} topics`,
              );
            }}
          >
            Submit assessment <Check />
          </button>
        )}
      </footer>
    </div>
  );
}

function LightExplanation({ ok, text }: { ok: boolean; text: string }) {
  return (
    <p className="answer-explanation">
      {ok ? <CheckCircle2 /> : <CircleAlert />}
      <span>
        <b>{ok ? "Correct reasoning" : "Explanation"}</b>
        {text}
      </span>
    </p>
  );
}

export function CertificatesPage({
  store,
  profile,
  notify,
}: {
  store: ForgeStore;
  profile: LearnerProfile;
  notify: (text: string) => void;
}) {
  const required = curriculumLessons.map((item) => item.id),
    completed = required.filter((id) =>
      store.state.completedLessons.includes(id),
    ).length;
  const passing = [...store.state.quizResults]
    .reverse()
    .find(
      (item) => item.quizId === "foundation-assessment" && item.score >= 80,
    );
  const certificate = store.state.certificates.find(
    (item) => item.certificateId === "forge-foundations",
  );
  const eligible = completed === required.length && Boolean(passing);
  const issue = () => {
    if (!passing) return;
    const credentialId = `FORGE-FND-${new Date().getFullYear()}-${profile.id.slice(-6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    store.earnCertificate({
      certificateId: "forge-foundations",
      credentialId,
      score: passing.score,
    });
    notify("Foundation Certificate of Completion issued");
  };
  if (certificate)
    return (
      <div className="page certificate-page">
        <section className="page-title no-print">
          <div>
            <span className="eyebrow teal">YOUR CREDENTIAL</span>
            <h1>Certificate of Completion</h1>
            <p>
              A local Forge learning credential based on recorded completion and
              assessment evidence.
            </p>
          </div>
          <button className="primary-button" onClick={() => window.print()}>
            <Printer /> Print / Save PDF
          </button>
        </section>
        <article className="certificate-sheet">
          <div className="certificate-mark">
            <Award />
          </div>
          <span>FORGE · AI ENGINEERING</span>
          <h1>Certificate of Completion</h1>
          <p>This certifies that</p>
          <h2>{profile.fullName}</h2>
          <p>successfully completed the</p>
          <h3>Full-Stack + AI Foundations</h3>
          <div className="certificate-score">
            <div>
              <b>{certificate.score}%</b>
              <span>Assessment score</span>
            </div>
            <div>
              <b>{required.length}</b>
              <span>Required lessons</span>
            </div>
          </div>
          <footer>
            <div>
              <span>Issued</span>
              <b>{new Date(certificate.issuedAt).toLocaleDateString()}</b>
            </div>
            <div>
              <span>Credential ID</span>
              <b>{certificate.credentialId}</b>
            </div>
          </footer>
          <small>
            Local Certificate of Completion · This credential is not external
            accreditation.
          </small>
        </article>
      </div>
    );
  return (
    <div className="page">
      <section className="page-title">
        <div>
          <span className="eyebrow teal">CERTIFICATES</span>
          <h1>Credentials backed by learning evidence</h1>
          <p>
            Opening content never earns a certificate. Complete the required
            learning and pass its assessment.
          </p>
        </div>
      </section>
      <article className="certificate-card panel">
        <div className="certificate-lock">
          {eligible ? <Award /> : <LockKeyhole />}
        </div>
        <div>
          <span className="eyebrow">FOUNDATION CERTIFICATE</span>
          <h2>Full-Stack + AI Foundations</h2>
          <p>
            Certificate of Completion for computer, web, HTML, CSS,
            accessibility, and JavaScript foundations.
          </p>
          <ul>
            <li className={completed === required.length ? "done" : ""}>
              {completed === required.length ? <Check /> : <span />} Required
              lessons: {completed}/{required.length}
            </li>
            <li className={passing ? "done" : ""}>
              {passing ? <Check /> : <span />} Foundation assessment:{" "}
              {passing ? `${passing.score}% passed` : "80% required"}
            </li>
          </ul>
        </div>
        <button className="primary-button" disabled={!eligible} onClick={issue}>
          {eligible ? "Issue certificate" : "Requirements incomplete"}
          <Award />
        </button>
      </article>
    </div>
  );
}
