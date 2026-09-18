import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Code2,
  Lightbulb,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Target,
} from "lucide-react";
import { curriculumLessons, type CurriculumLesson } from "./curriculum";
import { getFoundationTopicDetail } from "./foundationTopicDetails";
import { InteractiveExampleLab } from "./InteractiveExampleLab";
import { getTopicExampleCases } from "./topicExampleCases";
import type { ForgeStore } from "./useForgeStore";

type LessonStep = { id: string; title: string };

const getLessonSteps = (lesson: CurriculumLesson): LessonStep[] => [
  { id: "overview", title: "Your goal and what you need first" },
  { id: "concepts", title: "Important words and ideas" },
  ...lesson.tutorial.map((section, index) => ({
    id: `tutorial-${index}`,
    title: section.heading,
  })),
  { id: "mistakes", title: "Common mistakes" },
  { id: "practice", title: "Practice and challenge" },
  { id: "quiz", title: "Quick quiz" },
  { id: "revision", title: "Interview and review" },
];

export function CurriculumLearning({
  store,
  notify,
  onBack,
  backLabel,
}: {
  store: ForgeStore;
  notify: (text: string) => void;
  onBack: () => void;
  backLabel: string;
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
  const [topicsVisible, setTopicsVisible] = useState(true);
  const topicRailRef = useRef<HTMLElement | null>(null);
  const topicScrollerRef = useRef<HTMLElement | null>(null);
  const lesson = curriculumLessons[index];
  const lessonSteps = getLessonSteps(lesson);
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
  const previous = curriculumLessons[index - 1];
  const { setLearningPosition } = store;
  const exampleCases = useMemo(() => {
    const firstDetail = getFoundationTopicDetail(lesson.id, 0);
    const phaseId = lesson.id === "day-6-javascript" ? "javascript" : lesson.id === "day-1-computers" ? "orientation" : "web";
    const qualityRule =
      phaseId === "javascript"
        ? "Use small functions, make data changes clear, handle bad input, and test what a user can see."
        : phaseId === "web"
          ? "Use meaningful HTML, visible keyboard focus, readable contrast, and layouts that work at every screen size."
          : "Make one small change at a time, inspect the result, and keep a safe way back.";
    return getTopicExampleCases({
      phaseId,
      topic: lesson.title,
      moduleTitle: lesson.phase,
      definition: lesson.goal,
      realWorld: firstDetail?.realWorld ?? lesson.tutorial[0].body,
      example:
        lesson.tutorial[0].code ??
        firstDetail?.diagram ??
        lesson.challenge,
      practice: lesson.exercises[0],
      qualityRule,
    });
  }, [lesson]);

  useEffect(
    () =>
      setLearningPosition({
        page: "learn",
        course: "Full-Stack + AI",
        module: lesson.phase,
        lesson: lesson.title,
        section: "Complete Lesson",
      }),
    [lesson, setLearningPosition],
  );
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
  }, [index, topicsVisible]);
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
        ? "Correct — your quiz answer was saved"
        : "Answer saved — read the explanation and try again",
    );
  };
  const finish = () => {
    store.completeLesson(lesson.id);
    notify(`Day ${lesson.day} completed — progress saved`);
  };
  const goPrevious = () => previous && open(index - 1);
  const goNext = () => next && open(index + 1);

  return (
    <div className="page curriculum-page">
      <div className="lesson-toolbar">
        <button className="back-link" onClick={onBack}>
          <ChevronLeft /> {backLabel}
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
      <div
        className={`curriculum-layout ${topicsVisible ? "" : "topics-hidden"}`}
      >
        {topicsVisible && (
          <aside
            ref={topicRailRef}
            className="day-list panel"
            aria-label="Course topics"
          >
          <span className="eyebrow teal">COURSE TOPICS</span>
          <h2>Foundation course</h2>
          <p className="lesson-step-summary">
            Topic {index + 1} of {curriculumLessons.length} · choose any lesson
          </p>
          <nav
            ref={topicScrollerRef}
            className="course-topic-list"
            aria-label="Foundation topics"
          >
            {curriculumLessons.map((courseLesson, lessonIndex) => {
              const active = lessonIndex === index;
              const finished = store.state.completedLessons.includes(
                courseLesson.id,
              );
              return (
                <button
                  key={courseLesson.id}
                  className={active ? "active" : ""}
                  aria-current={active ? "page" : undefined}
                  onClick={() => open(lessonIndex)}
                >
                  <span>
                    {finished ? (
                      <Check />
                    ) : (
                      String(courseLesson.day).padStart(2, "0")
                    )}
                  </span>
                  <div>
                    <b>{courseLesson.title}</b>
                    <small>
                      {courseLesson.phase} · {courseLesson.minutes} min
                    </small>
                  </div>
                </button>
              );
            })}
          </nav>
          </aside>
        )}
        <main className="lesson-document" id="lesson-task-page">
          <section className="lesson-page-progress full-mode-banner panel">
            <span>COMPLETE LESSON</span>
            <b>{lessonSteps.length} lesson parts · about {lesson.minutes} minutes</b>
            <div className="bar" aria-label="Complete lesson available">
              <i style={{ width: "100%" }} />
            </div>
          </section>
            <section className="focused-lesson-page panel">
              <span className="eyebrow teal">START HERE</span>
              <h2>Your goal and what you need first</h2>
              <p className="lesson-lead">{lesson.goal}</p>
              <div className="lesson-overview page-overview">
                <div>
                  <Target />
                  <span>
                    <b>By the end</b>
                    You can explain the main idea, use it in an example, and
                    check your understanding with practice.
                  </span>
                </div>
                <div>
                  <BookOpen />
                  <span>
                    <b>Before you start</b>
                    {lesson.prerequisites}
                  </span>
                </div>
                <div>
                  <Clock3 />
                  <span>
                    <b>Time needed</b>
                    About {lesson.minutes} minutes for a beginner.
                  </span>
                </div>
              </div>
              <div className="challenge-callout">
                <Lightbulb />
                <div>
                  <b>How to use this lesson</b>
                  <p>
                    Read each part in order. Guess what examples will do before
                    checking the result. Then explain the idea in your own words
                    and complete the exercises before the quiz.
                  </p>
                </div>
              </div>
            </section>
            <InteractiveExampleLab
              lessonId={lesson.id}
              topic={lesson.title}
              cases={exampleCases}
              store={store}
            />
            <section className="focused-lesson-page panel">
              <span className="eyebrow teal">NEW WORDS</span>
              <h2>Important words and ideas</h2>
              <p className="lesson-lead">
                Learn how these words connect. For each one, explain its meaning,
                give an example, and show how it connects to the others.
              </p>
              <div className="concept-learning-grid">
                {lesson.concepts.map((item, conceptIndex) => (
                  <article key={item}>
                    <span>{String(conceptIndex + 1).padStart(2, "0")}</span>
                    <h3>{item}</h3>
                    <p>
                      Find this idea in an example. Then say what goes in, why it
                      is used, what comes out, and one thing that can go wrong.
                    </p>
                  </article>
                ))}
              </div>
              <div className="challenge-callout">
                <Code2 />
                <div>
                  <b>Quick memory check</b>
                  <p>
                    Hide the list and write the words again from memory. Draw
                    arrows between related ideas and label what moves between them.
                  </p>
                </div>
              </div>
            </section>
          {lesson.tutorial.map((tutorialSection, tutorialIndex) => {
            const tutorialDetail = getFoundationTopicDetail(
              lesson.id,
              tutorialIndex,
            );
            return (
            <section
              key={tutorialSection.heading}
              className="focused-lesson-page detailed-subtopic panel"
            >
              <span className="eyebrow teal">
                LESSON PART {tutorialIndex + 1} OF {lesson.tutorial.length}
              </span>
              <h2>{tutorialSection.heading}</h2>
              <p className="lesson-lead">{tutorialSection.body}</p>
              <div className="detail-explanation-grid">
                <article>
                  <span className="eyebrow">WHY IT MATTERS</span>
                  <p>{tutorialDetail?.why ?? lesson.goal}</p>
                </article>
                <article>
                  <span className="eyebrow">EVERYDAY EXAMPLE</span>
                  <p>
                    {tutorialDetail?.analogy ??
                      `Connect ${tutorialSection.heading} to a familiar process with clear inputs, steps, and results.`}
                  </p>
                </article>
              </div>
              <div className="subtopic-teaching-block">
                <span className="eyebrow">HOW IT WORKS · STEP BY STEP</span>
                <h3>Follow the complete process</h3>
                <ol className="numbered-process">
                  {(tutorialDetail?.steps ?? [tutorialSection.body]).map(
                    (step, stepIndex) => (
                      <li key={step}>
                        <span>{stepIndex + 1}</span>
                        <p>{step}</p>
                      </li>
                    ),
                  )}
                </ol>
              </div>
              <div className="subtopic-visual-model">
                <span className="eyebrow">SIMPLE DIAGRAM</span>
                <pre className="code-block">
                  <code>
                    {tutorialDetail?.diagram ??
                      `input → ${tutorialSection.heading} → result`}
                  </code>
                </pre>
              </div>
              {tutorialSection.code && (
                <div className="subtopic-teaching-block">
                  <span className="eyebrow">EXAMPLE WITH AN ANSWER</span>
                  <pre className="code-block">
                    <code>{tutorialSection.code}</code>
                  </pre>
                </div>
              )}
              <div className="real-world-example">
                <Lightbulb />
                <div>
                  <span className="eyebrow">REAL-WORLD EXAMPLE</span>
                  <p>{tutorialDetail?.realWorld ?? lesson.goal}</p>
                </div>
              </div>
              <div className="practice-task">
                <Code2 />
                <div>
                  <span className="eyebrow">PRACTICE NOW</span>
                  <p>{tutorialDetail?.practice ?? lesson.challenge}</p>
                </div>
              </div>
              <div className="subtopic-takeaways">
                <span className="eyebrow">REMEMBER THESE POINTS</span>
                <ul>
                  {(tutorialDetail?.takeaways ?? lesson.revision).map(
                    (takeaway) => (
                      <li key={takeaway}>
                        <CheckCircle2 /> {takeaway}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </section>
            );
          })}
            <section className="focused-lesson-page panel">
              <span className="eyebrow">COMMON MISTAKES</span>
              <h2>What beginners often get wrong</h2>
              <p className="lesson-lead">
                Learn what the mistake looks like and how to correct it. Finding
                it early can save hours of guessing.
              </p>
              <div className="mistake-learning-list">
                {lesson.mistakes.map((item, mistakeIndex) => (
                  <article key={item}>
                    <span>{String(mistakeIndex + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{item}</h3>
                      <p>
                        Return to the main idea. Create the smallest example that
                        shows the problem, guess the result, run it, and compare
                        what actually happened.
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <section className="focused-lesson-page panel">
              <span className="eyebrow">MINI EXERCISES</span>
              <h2>Practice before the quiz</h2>
              <p className="lesson-lead">
                Complete these without copying. First predict the result, then
                perform the task, and finally explain any difference.
              </p>
              <ol className="exercise-cards">
                {lesson.exercises.map((item, exerciseIndex) => (
                  <li key={item}>
                    <span>EXERCISE {exerciseIndex + 1}</span>
                    <p>{item}</p>
                  </li>
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
            <section className="focused-lesson-page quiz-card panel">
              <span className="eyebrow teal">QUICK QUIZ</span>
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
                    {checked && option === lesson.quiz.answer && (
                      <CheckCircle2 />
                    )}
                  </button>
                ))}
              </div>
              {checked && (
                <div
                  className={`quiz-feedback ${correct ? "success" : "error"}`}
                >
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
            <section className="focused-lesson-page panel">
              <span className="eyebrow">INTERVIEW + REVIEW</span>
              <h2>Explain it in your own words</h2>
              <p className="lesson-lead">
                <b>Interview question:</b> {lesson.interview}
              </p>
              <div className="revision-checklist">
                {lesson.revision.map((item) => (
                  <div key={item}>
                    <CheckCircle2 />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="challenge-callout">
                <Lightbulb />
                <div>
                  <b>A clear answer order</b>
                  <p>
                    Start with a simple definition, explain why it matters, walk
                    through one clear example, mention an unusual case, and
                    finish with how you would check the result.
                  </p>
                </div>
              </div>
            </section>
          <footer className="lesson-completion panel">
            <button
              className="lesson-step-button"
              disabled={!previous}
              onClick={goPrevious}
            >
              <ArrowLeft />
              <span>
                <small>Previous lesson</small>
                <b>{previous?.title ?? "Start of course"}</b>
              </span>
            </button>
            <div className="lesson-completion-main">
              <div className="completion-copy">
                <CheckCircle2 />
                <span>
                  <b>
                    {completed
                      ? `Day ${lesson.day} completed`
                      : `Complete Day ${lesson.day}`}
                  </b>
                  <small>Saved to this profile</small>
                </span>
              </div>
              <button
                className="primary-button"
                disabled={completed}
                onClick={finish}
              >
                {completed ? "Completed" : "Mark lesson complete"}
                <Check />
              </button>
            </div>
            <button
              className="lesson-step-button next"
              disabled={!next}
              onClick={goNext}
            >
              <span>
                <small>Next lesson</small>
                <b>{next?.title ?? "Course complete"}</b>
              </span>
              <ArrowRight />
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
