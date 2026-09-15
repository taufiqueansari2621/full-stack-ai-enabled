import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Code2,
  Command,
  Flame,
  FolderKanban,
  Gauge,
  Home,
  Layers3,
  Lightbulb,
  ListChecks,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Moon,
  Network,
  NotebookPen,
  Play,
  Plus,
  Rocket,
  Search,
  Settings,
  Sparkles,
  Sun,
  Target,
  TimerReset,
  Trophy,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import {
  interviewQuestions,
  projectCards,
  reviewItems,
  roadmapNodes,
  type NavId,
} from "./data";
import {
  InterviewTrainer,
  KnowledgePage,
  MentorPage,
  PracticePage,
  ProgressPage,
  ProjectsHub,
  ReviewsWorkspace,
  type ToastMessage,
} from "./FunctionalPages";
import { useForgeStore, type ForgeStore } from "./useForgeStore";
import { useLocalProfiles, type LearnerProfile } from "./useLocalProfiles";
import { CurriculumLearning } from "./CurriculumLearning";
import { curriculumLessons } from "./curriculum";
import {
  curriculumPhases,
  totalCatalogTopics,
  type CurriculumPhase,
} from "./curriculumCatalog";
import { CatalogTopicLesson } from "./CatalogTopicLesson";
import { catalogLessonId } from "./topicIds";
import { CertificatesPage, QuizzesPage } from "./Assessments";

const navItems: { id: NavId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "roadmap", label: "Roadmap", icon: Network },
  { id: "practice", label: "Practice", icon: Code2 },
  { id: "quizzes", label: "Quizzes", icon: CircleHelp },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "interview", label: "Interview", icon: BriefcaseBusiness },
  { id: "knowledge", label: "Knowledge", icon: BrainCircuit },
  { id: "reviews", label: "Reviews", icon: TimerReset },
  { id: "progress", label: "Progress", icon: BarChart3 },
  { id: "certificates", label: "Certificates", icon: Award },
];

function ProgressRing({
  value,
  size = 82,
  stroke = 7,
  color = "#5eead4",
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          className="ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
        />
        <circle
          className="ring-value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (value / 100) * circumference}
        />
      </svg>
      <strong>
        {value}
        <small>%</small>
      </strong>
    </div>
  );
}

function MiniBars({ activityDates }: { activityDates: string[] }) {
  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date;
  });
  return (
    <div className="mini-bars" aria-label="Weekly learning activity">
      {dates.map((date) => {
        const key = date.toISOString().slice(0, 10),
          active = activityDates.includes(key);
        return (
          <div key={key}>
            <span style={{ height: active ? "85%" : "8%" }} />
            <small>
              {date.toLocaleDateString(undefined, { weekday: "narrow" })}
            </small>
          </div>
        );
      })}
    </div>
  );
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function Sidebar({
  active,
  onNavigate,
  open,
  close,
  store,
  profile,
}: {
  active: NavId;
  onNavigate: (id: NavId) => void;
  open: boolean;
  close: () => void;
  store: ForgeStore;
  profile: LearnerProfile;
}) {
  return (
    <>
      {open && (
        <button
          className="sidebar-scrim"
          onClick={close}
          aria-label="Close menu"
        />
      )}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Command size={20} />
          </div>
          <div>
            <b>FORGE</b>
            <span>AI ENGINEERING</span>
          </div>
          <button className="close-mobile" onClick={close}>
            <X size={20} />
          </button>
        </div>
        <div className="path-chip">
          <span>Current path</span>
          <b>
            <span className="path-dot" />
            Full-Stack + AI
          </b>
          <small>{store.state.completedLessons.length} lessons completed</small>
        </div>
        <nav>
          <span className="nav-heading">Workspace</span>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={active === item.id ? "active" : ""}
              onClick={() => {
                onNavigate(item.id);
                close();
              }}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.id === "reviews" && <em>4</em>}
            </button>
          ))}
          <span className="nav-heading">Your coach</span>
          <button
            className={active === "mentor" ? "active mentor-nav" : "mentor-nav"}
            onClick={() => {
              onNavigate("mentor");
              close();
            }}
          >
            <Sparkles size={18} />
            <span>AI Mentor</span>
            <i />
          </button>
        </nav>
        <div className="weekly-goal">
          <div>
            <Target size={17} />
            <b>Weekly goal</b>
            <span>{store.metrics.weeklyPercent}%</span>
          </div>
          <div className="bar">
            <i style={{ width: `${store.metrics.weeklyPercent}%` }} />
          </div>
          <small>
            {Math.floor(store.state.learnedMinutes / 60)}h{" "}
            {store.state.learnedMinutes % 60}m of{" "}
            {Math.floor(store.state.weeklyGoalMinutes / 60)}h{" "}
            {store.state.weeklyGoalMinutes % 60}m
          </small>
        </div>
        <div className="sidebar-user">
          <div className="avatar">{initials(profile.fullName)}</div>
          <div>
            <b>{profile.fullName}</b>
            <span>
              Level {Math.max(1, Math.floor(store.state.xp / 400) + 1)} ·{" "}
              {profile.level}
            </span>
          </div>
          <Settings size={17} />
        </div>
      </aside>
    </>
  );
}

function Topbar({
  title,
  dark,
  setDark,
  openMenu,
  openSearch,
  openSettings,
}: {
  title: string;
  dark: boolean;
  setDark: (v: boolean) => void;
  openMenu: () => void;
  openSearch: () => void;
  openSettings: () => void;
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-button" onClick={openMenu}>
          <Menu size={20} />
        </button>
        <div>
          <span>Full-Stack AI Engineer</span>
          <b>{title}</b>
        </div>
      </div>
      <div className="topbar-actions">
        <button className="search-button" onClick={openSearch}>
          <Search size={17} />
          <span>Search anything...</span>
          <kbd>⌘ K</kbd>
        </button>
        <button onClick={() => setDark(!dark)} aria-label="Toggle theme">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          className="notification"
          onClick={openSettings}
          aria-label="Open notifications and settings"
        >
          <Bell size={18} />
          <i />
        </button>
        <button
          className="avatar small avatar-button"
          onClick={openSettings}
          aria-label="Open learner settings"
        >
          TA
        </button>
      </div>
    </header>
  );
}

