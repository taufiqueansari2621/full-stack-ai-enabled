import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Code2,
  Lightbulb,
  RotateCcw,
  Target,
} from "lucide-react";
import { curriculumLessons } from "./curriculum";
import type { NavId } from "./data";
import type { ForgeStore } from "./useForgeStore";

export function CurriculumLearning({
  store,
  notify,
  navigate,
}: {
  store: ForgeStore;
  notify: (text: string) => void;
  navigate: (id: NavId) => void;
}) {
  const savedIndex = Math.max(
    0,
    curriculumLessons.findIndex(
      (item) => item.title === store.state.currentPosition.lesson,
    ),
  );
  const [index, setIndex] = useState(savedIndex);
  const [selected, setSelected] = useState("");
  const [checked, setChecked] = useState(false);
  const lesson = curriculumLessons[index];
  const completed = store.state.completedLessons.includes(lesson.id);
  const correct = checked && selected === lesson.quiz.answer;
  const progress = Math.round(
    (store.state.completedLessons.filter((id) =>
      curriculumLessons.some((item) => item.id === id),
    ).length /
      curriculumLessons.length) *
      100,
  );
  const next = curriculumLessons[index + 1];
  const completedIds = useMemo(
    () => new Set(store.state.completedLessons),
    [store.state.completedLessons],
  );
  const { setLearningPosition } = store;

  useEffect(
    () =>
      setLearningPosition({
        page: "learn",
        course: "Full-Stack + AI",
        module: lesson.phase,
        lesson: lesson.title,
        section: `Day ${lesson.day} · Tutorial`,
      }),
    [lesson, setLearningPosition],
  );
  const open = (nextIndex: number) => {
    setIndex(nextIndex);
    setSelected("");
    setChecked(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const submit = () => {
    if (!selected) return;
    setChecked(true);
    const ok = selected === lesson.quiz.answer;
    store.saveAttempt({
      challengeId: `${lesson.id}-quiz`,
      correct: ok,
      answer: selected,
    });
    notify(
      ok
        ? "Correct — your quiz evidence was saved"
        : "Attempt saved — review the explanation",
    );
  };
  const finish = () => {
    store.completeLesson(lesson.id);
    notify(`Day ${lesson.day} completed — progress saved`);
    if (next) window.setTimeout(() => open(index + 1), 500);
  };

  return (
    <div className="page curriculum-page">
      <button className="back-link" onClick={() => navigate("roadmap")}>
        <ChevronLeft /> Roadmap
      </button>
      <section className="curriculum-head">
        <div>
          <span className="eyebrow teal">
            DAY {lesson.day} · {lesson.phase.toUpperCase()}
          </span>
          <h1>{lesson.title}</h1>
          <p>{lesson.goal}</p>
        </div>
        <div className="curriculum-progress">
          <b>{progress}%</b>
          <span>course progress</span>
          <div className="bar">
            <i style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>
      <div className="curriculum-layout">
        <aside className="day-list panel" aria-label="Course lessons">
          <span className="eyebrow">START FROM ZERO</span>
          <h2>Foundation course</h2>
          {curriculumLessons.map((item, i) => (
            <button
              key={item.id}
              className={i === index ? "active" : ""}
              onClick={() => open(i)}
            >
              <span>{completedIds.has(item.id) ? <Check /> : item.day}</span>
              <div>
                <b>{item.title}</b>
                <small>
                  {item.phase} · {item.minutes} min
                </small>
              </div>
            </button>
          ))}
        </aside>
        <main className="lesson-document">
          <section className="lesson-overview panel">
            <div>
              <Target />
              <span>
                <b>Today’s goal</b>
                {lesson.goal}
              </span>
            </div>
            <div>
              <BookOpen />
              <span>
                <b>Prerequisites</b>
                {lesson.prerequisites}
              </span>
            </div>
            <div>
              <Clock3 />
              <span>
                <b>Estimated time</b>
                {lesson.minutes} minutes
              </span>
            </div>
          </section>
          <section className="lesson-section panel">
            <span className="eyebrow">IMPORTANT CONCEPTS</span>
            <div className="concept-chips">
              {lesson.concepts.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </section>
          {lesson.tutorial.map((section, i) => (
            <section className="lesson-section panel" key={section.heading}>
              <span className="section-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
              {section.code && (
                <pre className="code-block">
                  <code>{section.code}</code>
                </pre>
              )}
            </section>
          ))}
          <section className="lesson-section panel">
            <span className="eyebrow">COMMON MISTAKES</span>
            <h2>What beginners often get wrong</h2>
            <ul>
              {lesson.mistakes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section className="lesson-section panel">
            <span className="eyebrow">MINI EXERCISES</span>
            <h2>Practise before the quiz</h2>
            <ol>
              {lesson.exercises.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <div className="challenge-callout">
              <Code2 />
              <div>
                <b>Day {lesson.day} challenge</b>
                <p>{lesson.challenge}</p>
              </div>
            </div>
          </section>
          <section className="lesson-section quiz-card panel">
            <span className="eyebrow teal">KNOWLEDGE CHECK</span>
            <h2>{lesson.quiz.question}</h2>
            <div className="challenge-options">
              {lesson.quiz.options.map((option) => (
                <button
                  key={option}
                  disabled={checked}
                  className={`${selected === option ? "selected" : ""} ${checked && option === lesson.quiz.answer ? "correct" : ""}`}
                  onClick={() => setSelected(option)}
                >
                  {option}
                  {checked && option === lesson.quiz.answer && <CheckCircle2 />}
                </button>
              ))}
            </div>
            {checked && (
              <div className={`quiz-feedback ${correct ? "success" : "error"}`}>
                <Lightbulb />
                <p>
                  <b>{correct ? "Correct." : "Not quite."}</b>{" "}
                  {lesson.quiz.explanation}
                </p>
              </div>
            )}
            <div className="learning-actions">
              <button
                onClick={() => {
                  setSelected("");
                  setChecked(false);
                }}
              >
                <RotateCcw /> Reset
              </button>
              <button
                className="primary-button"
                disabled={!selected || checked}
                onClick={submit}
              >
                Check answer <ArrowRight />
              </button>
            </div>
          </section>
          <section className="lesson-section panel">
            <span className="eyebrow">INTERVIEW + REVISION</span>
            <h2>Explain it in your own words</h2>
            <p>
              <b>Interview question:</b> {lesson.interview}
            </p>
            <ul>
              {lesson.revision.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <footer className="lesson-completion panel">
            <div>
              <CheckCircle2 />
              <span>
                <b>
                  {completed
                    ? `Day ${lesson.day} completed`
                    : `Complete Day ${lesson.day}`}
                </b>
                <small>
                  {next ? `Next: ${next.title}` : "Foundation course complete"}
                </small>
              </span>
            </div>
            <button
              className="primary-button"
              disabled={completed}
              onClick={finish}
            >
              {completed ? "Completed" : "Mark complete & continue"}
              <Check />
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
