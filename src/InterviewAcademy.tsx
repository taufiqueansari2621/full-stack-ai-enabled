import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Bug,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Code2,
  History,
  Lightbulb,
  MessageSquareText,
  Network,
  Search,
  Target,
  Trophy,
  UserRound,
} from "lucide-react";
import {
  INTERVIEW_QUESTION_COUNT,
  getInterviewQuestionPage,
  interviewDifficulties,
  interviewFormats,
  interviewPhaseOptions,
  interviewRoles,
  interviewTopics,
  pickInterviewQuestions,
  type InterviewDifficulty,
  type InterviewFilters,
  type InterviewFormat,
  type InterviewQuestion,
  type InterviewRole,
} from "./interviewQuestionBank";
import type { ForgeStore } from "./useForgeStore";

type PageProps = {
  store: ForgeStore;
  notify: (text: string) => void;
};

type AnswerResult = {
  score: number;
  strengths: string[];
  feedback: string[];
};

const defaultFilters: InterviewFilters = {
  role: "All roles",
  phaseId: "all",
  difficulty: "All levels",
  format: "All formats",
  query: "",
};

function InterviewFormatIcon({ format }: { format: InterviewFormat }) {
  if (format === "Coding & practical") return <Code2 />;
  if (format === "Debugging") return <Bug />;
  if (format === "System design") return <Network />;
  if (format === "Experience") return <UserRound />;
  return <MessageSquareText />;
}

const importantTopicWords = (topic: string) =>
  topic
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter(
      (word) =>
        word.length >= 3 &&
        !["and", "with", "the", "for", "from", "into"].includes(word),
    );

const gradeAnswer = (
  question: InterviewQuestion,
  answer: string,
): AnswerResult => {
  const value = answer.toLowerCase();
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const topicWords = importantTopicWords(question.topic);
  const expectedLength =
    question.difficulty === "Beginner"
      ? 70
      : question.difficulty === "Intermediate"
        ? 110
        : 150;
  const checks = [
    {
      label: `Give enough detail for a ${question.difficulty.toLowerCase()} answer (${expectedLength}+ words).`,
      pass: words.length >= expectedLength,
    },
    {
      label: `Use the important vocabulary for ${question.topic}.`,
      pass: topicWords.some((word) => value.includes(word)),
    },
    {
      label: "Explain how or why it works, not only what it is.",
      pass: /because|therefore|first|then|when|flow|step|cause|results? in/.test(
        value,
      ),
    },
    {
      label: "Include a concrete example, project, or realistic scenario.",
      pass: /example|project|scenario|for instance|suppose|in practice|i (built|used|worked)/.test(
        value,
      ),
    },
    {
      label: "Explain how you would test, measure, monitor, or verify it.",
      pass: /test|verify|measure|monitor|metric|log|trace|check|assert/.test(value),
    },
    {
      label: "Discuss a trade-off, risk, limit, failure, cost, or alternative.",
      pass: /trade.?off|risk|limit|failure|cost|alternative|security|performance|latency|memory/.test(
        value,
      ),
    },
  ];

  if (question.format === "Debugging")
    checks.push({
      label:
        "Separate expected and actual behavior, form a hypothesis, and prevent regression.",
      pass:
        /expected/.test(value) &&
        /actual|observed/.test(value) &&
        /hypoth|reproduc|regression|root cause/.test(value),
    });
  if (question.format === "System design")
    checks.push({
      label:
        "State requirements and describe boundaries, data flow, and failure behavior.",
      pass:
        /requirement|constraint/.test(value) &&
        /data|request|event/.test(value) &&
        /service|component|boundary|database|queue|cache/.test(value),
    });
  if (question.format === "Experience")
    checks.push({
      label: "Make your responsibility, action, result, and reflection clear.",
      pass:
        /responsib|my role|i decided/.test(value) &&
        /result|improved|reduced|increased|learned/.test(value),
    });

  const strengths = checks.filter((check) => check.pass).map((check) => check.label);
  const feedback = checks.filter((check) => !check.pass).map((check) => check.label);
  return {
    score: Math.round((strengths.length / checks.length) * 100),
    strengths,
    feedback,
  };
};