function Dashboard({
  navigate,
  store,
  profile,
}: {
  navigate: (id: NavId) => void;
  store: ForgeStore;
  profile: LearnerProfile;
}) {
  const recentDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date;
  });
  const phaseScore = (phaseId: string) => {
    const phase = curriculumPhases.find((item) => item.id === phaseId);
    if (!phase) return 0;
    const ids = phase.modules.flatMap((module) =>
      module.topics.map(
        (topic) =>
          curriculumLessons.find((lesson) => lesson.title === topic)?.id ??
          catalogLessonId(phase.id, module.id, topic),
      ),
    );
    return ids.length
      ? Math.round(
          (ids.filter((id) => store.state.completedLessons.includes(id))
            .length /
            ids.length) *
            100,
        )
      : 0;
  };
  const skillSignals = [
    {
      name: "JavaScript",
      score: phaseScore("javascript"),
      color: "var(--teal)",
    },
    {
      name: "TypeScript",
      score: phaseScore("typescript"),
      color: "var(--blue)",
    },
    { name: "Frontend", score: phaseScore("frontend"), color: "var(--violet)" },
    { name: "Backend", score: phaseScore("backend"), color: "var(--amber)" },
    {
      name: "System design",
      score: phaseScore("system-design"),
      color: "var(--rose)",
    },
    {
      name: "AI engineering",
      score: Math.round(
        (phaseScore("llm") + phaseScore("rag") + phaseScore("agents")) / 3,
      ),
      color: "var(--green)",
    },
  ];
  const strongest = [...skillSignals].sort((a, b) => b.score - a.score)[0],
    focus = skillSignals.find((item) => item.score < 100) ?? skillSignals[0];
  return (
    <div className="page dashboard-page">
      <section className="welcome-row">
        <div>
          <span className="eyebrow">
            {new Date()
              .toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })
              .toUpperCase()}
          </span>
          <h1>
            Welcome back, {profile.fullName.split(" ")[0]} <span>👋</span>
          </h1>
          <p>
            Your progress is saved to this local profile. Let’s make today
            count.
          </p>
        </div>
        <button className="outline-button" onClick={() => navigate("reviews")}>
          <CalendarDays size={17} /> View learning plan
        </button>
      </section>

      <section className="hero-grid">
        <article className="mission-card panel">
          <div className="mission-copy">
            <span className="eyebrow teal">
              <Sparkles size={13} /> CONTINUE YOUR JOURNEY
            </span>
            <h2>{store.state.currentPosition.lesson}</h2>
            <p>
              {store.state.currentPosition.module} · Continue from{" "}
              {store.state.currentPosition.section}
            </p>
            <div className="lesson-meta">
              <span>
                <Clock3 size={15} /> {profile.dailyGoal} daily goal
              </span>
              <span>
                <Code2 size={15} /> Practice included
              </span>
              <span>
                <Zap size={15} /> Progress autosaves
              </span>
            </div>
            <button
              className="primary-button"
              onClick={() => navigate("learn")}
            >
              <Play size={16} fill="currentColor" /> Continue learning{" "}
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="mission-visual">
            <div className="orbital">
              <div className="orbit o1" />
              <div className="orbit o2" />
              <div className="orbital-core">
                <Code2 size={30} />
              </div>
              <span className="orb-dot d1" />
              <span className="orb-dot d2" />
              <span className="orb-dot d3" />
            </div>
            <span>JavaScript mastery</span>
            <ProgressRing value={store.metrics.mastery} size={70} />
          </div>
        </article>
        <article className="streak-card panel">
          <div className="streak-top">
            <div className="flame-wrap">
              <Flame size={27} fill="currentColor" />
            </div>
            <div>
              <span>Current streak</span>
              <h2>
                {store.metrics.streak}{" "}
                {store.metrics.streak === 1 ? "day" : "days"}
              </h2>
            </div>
            <em>{store.metrics.streak ? "Keep going!" : "Start today"}</em>
          </div>
          <div className="week-dots">
            {recentDays.map((date, i) => {
              const key = date.toISOString().slice(0, 10),
                done = store.state.activityDates.includes(key);
              return (
                <div
                  key={key}
                  className={done ? "done" : i === 6 ? "today" : ""}
                >
                  <span>{done ? <Check size={13} /> : ""}</span>
                  <small>
                    {date.toLocaleDateString(undefined, { weekday: "narrow" })}
                  </small>
                </div>
              );
            })}
          </div>
          <div className="streak-message">
            <Sparkles size={15} />
            <span>Study today to keep your streak alive</span>
          </div>
        </article>
      </section>

      <section className="stat-grid">
        <article className="stat-card panel">
          <div className="stat-icon teal-bg">
            <Trophy size={20} />
          </div>
          <div>
            <span>Overall mastery</span>
            <h3>
              {store.metrics.mastery}
              <span>%</span>
            </h3>
            <small className="positive">Based on saved evidence</small>
          </div>
          <ProgressRing value={store.metrics.mastery} size={55} stroke={5} />
        </article>
        <article className="stat-card panel">
          <div className="stat-icon blue-bg">
            <Clock3 size={20} />
          </div>
          <div>
            <span>Learning time</span>
            <h3>
              {Math.floor(store.state.learnedMinutes / 60)}
              <span>h {store.state.learnedMinutes % 60}m</span>
            </h3>
            <small className="positive">Tracked in this browser</small>
          </div>
          <MiniBars activityDates={store.state.activityDates} />
        </article>
        <article className="stat-card panel">
          <div className="stat-icon violet-bg">
            <FolderKanban size={20} />
          </div>
          <div>
            <span>Project milestones</span>
            <h3>
              {store.metrics.completedTasks}
              <span> done</span>
            </h3>
            <small>Across active projects</small>
          </div>
          <div className="project-stack">
            <i />
            <i />
            <i />
          </div>
        </article>
        <article className="stat-card panel">
          <div className="stat-icon amber-bg">
            <BriefcaseBusiness size={20} />
          </div>
          <div>
            <span>Interview score</span>
            <h3>
              {store.metrics.interviewAverage}
              <span>%</span>
            </h3>
            <small>
              {store.state.interviewResults.length
                ? `${store.state.interviewResults.length} saved answers`
                : "Complete your first answer"}
            </small>
          </div>
          <ProgressRing
            value={store.metrics.interviewAverage}
            size={55}
            stroke={5}
            color="#fbbf24"
          />
        </article>
      </section>

      <section className="content-grid">
        <article className="panel journey-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">YOUR JOURNEY</span>
              <h2>52-week engineering path</h2>
            </div>
            <button onClick={() => navigate("roadmap")}>
              Open roadmap <ArrowRight size={15} />
            </button>
          </div>
          <div className="journey-track">
            {roadmapNodes.slice(0, 6).map((node, i) => (
              <div className="journey-node active" key={node.id}>
                <div className="node-marker">{node.icon}</div>
                <span>{node.title}</span>
                {i < 5 && <i />}
              </div>
            ))}
          </div>
          <div className="current-stage">
            <div className="stage-icon">
              <Code2 size={22} />
            </div>
            <div>
              <span>YOU ARE HERE</span>
              <b>{store.state.currentPosition.module}</b>
              <small>
                {store.state.completedLessons.length} lessons completed from
                real activity
              </small>
            </div>
            <div className="stage-progress">
              <strong>{store.metrics.mastery}%</strong>
              <div className="bar">
                <i style={{ width: `${store.metrics.mastery}%` }} />
              </div>
            </div>
          </div>
        </article>

        <article className="panel review-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">SMART REVIEW</span>
              <h2>Due for review</h2>
            </div>
            <span className="count-chip">4 items</span>
          </div>
          {reviewItems.slice(0, 3).map((item, i) => (
            <button
              className="review-row"
              key={item.title}
              onClick={() => navigate("reviews")}
            >
              <div className={`review-icon r${i}`}>
                <TimerReset size={17} />
              </div>
              <div>
                <b>{item.title}</b>
                <span>
                  {item.type} · {item.duration}
                </span>
              </div>
              <em>{item.due}</em>
              <ChevronRight size={16} />
            </button>
          ))}
          <button className="text-button" onClick={() => navigate("reviews")}>
            Start 26 minute review <ArrowRight size={15} />
          </button>
        </article>
      </section>

      <section className="content-grid bottom-grid">
        <article className="panel skill-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">SKILL SIGNAL</span>
              <h2>Strengths & focus areas</h2>
            </div>
            <button onClick={() => navigate("progress")}>
              Full report <ArrowRight size={15} />
            </button>
          </div>
          <div className="skill-list">
            {skillSignals.map((s) => (
              <div key={s.name}>
                <span>{s.name}</span>
                <div className="skill-bar">
                  <i style={{ width: `${s.score}%`, background: s.color }} />
                </div>
                <b>{s.score}%</b>
              </div>
            ))}
          </div>
          <div className="insight">
            <Lightbulb size={18} />
            <div>
              <b>Coach insight</b>
              <span>
                {strongest.score
                  ? `${strongest.name} currently has your strongest completion evidence at ${strongest.score}%. `
                  : "Complete lessons and assessments to create your first skill signal. "}
                Next focus: {focus.name} at {focus.score}%.
              </span>
            </div>
          </div>
        </article>
        <article className="panel next-project">
          <span className="eyebrow">RECOMMENDED PROJECT</span>
          <div className="project-art">
            <div>
              <span>JS</span>
            </div>
            <i className="code-line l1" />
            <i className="code-line l2" />
            <i className="code-line l3" />
          </div>
          <span className="level-pill">INTERMEDIATE · P05</span>
          <h2>Intelligent Search Dashboard</h2>
          <p>
            Turn event-loop knowledge into a fast search experience with
            debounce, cancellation, caching and URL state.
          </p>
          <div className="project-details">
            <span>
              <Clock3 size={15} /> 14 hours
            </span>
            <span>
              <ListChecks size={15} /> 11 milestones
            </span>
          </div>
          <button
            className="secondary-button"
            onClick={() => navigate("projects")}
          >
            View project brief <ArrowRight size={16} />
          </button>
        </article>
      </section>
    </div>
  );
}

function RoadmapPage({
  store,
  openLesson,
}: {
  store: ForgeStore;
  openLesson: (title: string) => void;
}) {
  const [selected, setSelected] = useState<CurriculumPhase | null>(null);
  const [topicPreview, setTopicPreview] = useState<{
    module: string;
    topic: string;
    position: number;
    topics: string[];
  } | null>(null);
  const completed = new Set(store.state.completedLessons);
  const topicId = (phase: CurriculumPhase, moduleId: string, topic: string) =>
    curriculumLessons.find((item) => item.title === topic)?.id ??
    catalogLessonId(phase.id, moduleId, topic);
  const phaseProgress = (phase: CurriculumPhase) => {
    const ids = phase.modules.flatMap((item) =>
      item.topics.map((topic) => topicId(phase, item.id, topic)),
    );
    return ids.length
      ? Math.round(
          (ids.filter((id) => completed.has(id)).length / ids.length) * 100,
        )
      : 0;
  };
  const overallIds = curriculumPhases.flatMap((phase) =>
    phase.modules.flatMap((item) =>
      item.topics.map((topic) => topicId(phase, item.id, topic)),
    ),
  );
  const overall = Math.round(
    (overallIds.filter((id) => completed.has(id)).length / overallIds.length) *
      100,
  );
  if (selected && topicPreview) {
    const selectedModule = selected.modules.find(
      (item) => item.title === topicPreview.module,
    );
    if (selectedModule)
      return (
        <CatalogTopicLesson
          key={`${selected.id}:${selectedModule.id}:${topicPreview.topic}`}
          phase={selected}
          module={selectedModule}
          topic={topicPreview.topic}
          position={topicPreview.position}
          store={store}
          onBack={() => setTopicPreview(null)}
          onSelect={(nextModule, topic, position) => {
            const lesson = curriculumLessons.find(
              (item) => item.title === topic,
            );
            if (lesson) openLesson(topic);
            else
              setTopicPreview({
                module: nextModule.title,
                topic,
                position,
                topics: nextModule.topics,
              });
          }}
        />
      );
  }
  if (selected && topicPreview)
    return (
      <div className="page topic-preview">
        <button className="back-link" onClick={() => setTopicPreview(null)}>
          <ChevronLeft /> {selected.title}
        </button>
        <section className="page-title">
          <div>
            <span className="eyebrow teal">
              {selected.title.toUpperCase()} ·{" "}
              {topicPreview.module.toUpperCase()}
            </span>
            <h1>{topicPreview.topic}</h1>
            <p>This topic is freely accessible in your Full-Stack + AI path.</p>
          </div>
          <span className="status-pill active">Open access</span>
        </section>
        <div className="topic-preview-grid">
          <article className="panel">
            <span className="eyebrow">LEARNING POSITION</span>
            <h2>
              Topic {topicPreview.position + 1} of {topicPreview.topics.length}
            </h2>
            <p>
              Part of <b>{topicPreview.module}</b> in the{" "}
              <b>{selected.title}</b> phase. It follows{" "}
              {topicPreview.position
                ? topicPreview.topics[topicPreview.position - 1]
                : "the phase introduction"}{" "}
              and prepares you for{" "}
              {topicPreview.topics[topicPreview.position + 1] ??
                "the module assessment"}
              .
            </p>
          </article>
          <article className="panel">
            <span className="eyebrow">WHY IT MATTERS</span>
            <h2>Build the concept in context</h2>
            <p>
              {selected.description} This topic belongs in that progression and
              remains available without prerequisite restrictions.
            </p>
          </article>
          <article className="panel topic-outline">
            <span className="eyebrow">MODULE SEQUENCE</span>
            <h2>{topicPreview.module}</h2>
            {topicPreview.topics.map((topic, index) => (
              <button
                key={topic}
                className={topic === topicPreview.topic ? "active" : ""}
                onClick={() => {
                  const lesson = curriculumLessons.find(
                    (item) => item.title === topic,
                  );
                  if (lesson) openLesson(topic);
                  else
                    setTopicPreview({
                      ...topicPreview,
                      topic,
                      position: index,
                    });
                }}
              >
                <span>{index + 1}</span>
                <b>{topic}</b>
                <ArrowRight />
              </button>
            ))}
          </article>
        </div>
      </div>
    );
  if (selected)
    return (
      <div className="page phase-detail">
        <button className="back-link" onClick={() => setSelected(null)}>
          <ChevronLeft /> Complete roadmap
        </button>
        <section className="page-title">
          <div>
            <span className="eyebrow">
              PHASE {String(selected.order).padStart(2, "0")} ·{" "}
              {selected.difficulty.toUpperCase()}
            </span>
            <h1>{selected.title}</h1>
            <p>{selected.description}</p>
          </div>
          <div className="title-stat">
            <ProgressRing value={phaseProgress(selected)} />
            <div>
              <b>{selected.modules.length} modules</b>
              <span>
                {selected.modules.reduce(
                  (sum, item) => sum + item.topics.length,
                  0,
                )}{" "}
                ordered topics
              </span>
              <small>Open access · learn in any order</small>
            </div>
          </div>
        </section>
        <div className="module-grid">
          {selected.modules.map((item, moduleIndex) => (
            <article className="module-card panel" key={item.id}>
              <div className="module-heading">
                <span>{String(moduleIndex + 1).padStart(2, "0")}</span>
                <div>
                  <h2>{item.title}</h2>
                  <small>{item.topics.length} topics</small>
                </div>
              </div>
              <div className="module-topics">
                {item.topics.map((topic, topicIndex) => {
                  const lesson = curriculumLessons.find(
                    (candidate) => candidate.title === topic,
                  );
                  const available = Boolean(lesson);
                  return (
                    <button
                      key={topic}
                      title={
                        !lesson ? "Open topic curriculum overview" : undefined
                      }
                      onClick={() =>
                        available
                          ? openLesson(topic)
                          : setTopicPreview({
                              module: item.title,
                              topic,
                              position: topicIndex,
                              topics: item.topics,
                            })
                      }
                    >
                      <span>{topicIndex + 1}</span>
                      <b>{topic}</b>
                      <ArrowRight />
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  return (
    <div className="page">
      <section className="page-title">
        <div>
          <span className="eyebrow">YOUR PERSONAL CURRICULUM</span>
          <h1>
            From fundamentals to{" "}
            <span className="gradient-text">AI engineer</span>
          </h1>
          <p>
            Every skill connects to practice, projects and the exact way an
            interviewer will test it.
          </p>
        </div>
        <div className="title-stat">
          <ProgressRing value={overall} />
          <div>
            <b>Overall path</b>
            <span>
              {curriculumPhases.length} phases · {totalCatalogTopics} topics
            </span>
            <small>
              {store.state.completedLessons.length} verified lessons completed
            </small>
          </div>
        </div>
      </section>
      <div className="roadmap-layout">
        <div className="roadmap-line" />
        {curriculumPhases.map((node) => {
          const progress = phaseProgress(node),
            status = progress === 100 ? "complete" : "active";
          return (
            <article key={node.id} className={`roadmap-card panel ${status}`}>
              <div className="roadmap-index">
                {status === "complete" ? (
                  <Check size={20} />
                ) : (
                  String(node.order).padStart(2, "0")
                )}
              </div>
              <div className="roadmap-main">
                <div className="roadmap-card-top">
                  <div>
                    <span className="roadmap-phase">
                      PHASE {String(node.order).padStart(2, "0")}
                    </span>
                    <h2>{node.title}</h2>
                  </div>
                  <span className={`status-pill ${status}`}>
                    {status === "complete"
                      ? "Mastered"
                      : progress > 0
                        ? "In progress"
                        : "Open"}
                  </span>
                </div>
                <p>{node.description}</p>
                <div className="topic-chips">
                  {node.modules.slice(0, 5).map((item) => (
                    <span key={item.id}>{item.title}</span>
                  ))}
                </div>
                <div className="roadmap-meta">
                  <span>
                    <Gauge size={15} />
                    {node.difficulty}
                  </span>
                  <span>
                    <Clock3 size={15} />
                    {node.duration}
                  </span>
                  <span>
                    <FolderKanban size={15} />
                    {node.modules.length} modules
                  </span>
                </div>
                <div className="roadmap-progress">
                  <div className="bar">
                    <i style={{ width: `${progress}%` }} />
                  </div>
                  <b>{progress}%</b>
                </div>
              </div>
              <button
                className="round-action"
                onClick={() => setSelected(node)}
                aria-label={`Open ${node.title}`}
              >
                <ArrowRight size={18} />
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function LearnPage() {
  const [level, setLevel] = useState(1);
  const [tab, setTab] = useState<"lesson" | "visual" | "practice">("lesson");
  const [ran, setRan] = useState(false);
  return (
    <div className="lesson-page">
      <aside className="course-panel">
        <button className="back-link">
          <ChevronLeft size={16} /> JavaScript mastery
        </button>
        <div className="course-progress">
          <span>
            Course progress <b>68%</b>
          </span>
          <div className="bar">
            <i style={{ width: "68%" }} />
          </div>
        </div>
        <span className="nav-heading">CHAPTER 04 · ASYNC JAVASCRIPT</span>
        {[
          "Call stack & execution",
          "Browser runtime",
          "The event loop",
          "Promises & microtasks",
          "Async / await",
          "Cancellation patterns",
        ].map((x, i) => (
          <button
            className={`chapter-row ${i < 2 ? "done" : i === 2 ? "active" : ""}`}
            key={x}
          >
            <span>{i < 2 ? <Check size={13} /> : i + 1}</span>
            <div>
              <b>{x}</b>
              <small>
                {i === 2 ? "Current · 20 min" : i < 2 ? "Completed" : "Locked"}
              </small>
            </div>
            {i > 2 && <LockKeyhole size={13} />}
          </button>
        ))}
      </aside>
      <main className="lesson-main">
        <div className="lesson-top">
          <div>
            <span className="eyebrow teal">CHAPTER 04 · LESSON 03</span>
            <h1>How the event loop really works</h1>
            <p>Build a precise mental model for JavaScript concurrency.</p>
          </div>
          <button className="teach-button">
            <Sparkles size={17} /> Teach me this <ChevronDown size={15} />
          </button>
        </div>
        <div className="level-switch">
          {["Beginner", "Technical", "Practical", "Advanced", "Interview"].map(
            (x, i) => (
              <button
                className={level === i + 1 ? "active" : ""}
                onClick={() => setLevel(i + 1)}
                key={x}
              >
                <span>{i + 1}</span>
                {x}
              </button>
            ),
          )}
        </div>
        <div className="lesson-tabs">
          <button
            className={tab === "lesson" ? "active" : ""}
            onClick={() => setTab("lesson")}
          >
            <BookOpen size={16} /> Lesson
          </button>
          <button
            className={tab === "visual" ? "active" : ""}
            onClick={() => setTab("visual")}
          >
            <Activity size={16} /> Visualize
          </button>
          <button
            className={tab === "practice" ? "active" : ""}
            onClick={() => setTab("practice")}
          >
            <Code2 size={16} /> Practice
          </button>
        </div>
        {tab === "lesson" && (
          <article className="lesson-content">
            <span className="content-kicker">THE MENTAL MODEL</span>
            <h2>
              JavaScript runs one piece of code at a time—but the environment
              does more.
            </h2>
            <p>
              The JavaScript engine uses a <strong>call stack</strong> to track
              which function is currently executing. Browser APIs handle timers,
              network requests and events outside that stack.
            </p>
            <div className="analogy-box">
              <div>
                <Lightbulb size={21} />
              </div>
              <div>
                <b>Think of a focused chef in a busy restaurant</b>
                <p>
                  The chef prepares one dish at a time. Assistants handle timers
                  and deliveries, then place ready tasks into an ordered pickup
                  queue. The chef checks that queue only after finishing the
                  current dish.
                </p>
              </div>
            </div>
            <h3>The execution sequence</h3>
            <div className="sequence">
              <div>
                <span>1</span>
                <b>Synchronous code enters the call stack</b>
                <small>Functions execute to completion in stack order.</small>
              </div>
              <i />
              <div>
                <span>2</span>
                <b>Async work moves to the host environment</b>
                <small>
                  Timers and network operations do not block the stack.
                </small>
              </div>
              <i />
              <div>
                <span>3</span>
                <b>Ready callbacks wait in queues</b>
                <small>Microtasks are drained before the next macrotask.</small>
              </div>
            </div>
            <div className="lesson-callout">
              <CircleHelp size={20} />
              <div>
                <b>Why does this matter?</b>
                <span>
                  Without this model, race conditions, frozen interfaces and
                  confusing log order feel random. With it, you can predict
                  them.
                </span>
              </div>
            </div>
          </article>
        )}
        {tab === "visual" && (
          <article className="lesson-content">
            <div className="visual-head">
              <div>
                <span className="content-kicker">INTERACTIVE EXECUTION</span>
                <h2>Watch code move through the runtime</h2>
              </div>
              <button
                className="primary-button compact"
                onClick={() => setRan(!ran)}
              >
                <Play size={14} />
                {ran ? "Reset" : "Run code"}
              </button>
            </div>
            <div className="runtime">
              <div className="runtime-code">
                <pre>
                  <code>
                    <span>console</span>.log(<em>'A'</em>){"\n"}
                    {"\n"}setTimeout(() =&gt; {"{"}
                    {"\n"} <span>console</span>.log(<em>'B'</em>){"\n"}
                    {"}"}, 0){"\n"}
                    {"\n"}Promise.resolve(){"\n"} .then(() =&gt;{" "}
                    <span>console</span>.log(<em>'C'</em>)){"\n"}
                    {"\n"}
                    <span>console</span>.log(<em>'D'</em>)
                  </code>
                </pre>
              </div>
              <div className={`runtime-flow ${ran ? "running" : ""}`}>
                <div>
                  <b>Call stack</b>
                  <span>{ran ? "console.log('D')" : "global()"}</span>
                </div>
                <div>
                  <b>Microtask queue</b>
                  <span>{ran ? "log('C')" : "empty"}</span>
                </div>
                <div>
                  <b>Task queue</b>
                  <span>{ran ? "log('B')" : "empty"}</span>
                </div>
                <div className="output">
                  <b>Output</b>
                  <span>{ran ? "A  D  C  B" : "—"}</span>
                </div>
              </div>
            </div>
          </article>
        )}
        {tab === "practice" && (
          <article className="lesson-content practice-view">
            <span className="content-kicker">
              PREDICTION CHALLENGE · 1 OF 2
            </span>
            <h2>What is the exact output order?</h2>
            <p>Explain why before revealing the answer.</p>
            <div className="answer-options">
              {[
                "A → B → C → D",
                "A → D → B → C",
                "A → D → C → B",
                "D → A → C → B",
              ].map((x) => (
                <button key={x}>{x}</button>
              ))}
            </div>
            <button className="hint-button">
              <Lightbulb size={16} /> Give me a small hint
            </button>
          </article>
        )}
        <div className="lesson-footer">
          <button>
            <ChevronLeft size={16} /> Previous lesson
          </button>
          <span>Lesson 3 of 6</span>
          <button className="primary-button compact">
            Mark complete <Check size={15} />
          </button>
        </div>
      </main>
      <aside className="tutor-panel">
        <div className="tutor-title">
          <div>
            <Sparkles size={18} />
          </div>
          <div>
            <b>AI learning coach</b>
            <span>
              <i /> Context aware
            </span>
          </div>
        </div>
        <div className="coach-note">
          <span>YOU'RE LEARNING</span>
          <b>The event loop · Level {level}</b>
        </div>
        <div className="chat-preview">
          <div className="ai-avatar">
            <Bot size={18} />
          </div>
          <p>
            I can explain this at your current level, quiz you, or help you
            reason through a confusing output—without giving away the answer.
          </p>
        </div>
        {[
          "Explain this simply",
          "Show me another analogy",
          "Quiz me on this",
          "Where is this used?",
          "Ask an interview question",
        ].map((x) => (
          <button className="prompt-chip" key={x}>
            {x}
            <ArrowRight size={14} />
          </button>
        ))}
        <div className="ask-box">
          <textarea placeholder="Ask about this lesson..." />
          <button>
            <ArrowRight size={16} />
          </button>
        </div>
      </aside>
    </div>
  );
}

export function ProjectsPage() {
  const [filter, setFilter] = useState("All projects");
  return (
    <div className="page">
      <section className="page-title">
        <div>
          <span className="eyebrow">BUILD TO UNDERSTAND</span>
          <h1>
            Project <span className="gradient-text">workshop</span>
          </h1>
          <p>
            Real engineering briefs. Progressive milestones. No copy-paste
            solutions.
          </p>
        </div>
        <button className="primary-button">
          <Plus size={17} /> Start new project
        </button>
      </section>
      <div className="filter-row">
        {[
          "All projects",
          "In progress",
          "Frontend",
          "Backend",
          "AI enabled",
        ].map((x) => (
          <button
            key={x}
            className={filter === x ? "active" : ""}
            onClick={() => setFilter(x)}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="projects-grid">
        {projectCards.map((p, i) => (
          <article className={`project-card panel ${p.accent}`} key={p.id}>
            <div className="project-card-head">
              <span className="project-code">{p.code}</span>
              <span className="status-pill active">
                {p.progress ? "In progress" : "Up next"}
              </span>
            </div>
            <div className="project-symbol">
              {i === 0 ? (
                <Search />
              ) : i === 1 ? (
                <BarChart3 />
              ) : i === 2 ? (
                <Layers3 />
              ) : (
                <Bot />
              )}
            </div>
            <span className="eyebrow">
              {p.type} · {p.level}
            </span>
            <h2>{p.title}</h2>
            <p>{p.description}</p>
            <div className="project-progress">
              <span>
                <b>{p.progress}%</b> complete
              </span>
              <div className="bar">
                <i style={{ width: `${p.progress}%` }} />
              </div>
            </div>
            <div className="project-footer">
              <span>
                <ListChecks size={15} />
                {p.tasks} tasks
              </span>
              <span>
                <Clock3 size={15} />
                {p.hours}
              </span>
              <button>
                <ArrowRight size={17} />
              </button>
            </div>
          </article>
        ))}
      </div>
      <section className="capstone-banner">
        <div className="capstone-icon">
          <Rocket size={30} />
        </div>
        <div>
          <span className="eyebrow teal">FINAL CAPSTONE · P34</span>
          <h2>Industrial AI Operations Platform</h2>
          <p>
            Unify realtime telemetry, anomaly detection, permission-aware RAG,
            safe agent tools and production observability.
          </p>
          <div className="topic-chips">
            <span>Full-stack</span>
            <span>Machine learning</span>
            <span>RAG</span>
            <span>Agents</span>
            <span>System design</span>
          </div>
        </div>
        <button className="secondary-button">
          Preview brief <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
}

export function InterviewPage() {
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  if (started)
    return (
      <div className="page interview-session">
        <button className="back-link" onClick={() => setStarted(false)}>
          <ChevronLeft size={16} /> End practice
        </button>
        <div className="interview-top">
          <span>TECHNICAL INTERVIEW · QUESTION {question + 1} OF 4</span>
          <div className="timer">
            <span />
            <Clock3 size={17} /> 04:32
          </div>
        </div>
        <article className="interview-question panel">
          <div className="interviewer">
            <div>
              <Bot size={22} />
            </div>
            <span>AI Interviewer</span>
          </div>
          <h1>{interviewQuestions[question]}</h1>
          <p>
            Think aloud. I’m evaluating your correctness, structure, depth and
            trade-off awareness.
          </p>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Structure your answer here, or speak it aloud..."
          />
          <div className="interview-actions">
            <button className="hint-button">
              <Lightbulb size={16} /> Clarify question
            </button>
            <button
              className="primary-button"
              onClick={() => {
                setQuestion((question + 1) % 4);
                setAnswer("");
              }}
            >
              Submit answer <ArrowRight size={16} />
            </button>
          </div>
        </article>
        <div className="evaluation-preview">
          <div>
            <CheckCircle2 size={18} />
            <span>Direct definition</span>
          </div>
          <div>
            <Activity size={18} />
            <span>Mental model</span>
          </div>
          <div>
            <Code2 size={18} />
            <span>Practical example</span>
          </div>
          <div>
            <Gauge size={18} />
            <span>Trade-offs</span>
          </div>
        </div>
      </div>
    );
  return (
    <div className="page">
      <section className="page-title">
        <div>
          <span className="eyebrow">PRACTICE UNDER PRESSURE</span>
          <h1>
            Interview <span className="gradient-text">training room</span>
          </h1>
          <p>
            Realistic sessions that adapt to your projects, gaps and target
            role.
          </p>
        </div>
        <div className="readiness-card">
          <ProgressRing value={62} size={74} color="#fbbf24" />
          <div>
            <span>Interview readiness</span>
            <b>Getting competitive</b>
            <small>+7% this month</small>
          </div>
        </div>
      </section>
      <div className="interview-grid">
        <article className="mock-card featured">
          <div className="mock-icon">
            <MessageSquareText size={27} />
          </div>
          <span className="eyebrow">RECOMMENDED FOR YOU</span>
          <h2>JavaScript technical screen</h2>
          <p>20 minutes · 4 adaptive questions · Detailed feedback</p>
          <div className="mock-tags">
            <span>Event loop</span>
            <span>Closures</span>
            <span>Async</span>
          </div>
          <button className="primary-button" onClick={() => setStarted(true)}>
            <Play size={16} /> Start interview
          </button>
        </article>
        {[
          {
            icon: Code2,
            title: "Coding interview",
            meta: "45 min · Medium",
            score: "68%",
          },
          {
            icon: Network,
            title: "System design",
            meta: "45 min · Beginner",
            score: "51%",
          },
          {
            icon: FolderKanban,
            title: "Project deep-dive",
            meta: "30 min · P05",
            score: "74%",
          },
          {
            icon: UserRound,
            title: "Behavioral interview",
            meta: "30 min · Mixed",
            score: "66%",
          },
        ].map((m) => (
          <article className="mock-card panel" key={m.title}>
            <div className="mock-icon small">
              <m.icon size={21} />
            </div>
            <h2>{m.title}</h2>
            <p>{m.meta}</p>
            <div className="mock-score">
              <span>Last score</span>
              <b>{m.score}</b>
            </div>
            <button
              className="secondary-button"
              onClick={() => setStarted(true)}
            >
              Practice <ArrowRight size={15} />
            </button>
          </article>
        ))}
      </div>
      <section className="panel readiness-breakdown">
        <div className="section-head">
          <div>
            <span className="eyebrow">READINESS BREAKDOWN</span>
            <h2>What to improve next</h2>
          </div>
          <button>
            View full analysis <ArrowRight size={15} />
          </button>
        </div>
        <div className="readiness-list">
          {[
            { n: "Technical depth", v: 72, c: "#5eead4" },
            { n: "Problem solving", v: 68, c: "#60a5fa" },
            { n: "Communication", v: 76, c: "#a78bfa" },
            { n: "System design", v: 51, c: "#fbbf24" },
            { n: "Trade-off awareness", v: 57, c: "#fb7185" },
          ].map((x) => (
            <div key={x.n}>
              <span>{x.n}</span>
              <div className="skill-bar">
                <i style={{ width: `${x.v}%`, background: x.c }} />
              </div>
              <b>{x.v}%</b>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ReviewsPage({
  store,
  notify,
}: {
  store: ForgeStore;
  notify: (text: string) => void;
}) {
  const done = store.state.completedReviews;
  const setDone = (next: string[]) => {
    const added = next.find((id) => !done.includes(id));
    const removed = done.find((id) => !next.includes(id));
    if (added) {
      store.completeReview(added);
      notify("Review completed — +25 XP saved locally");
    }
    if (removed) {
      store.undoReview(removed);
      notify("Review returned to your queue");
    }
  };
  return (
    <div className="page">
      <section className="page-title">
        <div>
          <span className="eyebrow">SPACED REPETITION</span>
          <h1>
            Make knowledge <span className="gradient-text">stick</span>
          </h1>
          <p>
            A short, adaptive review queue built from what you’re most likely to
            forget.
          </p>
        </div>
        <div className="review-summary">
          <div>
            <b>26</b>
            <span>minutes</span>
          </div>
          <div>
            <b>4</b>
            <span>items due</span>
          </div>
          <div>
            <b>81%</b>
            <span>retention</span>
          </div>
        </div>
      </section>
      <div className="review-queue panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">TODAY'S REVIEW</span>
            <h2>Four targeted repetitions</h2>
          </div>
          <span className="count-chip">{done.length}/4 complete</span>
        </div>
        {reviewItems.map((r, i) => (
          <div
            className={`queue-row ${done.includes(r.title) ? "complete" : ""}`}
            key={r.title}
          >
            <button
              className="check-button"
              onClick={() =>
                setDone(
                  done.includes(r.title)
                    ? done.filter((x) => x !== r.title)
                    : [...done, r.title],
                )
              }
            >
              {done.includes(r.title) ? <Check size={17} /> : i + 1}
            </button>
            <div className={`review-icon r${i}`}>
              <TimerReset size={18} />
            </div>
            <div className="queue-main">
              <b>{r.title}</b>
              <span>
                {r.type} · {r.duration}
              </span>
            </div>
            <div className="memory-strength">
              <span>Memory strength</span>
              <div className="bar">
                <i style={{ width: `${r.strength}%` }} />
              </div>
              <b>{r.strength}%</b>
            </div>
            <button className="round-action">
              <ArrowRight size={17} />
            </button>
          </div>
        ))}
      </div>
      <div className="retention-tip">
        <BrainCircuit size={25} />
        <div>
          <b>Why these four?</b>
          <p>
            Closures and two pointers have decayed since your last successful
            recall. The event loop is relevant to today’s lesson, while indexing
            supports your next project milestone.
          </p>
        </div>
      </div>
    </div>
  );
}

export function PlaceholderPage({
  id,
  navigate,
}: {
  id: NavId;
  navigate: (id: NavId) => void;
}) {
  const content: Record<
    string,
    {
      icon: typeof Home;
      title: string;
      kicker: string;
      text: string;
      action: string;
    }
  > = {
    practice: {
      icon: Code2,
      title: "Deliberate practice",
      kicker: "TRAIN THE SKILL",
      text: "Prediction, debugging, coding and explanation challenges matched to your current learning path.",
      action: "Start a mixed practice set",
    },
    knowledge: {
      icon: NotebookPen,
      title: "Your second brain",
      kicker: "PERSONAL KNOWLEDGE BASE",
      text: "Notes, flashcards, code snippets, architecture decisions and mistakes—all connected to the concepts you learned.",
      action: "Create your first note",
    },
    progress: {
      icon: BarChart3,
      title: "Mastery, not completion",
      kicker: "LEARNING ANALYTICS",
      text: "Understand your real readiness across recall, implementation, projects, explanations and interviews.",
      action: "Generate weekly report",
    },
    mentor: {
      icon: Sparkles,
      title: "A mentor that makes you think",
      kicker: "AI LEARNING COACH",
      text: "Get progressive hints, explanations and senior-level feedback while keeping ownership of the solution.",
      action: "Start a coaching session",
    },
  };
  const c = content[id] || content.practice;
  return (
    <div className="page placeholder">
      <div className="placeholder-glow" />
      <div className="placeholder-icon">
        <c.icon size={38} />
      </div>
      <span className="eyebrow teal">{c.kicker}</span>
      <h1>{c.title}</h1>
      <p>{c.text}</p>
      <div className="placeholder-actions">
        <button className="primary-button">
          {c.action}
          <ArrowRight size={16} />
        </button>
        <button className="secondary-button" onClick={() => navigate("home")}>
          Back to dashboard
        </button>
      </div>
      <div className="coming-grid">
        <div>
          <CheckCircle2 />
          <b>Connected learning context</b>
          <span>
            Recommendations use lessons, reviews and project evidence.
          </span>
        </div>
        <div>
          <BrainCircuit />
          <b>Adaptive difficulty</b>
          <span>
            Challenges become harder when recall and implementation improve.
          </span>
        </div>
        <div>
          <Award />
          <b>Evidence-based mastery</b>
          <span>
            Progress reflects what you can explain and build independently.
          </span>
        </div>
      </div>
    </div>
  );
}

function SearchOverlay({
  close,
  navigate,
}: {
  close: () => void;
  navigate: (id: NavId) => void;
}) {
  const [query, setQuery] = useState("");
  const results = [
    {
      title: "JavaScript event loop lesson",
      meta: "Learn · 20 min",
      page: "learn" as NavId,
    },
    {
      title: "Mixed practice challenges",
      meta: "Practice · 4 challenges",
      page: "practice" as NavId,
    },
    {
      title: "Foundation path assessment",
      meta: "Quiz · 10 questions",
      page: "quizzes" as NavId,
    },
    {
      title: "Intelligent Search Dashboard",
      meta: "Project P05",
      page: "projects" as NavId,
    },
    {
      title: "Spaced repetition queue",
      meta: "Reviews · due today",
      page: "reviews" as NavId,
    },
    {
      title: "Technical interview simulator",
      meta: "Interview · adaptive",
      page: "interview" as NavId,
    },
    {
      title: "Notes and mistake journal",
      meta: "Knowledge base",
      page: "knowledge" as NavId,
    },
    {
      title: "Certificates of Completion",
      meta: "Evidence-based credentials",
      page: "certificates" as NavId,
    },
  ].filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.meta.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="modal-backdrop search-backdrop" onMouseDown={close}>
      <div
        className="search-modal panel"
        role="dialog"
        aria-modal="true"
        aria-label="Search Forge"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="global-search">
          <Search />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons, projects, practice..."
          />
          <button onClick={close}>
            <X />
          </button>
        </div>
        <span className="eyebrow">
          {query ? `${results.length} RESULTS` : "QUICK NAVIGATION"}
        </span>
        <div className="search-results">
          {results.map((item) => (
            <button
              key={item.title}
              onClick={() => {
                navigate(item.page);
                close();
              }}
            >
              <div>
                <b>{item.title}</b>
                <span>{item.meta}</span>
              </div>
              <ArrowRight />
            </button>
          ))}
          {!results.length && (
            <div className="no-results">
              <Search />
              <b>Nothing found</b>
              <span>Try “JavaScript”, “project”, or “interview”.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsOverlay({
  close,
  store,
  dark,
  setDark,
  notify,
  profile,
  logout,
  startOver,
}: {
  close: () => void;
  store: ForgeStore;
  dark: boolean;
  setDark: (value: boolean) => void;
  notify: (text: string) => void;
  profile: LearnerProfile;
  logout: () => void;
  startOver: () => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <div
        className="modal settings-modal panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={close}>
          <X />
        </button>
        <span className="eyebrow teal">LOCAL LEARNING PROFILE</span>
        <h2 id="settings-title">Your Forge workspace</h2>
        <div className="settings-profile">
          <div className="avatar">{initials(profile.fullName)}</div>
          <div>
            <b>{profile.fullName}</b>
            <span>
              @{profile.username} · {store.state.xp.toLocaleString()} XP
            </span>
          </div>
        </div>
        <div className="setting-row">
          <div>
            <b>Appearance</b>
            <span>Switch between dark and light workspace themes.</span>
          </div>
          <button className="secondary-button" onClick={() => setDark(!dark)}>
            {dark ? <Sun /> : <Moon />}
            {dark ? "Use light" : "Use dark"}
          </button>
        </div>
        <div className="setting-row">
          <div>
            <b>Local learning data</b>
            <span>
              All activity belongs to profile {profile.id} and stays only in
              this browser.
            </span>
          </div>
          <span className="local-status">
            <CheckCircle2 /> Saved
          </span>
        </div>
        <div className="setting-row">
          <div>
            <b>Switch learner</b>
            <span>Sign out without deleting this profile or any progress.</span>
          </div>
          <button className="secondary-button" onClick={logout}>
            Log out
          </button>
        </div>
        <div className="setting-row danger">
          <div>
            <b>Reset learning progress</b>
            <span>Clear this learner's activity. This cannot be undone.</span>
          </div>
          {confirmReset ? (
            <div className="confirm-actions">
              <button onClick={() => setConfirmReset(false)}>Cancel</button>
              <button
                onClick={() => {
                  startOver();
                  notify("All progress reset — starting again from Day 1");
                  close();
                }}
              >
                Confirm reset
              </button>
            </div>
          ) : (
            <button
              className="secondary-button"
              onClick={() => setConfirmReset(true)}
            >
              Reset all & start over
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Welcome({
  profiles,
  createProfile,
  login,
}: {
  profiles: LearnerProfile[];
  createProfile: (profile: Omit<LearnerProfile, "id" | "createdAt">) => void;
  login: (id: string) => void;
}) {
  const [mode, setMode] = useState<"welcome" | "create" | "login">("welcome");
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    level: "Complete Beginner" as LearnerProfile["level"],
    goal: "Become Full-Stack AI Developer" as LearnerProfile["goal"],
    dailyGoal: "1 Hour" as LearnerProfile["dailyGoal"],
    speed: "Normal" as LearnerProfile["speed"],
  });
  if (mode === "welcome")
    return (
      <main className="profile-gate">
        <div className="profile-hero">
          <div className="brand-mark">
            <Command />
          </div>
          <span className="eyebrow teal">FORGE · LOCAL-FIRST LEARNING</span>
          <h1>Learn Full-Stack Development + AI from zero to advanced.</h1>
          <p>
            A real, connected learning journey with lessons, practice, projects,
            review and interview preparation. Your progress stays private in
            this browser.
          </p>
          <div className="profile-actions">
            <button
              className="primary-button"
              onClick={() => setMode("create")}
            >
              Start learning <ArrowRight />
            </button>
            <button
              className="secondary-button"
              onClick={() => setMode("login")}
              disabled={!profiles.length}
            >
              Login
            </button>
          </div>
          <button className="text-button" onClick={() => setMode("create")}>
            Explore the 52-week roadmap
          </button>
          <small>
            This is a local learning profile, not secure cloud authentication.
          </small>
        </div>
      </main>
    );
  if (mode === "login")
    return (
      <main className="profile-gate">
        <section className="profile-card panel">
          <button className="back-link" onClick={() => setMode("welcome")}>
            <ChevronLeft /> Back
          </button>
          <span className="eyebrow teal">WELCOME BACK</span>
          <h1>Choose your local profile</h1>
          <p>Each learner’s progress is stored separately on this device.</p>
          <div className="profile-list">
            {profiles.map((profile) => (
              <button key={profile.id} onClick={() => login(profile.id)}>
                <span className="avatar">{initials(profile.fullName)}</span>
                <span>
                  <b>{profile.fullName}</b>
                  <small>
                    @{profile.username} · {profile.goal}
                  </small>
                </span>
                <ArrowRight />
              </button>
            ))}
          </div>
          <button
            className="secondary-button"
            onClick={() => setMode("create")}
          >
            <Plus /> Create another profile
          </button>
        </section>
      </main>
    );
  return (
    <main className="profile-gate">
      <form
        className="profile-card panel"
        onSubmit={(event) => {
          event.preventDefault();
          createProfile({
            ...form,
            fullName: form.fullName.trim(),
            username: form.username.trim(),
          });
        }}
      >
        <button
          type="button"
          className="back-link"
          onClick={() => setMode("welcome")}
        >
          <ChevronLeft /> Back
        </button>
        <span className="eyebrow teal">LOCAL LEARNING PROFILE</span>
        <h1>Build your learning path</h1>
        <p>
          No password is required. This profile and its progress live only in
          this browser.
        </p>
        <div className="profile-form">
          <label>
            Full name
            <input
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Your name"
            />
          </label>
          <label>
            Username
            <input
              required
              pattern="[A-Za-z0-9_]{3,24}"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="e.g. taufique"
            />
          </label>
          <label>
            Current level
            <select
              value={form.level}
              onChange={(e) =>
                setForm({
                  ...form,
                  level: e.target.value as LearnerProfile["level"],
                })
              }
            >
              {[
                "Complete Beginner",
                "Beginner",
                "Intermediate",
                "Experienced Developer",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Main goal
            <select
              value={form.goal}
              onChange={(e) =>
                setForm({
                  ...form,
                  goal: e.target.value as LearnerProfile["goal"],
                })
              }
            >
              {[
                "Learn From Zero",
                "Become Full-Stack Developer",
                "Become Full-Stack AI Developer",
                "Become AI Engineer",
                "Build AI Products",
                "Prepare for Development Interviews",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Daily study goal
            <select
              value={form.dailyGoal}
              onChange={(e) =>
                setForm({
                  ...form,
                  dailyGoal: e.target.value as LearnerProfile["dailyGoal"],
                })
              }
            >
              {["30 Minutes", "1 Hour", "2 Hours", "3+ Hours"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Learning speed
            <select
              value={form.speed}
              onChange={(e) =>
                setForm({
                  ...form,
                  speed: e.target.value as LearnerProfile["speed"],
                })
              }
            >
              {["Relaxed", "Normal", "Intensive"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        </div>
        <button className="primary-button" type="submit">
          Create profile & start <ArrowRight />
        </button>
      </form>
    </main>
  );
}

function LearningWorkspace({
  profile,
  logout,
}: {
  profile: LearnerProfile;
  logout: () => void;
}) {
  const routeIds: NavId[] = [
    "home",
    "learn",
    "roadmap",
    "practice",
    "quizzes",
    "projects",
    "interview",
    "knowledge",
    "reviews",
    "progress",
    "certificates",
    "mentor",
  ];
  const routeFromPath =
    window.location.pathname.split("/").filter(Boolean)[0] || "home";
  const [active, setActive] = useState<NavId>(
    routeIds.includes(routeFromPath as NavId)
      ? (routeFromPath as NavId)
      : "home",
  );
  const [dark, setDark] = useState(
    () => localStorage.getItem("forge-theme") !== "light",
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const store = useForgeStore(profile.id);
  const notify = (text: string) => {
    const id = Date.now();
    setToasts((items) => [...items, { id, text }]);
    window.setTimeout(
      () => setToasts((items) => items.filter((item) => item.id !== id)),
      2800,
    );
  };
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("forge-theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setSettingsOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const path = active === "home" ? "/" : `/${active}`;
    if (window.location.pathname !== path)
      window.history.replaceState({ page: active }, "", path);
  }, [active]);
  const title = useMemo(
    () => navItems.find((x) => x.id === active)?.label || "AI Mentor",
    [active],
  );
  let view;
  if (active === "home")
    view = <Dashboard navigate={setActive} store={store} profile={profile} />;
  else if (active === "roadmap")
    view = (
      <RoadmapPage
        store={store}
        openLesson={(title) => {
          store.setLearningPosition({
            page: "learn",
            lesson: title,
            section: "Lesson introduction",
          });
          setActive("learn");
        }}
      />
    );
  else if (active === "learn")
    view = (
      <CurriculumLearning
        key={store.state.currentPosition.lesson}
        store={store}
        notify={notify}
        navigate={setActive}
      />
    );
  else if (active === "projects")
    view = <ProjectsHub store={store} notify={notify} />;
  else if (active === "interview")
    view = <InterviewTrainer store={store} notify={notify} />;
  else if (active === "reviews")
    view = (
      <ReviewsWorkspace store={store} notify={notify} navigate={setActive} />
    );
  else if (active === "practice")
    view = <PracticePage store={store} notify={notify} />;
  else if (active === "quizzes")
    view = <QuizzesPage store={store} notify={notify} />;
  else if (active === "knowledge")
    view = <KnowledgePage store={store} notify={notify} />;
  else if (active === "progress")
    view = <ProgressPage store={store} navigate={setActive} />;
  else if (active === "certificates")
    view = <CertificatesPage store={store} profile={profile} notify={notify} />;
  else view = <MentorPage store={store} navigate={setActive} />;
  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        onNavigate={setActive}
        open={mobileOpen}
        close={() => setMobileOpen(false)}
        store={store}
        profile={profile}
      />
      <div className="main-shell">
        <Topbar
          title={title}
          dark={dark}
          setDark={setDark}
          openMenu={() => setMobileOpen(true)}
          openSearch={() => setSearchOpen(true)}
          openSettings={() => setSettingsOpen(true)}
        />
        {view}
        <button className="floating-mentor" onClick={() => setActive("mentor")}>
          <Sparkles size={19} />
          <span>Ask your mentor</span>
        </button>
      </div>
      {searchOpen && (
        <SearchOverlay
          close={() => setSearchOpen(false)}
          navigate={setActive}
        />
      )}{" "}
      {settingsOpen && (
        <SettingsOverlay
          close={() => setSettingsOpen(false)}
          store={store}
          dark={dark}
          setDark={setDark}
          notify={notify}
          profile={profile}
          logout={logout}
          startOver={() => {
            store.resetProgress();
            setActive("learn");
          }}
        />
      )}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div className="toast" key={toast.id}>
            <CheckCircle2 />
            {toast.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const profiles = useLocalProfiles();
  if (!profiles.activeProfile)
    return (
      <Welcome
        profiles={profiles.profiles}
        createProfile={profiles.createProfile}
        login={profiles.login}
      />
    );
  return (
    <LearningWorkspace
      key={profiles.activeProfile.id}
      profile={profiles.activeProfile}
      logout={profiles.logout}
    />
  );
}