const formatTime = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export default function InterviewAcademy({ store, notify }: PageProps) {
  const [screen, setScreen] = useState<"bank" | "history" | "session">(
    "bank",
  );
  const [filters, setFilters] = useState<InterviewFilters>(defaultFilters);
  const [page, setPage] = useState(0);
  const [session, setSession] = useState<InterviewQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const pageSize = 12;

  const questionPage = useMemo(
    () => getInterviewQuestionPage(filters, page * pageSize, pageSize),
    [filters, page],
  );
  const totalPages = Math.max(1, Math.ceil(questionPage.total / pageSize));
  const attempts = store.state.interviewResults;
  const bestScore = attempts.length
    ? Math.max(...attempts.map((attempt) => attempt.score))
    : 0;
  const activeQuestion = session[questionIndex];
  const currentWordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  const roleCounts = useMemo(
    () =>
      Object.fromEntries(
        interviewRoles.slice(1).map((role) => [
          role,
          getInterviewQuestionPage(
            { ...defaultFilters, role: role as InterviewRole },
            0,
            1,
          ).total,
        ]),
      ) as Record<Exclude<InterviewRole, "All roles">, number>,
    [],
  );

  const weakTopics = useMemo(() => {
    const groups = new Map<string, { total: number; count: number }>();
    attempts.forEach((attempt) => {
      const topic = attempt.topic ?? "Earlier interview practice";
      const current = groups.get(topic) ?? { total: 0, count: 0 };
      groups.set(topic, {
        total: current.total + attempt.score,
        count: current.count + 1,
      });
    });
    return [...groups.entries()]
      .map(([topic, value]) => ({
        topic,
        average: Math.round(value.total / value.count),
        attempts: value.count,
      }))
      .filter((item) => item.average < 70)
      .sort((a, b) => a.average - b.average)
      .slice(0, 6);
  }, [attempts]);

  useEffect(() => {
    if (screen !== "session" || sessionComplete) return;
    const timer = window.setInterval(
      () => setElapsed((current) => current + 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [screen, sessionComplete]);

  const updateFilters = (next: Partial<InterviewFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
    setPage(0);
  };

  const beginSession = (questions: InterviewQuestion[]) => {
    if (!questions.length) {
      notify("No questions match these filters");
      return;
    }
    setSession(questions);
    setQuestionIndex(0);
    setAnswer("");
    setResult(null);
    setShowHint(false);
    setScores([]);
    setElapsed(0);
    setSessionComplete(false);
    setScreen("session");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startSession = (count: number) =>
    beginSession(pickInterviewQuestions(filters, count));

  const submit = () => {
    if (!activeQuestion) return;
    const answerResult = gradeAnswer(activeQuestion, answer);
    setResult(answerResult);
    setScores((current) => [...current, answerResult.score]);
    store.saveInterview({
      questionId: activeQuestion.id,
      question: activeQuestion.prompt,
      topic: activeQuestion.topic,
      phase: activeQuestion.phase,
      difficulty: activeQuestion.difficulty,
      format: activeQuestion.format,
      answer: answer.trim(),
      score: answerResult.score,
      feedback: answerResult.feedback,
      strengths: answerResult.strengths,
    });
    notify(`Answer saved · ${answerResult.score}% structure score`);
  };

  const moveNext = () => {
    if (questionIndex + 1 >= session.length) {
      setSessionComplete(true);
      return;
    }
    setQuestionIndex((current) => current + 1);
    setAnswer("");
    setResult(null);
    setShowHint(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (screen === "session") {
    const sessionAverage = scores.length
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;
    if (sessionComplete)
      return (
        <div className="page interview-academy interview-session-summary">
          <section className="interview-summary-card panel">
            <Trophy />
            <span className="eyebrow teal">SESSION COMPLETE</span>
            <h1>{sessionAverage}% average structure score</h1>
            <p>
              You answered {scores.length} questions in {formatTime(elapsed)}.
              Review the missing answer elements before trying a new set.
            </p>
            <div className="interview-summary-metrics">
              <span><b>{scores.filter((score) => score >= 70).length}</b> strong answers</span>
              <span><b>{scores.filter((score) => score < 70).length}</b> need review</span>
              <span><b>{Math.max(...scores, 0)}%</b> best answer</span>
            </div>
            <div className="interview-summary-actions">
              <button className="secondary-button" onClick={() => setScreen("history")}>
                <History /> Review my history
              </button>
              <button className="primary-button" onClick={() => { setScreen("bank"); setSessionComplete(false); }}>
                New interview <ArrowRight />
              </button>
            </div>
          </section>
        </div>
      );

    if (!activeQuestion) return null;
    return (
      <div className="page interview-academy interview-session">
        <div className="interview-session-toolbar">
          <button className="back-link" onClick={() => setScreen("bank")}>
            <ChevronLeft /> End session
          </button>
          <div>
            <span>{questionIndex + 1} of {session.length}</span>
            <span><Clock3 /> {formatTime(elapsed)}</span>
          </div>
        </div>
        <div className="interview-session-progress" aria-label={`Question ${questionIndex + 1} of ${session.length}`}>
          <i style={{ width: `${((questionIndex + 1) / session.length) * 100}%` }} />
        </div>
        <article className="interview-question interview-question-pro panel">
          <header>
            <div className="interviewer">
              <span><InterviewFormatIcon format={activeQuestion.format} /></span>
              <div>
                <b>Forge Interviewer</b>
                <small>{activeQuestion.phase} · {activeQuestion.module}</small>
              </div>
            </div>
            <div className="interview-question-tags">
              <span>{activeQuestion.difficulty}</span>
              <span>{activeQuestion.format}</span>
            </div>
          </header>
          <span className="eyebrow teal">{activeQuestion.topic}</span>
          <h1>{activeQuestion.prompt}</h1>
          <p className="interview-instruction">
            Answer aloud first, then write the important points. The built-in
            score checks answer structure; it does not prove technical correctness.
          </p>
          {showHint && (
            <div className="interview-hint" aria-live="polite">
              <Lightbulb />
              <p>{activeQuestion.hint}</p>
            </div>
          )}
          <label className="interview-answer-box">
            <span>
              <b>Your answer</b>
              <small>{currentWordCount} words · 60 minimum</small>
            </span>
            <textarea
              disabled={Boolean(result)}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Explain your reasoning, example, checks, and trade-offs…"
            />
          </label>
          {result && (
            <section className={`interview-result interview-result-pro ${result.score >= 70 ? "success" : "warning"}`}>
              <div className="interview-score-block">
                <b>{result.score}%</b>
                <span>structure score</span>
              </div>
              <div className="interview-feedback-columns">
                <div>
                  <h3><CheckCircle2 /> Strong parts</h3>
                  {result.strengths.length ? (
                    <ul>{result.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
                  ) : <p>Build a clearer answer structure and try again.</p>}
                </div>
                <div>
                  <h3><Target /> Improve next</h3>
                  {result.feedback.length ? (
                    <ul>{result.feedback.map((item) => <li key={item}>{item}</li>)}</ul>
                  ) : <p>Your answer included every structure checkpoint.</p>}
                </div>
              </div>
              <div className="interview-answer-guide">
                <h3>Strong-answer outline</h3>
                <ol>{activeQuestion.answerGuide.map((item) => <li key={item}>{item}</li>)}</ol>
                <p><b>Follow-up:</b> {activeQuestion.followUp}</p>
              </div>
            </section>
          )}
          <footer className="interview-actions">
            <button
              className="secondary-button"
              disabled={showHint || Boolean(result)}
              onClick={() => setShowHint(true)}
            >
              <Lightbulb /> {showHint ? "Hint shown" : "Get a hint"}
            </button>
            {result ? (
              <button className="primary-button" onClick={moveNext}>
                {questionIndex + 1 === session.length ? "Finish session" : "Next question"}
                <ArrowRight />
              </button>
            ) : (
              <button
                className="primary-button"
                disabled={currentWordCount < 60}
                onClick={submit}
              >
                Score my answer <ArrowRight />
              </button>
            )}
          </footer>
        </article>
      </div>
    );
  }

  return (
    <div className="page interview-academy">
      <section className="page-title interview-page-title">
        <div>
          <span className="eyebrow">ZERO TO PRODUCT-COMPANY READY</span>
          <h1>Interview <span className="gradient-text">academy</span></h1>
          <p>Practice every roadmap topic with clear answer guides and saved feedback.</p>
        </div>
        <div className="interview-bank-total">
          <MessageSquareText />
          <span><b>{INTERVIEW_QUESTION_COUNT.toLocaleString()}</b> questions</span>
        </div>
      </section>

      <section className="interview-academy-hero panel">
        <div>
          <span className="eyebrow teal">COMPLETE INTERVIEW PREPARATION</span>
          <h2>{interviewTopics.length} topics. Three levels. Five question formats.</h2>
          <p>
            Build explanations, coding plans, debugging skills, system-design
            judgment, and strong experience stories across the complete curriculum.
          </p>
        </div>
        <div className="interview-hero-metrics">
          <span><b>{attempts.length}</b> answers saved</span>
          <span><b>{store.metrics.interviewAverage}%</b> average</span>
          <span><b>{bestScore}%</b> best</span>
        </div>
      </section>

      <section className="interview-role-grid" aria-label="Interview role tracks">
        {(interviewRoles.slice(1) as Exclude<InterviewRole, "All roles">[]).map((role) => (
          <button
            key={role}
            className={filters.role === role ? "active panel" : "panel"}
            aria-pressed={filters.role === role}
            onClick={() => updateFilters({ role })}
          >
            {role === "Frontend Developer" ? <Code2 /> : role === "AI Engineer" ? <BrainCircuit /> : <Network />}
            <span><b>{role}</b><small>{roleCounts[role].toLocaleString()} questions</small></span>
            <ArrowRight />
          </button>
        ))}
      </section>

      <section className="interview-session-builder panel">
        <div>
          <span className="eyebrow">BUILD A PRACTICE SESSION</span>
          <h2>Choose the interview length</h2>
          <p>Your active filters decide which questions are included.</p>
        </div>
        <div>
          <button onClick={() => startSession(5)}><span><b>Quick practice</b><small>5 questions</small></span><ArrowRight /></button>
          <button onClick={() => startSession(10)}><span><b>Mock interview</b><small>10 questions</small></span><ArrowRight /></button>
          <button onClick={() => startSession(20)}><span><b>Full interview loop</b><small>20 questions</small></span><ArrowRight /></button>
        </div>
      </section>

      <div className="interview-view-tabs" role="tablist" aria-label="Interview academy views">
        <button role="tab" aria-selected={screen === "bank"} className={screen === "bank" ? "active" : ""} onClick={() => setScreen("bank")}>
          <Search /> Question bank
        </button>
        <button role="tab" aria-selected={screen === "history"} className={screen === "history" ? "active" : ""} onClick={() => setScreen("history")}>
          <History /> My history <span>{attempts.length}</span>
        </button>
      </div>

      {screen === "history" ? (
        <section className="interview-history-layout">
          <div className="interview-history-summary panel">
            <span className="eyebrow teal">YOUR INTERVIEW SIGNAL</span>
            <h2>{attempts.length ? `${store.metrics.interviewAverage}% average` : "No answers yet"}</h2>
            <p>Scores check answer structure. Use the missing points as a practice list, then ask a person to review technical accuracy.</p>
            <div className="interview-history-metrics">
              <span><b>{attempts.length}</b> answers</span>
              <span><b>{bestScore}%</b> best</span>
              <span><b>{weakTopics.length}</b> review topics</span>
            </div>
            {weakTopics.length > 0 && (
              <div className="interview-weak-topics">
                <h3>Review these topics</h3>
                {weakTopics.map((item) => (
                  <button key={item.topic} onClick={() => { updateFilters({ query: item.topic }); setScreen("bank"); }}>
                    <span><b>{item.topic}</b><small>{item.attempts} answer{item.attempts === 1 ? "" : "s"}</small></span>
                    <em>{item.average}%</em>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="interview-history-list panel">
            <div className="section-head"><div><span className="eyebrow">RECENT ANSWERS</span><h2>Attempt history</h2></div></div>
            {attempts.length ? [...attempts].reverse().slice(0, 20).map((attempt) => (
              <article key={attempt.id}>
                <div><span>{attempt.difficulty ?? "Practice"}</span><span>{attempt.format ?? "Technical"}</span><b className={attempt.score >= 70 ? "strong" : "review"}>{attempt.score}%</b></div>
                <h3>{attempt.topic ?? attempt.question}</h3>
                <p>{attempt.question}</p>
                <small>{new Date(attempt.createdAt).toLocaleDateString()}</small>
              </article>
            )) : (
              <div className="interview-empty"><MessageSquareText /><h3>Your interview history will appear here</h3><p>Start a quick practice set or open any question from the bank.</p><button className="primary-button" onClick={() => setScreen("bank")}>Open question bank <ArrowRight /></button></div>
            )}
          </div>
        </section>
      ) : (
        <>
          <section className="interview-filters panel">
            <label className="interview-search"><span>Search topics</span><div><Search /><input value={filters.query} onChange={(event) => updateFilters({ query: event.target.value })} placeholder="JavaScript, Angular, Python, RAG…" /></div></label>
            <label><span>Role</span><select value={filters.role} onChange={(event) => updateFilters({ role: event.target.value as InterviewRole })}>{interviewRoles.map((role) => <option key={role}>{role}</option>)}</select></label>
            <label><span>Roadmap area</span><select value={filters.phaseId} onChange={(event) => updateFilters({ phaseId: event.target.value })}><option value="all">All roadmap areas</option>{interviewPhaseOptions.map((phase) => <option value={phase.id} key={phase.id}>{phase.title}</option>)}</select></label>
            <label><span>Level</span><select value={filters.difficulty} onChange={(event) => updateFilters({ difficulty: event.target.value as InterviewDifficulty | "All levels" })}>{interviewDifficulties.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}</select></label>
            <label><span>Format</span><select value={filters.format} onChange={(event) => updateFilters({ format: event.target.value as InterviewFormat | "All formats" })}>{interviewFormats.map((format) => <option key={format}>{format}</option>)}</select></label>
          </section>

          <section className="interview-bank-heading">
            <div><span className="eyebrow teal">QUESTION BANK</span><h2>{questionPage.total.toLocaleString()} matching questions</h2><p>Showing {questionPage.total ? page * pageSize + 1 : 0}–{Math.min((page + 1) * pageSize, questionPage.total)} of {questionPage.total.toLocaleString()}</p></div>
            {(filters.query || filters.role !== "All roles" || filters.phaseId !== "all" || filters.difficulty !== "All levels" || filters.format !== "All formats") && <button className="secondary-button" onClick={() => { setFilters(defaultFilters); setPage(0); }}>Clear filters</button>}
          </section>

          {questionPage.items.length ? (
            <div className="interview-question-grid">
              {questionPage.items.map((question) => {
                return (
                  <article className="interview-bank-card panel" key={question.id}>
                    <header><span><InterviewFormatIcon format={question.format} /></span><div><small>{question.phase}</small><b>{question.topic}</b></div></header>
                    <div className="interview-question-tags"><span>{question.difficulty}</span><span>{question.format}</span></div>
                    <h3>{question.prompt}</h3>
                    <p>{question.module}</p>
                    <button className="secondary-button" onClick={() => beginSession([question])}>Practice this question <ArrowRight /></button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="interview-empty panel"><Search /><h3>No questions match these filters</h3><p>Try a broader topic or clear one of the filters.</p><button className="primary-button" onClick={() => { setFilters(defaultFilters); setPage(0); }}>Clear filters</button></div>
          )}

          {questionPage.total > pageSize && (
            <div className="interview-pagination">
              <button className="secondary-button" disabled={page === 0} onClick={() => { setPage((current) => Math.max(0, current - 1)); window.scrollTo({ top: 700, behavior: "smooth" }); }}><ChevronLeft /> Previous</button>
              <span>Page {page + 1} of {totalPages.toLocaleString()}</span>
              <button className="secondary-button" disabled={page + 1 >= totalPages} onClick={() => { setPage((current) => current + 1); window.scrollTo({ top: 700, behavior: "smooth" }); }}>Next <ArrowRight /></button>
            </div>
          )}
        </>
      )}

      <section className="interview-integrity-note panel">
        <BarChart3 />
        <div><b>What the score means</b><p>Forge checks whether your answer includes the expected structure, examples, verification, and trade-offs. It does not use an AI model here and does not claim that every technical statement is correct.</p></div>
      </section>
    </div>
  );
}
