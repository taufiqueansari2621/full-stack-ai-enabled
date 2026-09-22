import { lazy, Suspense, useEffect, useMemo, useState } from "react";
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
  LibraryBig,
  Lightbulb,
  ListChecks,
  LockKeyhole,
  Menu,
  Maximize2,
  MessageSquareText,
  Moon,
  Network,
  Minimize2,
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
import { useCloudAccount, type CloudAccount } from "./useCloudAccount";
import { useCloudProgress } from "./useCloudProgress";
import { CurriculumLearning } from "./CurriculumLearning";
import { curriculumLessons } from "./curriculum";
import {
  curriculumPhases,
  getPhaseModules,
  totalCatalogTopics,
  type CurriculumPhase,
} from "./curriculumCatalog";
import { catalogLessonId } from "./topicIds";
import { CertificatesPage, QuizzesPage } from "./Assessments";

const ResourcesPage = lazy(() => import("./ResourcesPage"));
const CatalogTopicLesson = lazy(() =>
  import("./CatalogTopicLesson").then((module) => ({
    default: module.CatalogTopicLesson,
  })),
);

const navItems: { id: NavId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "learn", label: "Lessons", icon: BookOpen },
  { id: "roadmap", label: "Learning Path", icon: Network },
  { id: "resources", label: "Resources", icon: LibraryBig },
  { id: "practice", label: "Practice", icon: Code2 },
  { id: "quizzes", label: "Quizzes", icon: CircleHelp },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "interview", label: "Interview Prep", icon: BriefcaseBusiness },
  { id: "knowledge", label: "My Notes", icon: BrainCircuit },
  { id: "reviews", label: "Review", icon: TimerReset },
  { id: "progress", label: "My Progress", icon: BarChart3 },
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
          <button
            className="close-mobile"
            onClick={close}
            aria-label="Close navigation menu"
          >
            <X size={20} aria-hidden="true" />
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
          <span className="nav-heading">Help</span>
          <button
            className={active === "mentor" ? "active mentor-nav" : "mentor-nav"}
            onClick={() => {
              onNavigate("mentor");
              close();
            }}
          >
            <Sparkles size={18} />
            <span>AI Help</span>
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
        <button
          className="menu-button"
          onClick={openMenu}
          aria-label="Open navigation menu"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <div>
          <span>Your Full-Stack + AI course</span>
          <b>{title}</b>
        </div>
      </div>
      <div className="topbar-actions">
        <button className="search-button" onClick={openSearch}>
          <Search size={17} />
          <span>Search the course...</span>
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
    const ids = getPhaseModules(
      phase,
      store.state.frontendFrameworkPath,
    ).flatMap((module) =>
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
          <p>Your work is saved in this browser. Choose one clear next step.</p>
        </div>
        <button className="outline-button" onClick={() => navigate("reviews")}>
          <CalendarDays size={17} /> See today’s review
        </button>
      </section>

      <section className="hero-grid">
        <article className="mission-card panel">
          <div className="mission-copy">
            <span className="eyebrow teal">
              <Sparkles size={13} /> CONTINUE LEARNING
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
                <Code2 size={15} /> Includes practice
              </span>
              <span>
                <Zap size={15} /> Saved automatically
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
            <span>JavaScript progress</span>
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
            <span>Overall skill progress</span>
            <h3>
              {store.metrics.mastery}
              <span>%</span>
            </h3>
            <small className="positive">Based on your saved work</small>
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
            <span>Project steps</span>
            <h3>
              {store.metrics.completedTasks}
              <span> done</span>
            </h3>
            <small>Completed in your projects</small>
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
              <span className="eyebrow">YOUR LEARNING PATH</span>
              <h2>52-week learning plan</h2>
            </div>
            <button onClick={() => navigate("roadmap")}>
              Open learning path <ArrowRight size={15} />
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
                {store.state.completedLessons.length} lessons completed and
                saved
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
              <span className="eyebrow">REVIEW</span>
              <h2>Review these next</h2>
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
              <span className="eyebrow">YOUR SKILLS</span>
              <h2>Strong skills and skills to practise</h2>
            </div>
            <button onClick={() => navigate("progress")}>
              See progress <ArrowRight size={15} />
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
              <b>Learning tip</b>
              <span>
                {strongest.score
                  ? `${strongest.name} is your strongest area at ${strongest.score}%. `
                  : "Complete a lesson or quiz to see your first skill score. "}
                Practise next: {focus.name}, currently {focus.score}%.
              </span>
            </div>
          </div>
        </article>
        <article className="panel next-project">
          <span className="eyebrow">PROJECT TO TRY NEXT</span>
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
            Build a fast search page. You will control typing delays, cancel old
            requests, save results, and keep the search in the URL.
          </p>
          <div className="project-details">
            <span>
              <Clock3 size={15} /> 14 hours
            </span>
            <span>
              <ListChecks size={15} /> 11 steps
            </span>
          </div>
          <button
            className="secondary-button"
            onClick={() => navigate("projects")}
          >
            View project details <ArrowRight size={16} />
          </button>
        </article>
      </section>
    </div>
  );
}

function RoadmapPage({
  store,
  openLesson,
  initialPhaseId,
  onInitialPhaseConsumed,
  onLearningFocusChange,
}: {
  store: ForgeStore;
  openLesson: (title: string, phaseId: string) => void;
  initialPhaseId: string | null;
  onInitialPhaseConsumed: () => void;
  onLearningFocusChange: (focused: boolean) => void;
}) {
  const [selected, setSelected] = useState<CurriculumPhase | null>(() =>
    initialPhaseId
      ? (curriculumPhases.find((phase) => phase.id === initialPhaseId) ?? null)
      : null,
  );
  const [roadmapView, setRoadmapView] = useState<"cards" | "flow">("cards");
  const [topicPreview, setTopicPreview] = useState<{
    module: string;
    topic: string;
    position: number;
    topics: string[];
  } | null>(null);
  const openTopicPreview = (preview: NonNullable<typeof topicPreview>) => {
    onLearningFocusChange(true);
    setTopicPreview(preview);
  };
  const closeTopicPreview = () => {
    setTopicPreview(null);
    onLearningFocusChange(false);
  };
  const completed = new Set(store.state.completedLessons);
  const phaseModules = (phase: CurriculumPhase) =>
    getPhaseModules(phase, store.state.frontendFrameworkPath);
  const topicId = (phase: CurriculumPhase, moduleId: string, topic: string) =>
    curriculumLessons.find((item) => item.title === topic)?.id ??
    catalogLessonId(phase.id, moduleId, topic);
  const phaseProgress = (phase: CurriculumPhase) => {
    const ids = phaseModules(phase).flatMap((item) =>
      item.topics.map((topic) => topicId(phase, item.id, topic)),
    );
    return ids.length
      ? Math.round(
          (ids.filter((id) => completed.has(id)).length / ids.length) * 100,
        )
      : 0;
  };
  const overallIds = curriculumPhases.flatMap((phase) =>
    phaseModules(phase).flatMap((item) =>
      item.topics.map((topic) => topicId(phase, item.id, topic)),
    ),
  );
  const overall = Math.round(
    (overallIds.filter((id) => completed.has(id)).length / overallIds.length) *
      100,
  );
  useEffect(() => {
    if (initialPhaseId) onInitialPhaseConsumed();
  }, [initialPhaseId, onInitialPhaseConsumed]);
  if (selected && topicPreview) {
    const selectedModule = phaseModules(selected).find(
      (item) => item.title === topicPreview.module,
    );
    if (selectedModule)
      return (
        <Suspense
          fallback={
            <div className="page loading-page panel">Opening the lesson…</div>
          }
        >
          <CatalogTopicLesson
            key={`${selected.id}:${selectedModule.id}:${topicPreview.topic}`}
            phase={{ ...selected, modules: phaseModules(selected) }}
            module={selectedModule}
            topic={topicPreview.topic}
            position={topicPreview.position}
            store={store}
            onBack={closeTopicPreview}
            onSelect={(nextModule, topic, position) => {
              const lesson = curriculumLessons.find(
                (item) => item.title === topic,
              );
              if (lesson) {
                onLearningFocusChange(false);
                openLesson(topic, selected.id);
              } else
                openTopicPreview({
                  module: nextModule.title,
                  topic,
                  position,
                  topics: nextModule.topics,
                });
            }}
          />
        </Suspense>
      );
  }
  if (selected && topicPreview)
    return (
      <div className="page topic-preview">
        <button className="back-link" onClick={closeTopicPreview}>
          <ChevronLeft /> {selected.title}
        </button>
        <section className="page-title">
          <div>
            <span className="eyebrow teal">
              {selected.title.toUpperCase()} ·{" "}
              {topicPreview.module.toUpperCase()}
            </span>
            <h1>{topicPreview.topic}</h1>
            <p>
              You can open this topic at any time in your Full-Stack + AI
              course.
            </p>
          </div>
          <span className="status-pill active">Open access</span>
        </section>
        <div className="topic-preview-grid">
          <article className="panel">
            <span className="eyebrow">WHERE YOU ARE</span>
            <h2>
              Topic {topicPreview.position + 1} of {topicPreview.topics.length}
            </h2>
            <p>
              Part of <b>{topicPreview.module}</b> in the{" "}
              <b>{selected.title}</b> phase. It follows{" "}
              {topicPreview.position
                ? topicPreview.topics[topicPreview.position - 1]
                : "the stage introduction"}{" "}
              and prepares you for{" "}
              {topicPreview.topics[topicPreview.position + 1] ??
                "the section test"}
              .
            </p>
          </article>
          <article className="panel">
            <span className="eyebrow">WHY THIS MATTERS</span>
            <h2>See how this topic connects</h2>
            <p>
              {selected.description} This topic is one step in that learning
              path, and you can open it at any time.
            </p>
          </article>
          <article className="panel topic-outline">
            <span className="eyebrow">TOPICS IN THIS SECTION</span>
            <h2>{topicPreview.module}</h2>
            {topicPreview.topics.map((topic, index) => (
              <button
                key={topic}
                className={topic === topicPreview.topic ? "active" : ""}
                onClick={() => {
                  const lesson = curriculumLessons.find(
                    (item) => item.title === topic,
                  );
                  if (lesson) {
                    onLearningFocusChange(false);
                    openLesson(topic, selected.id);
                  } else
                    openTopicPreview({
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
          <ChevronLeft /> Back to the full learning path
        </button>
        <section className="page-title">
          <div>
            <span className="eyebrow">
              STAGE {String(selected.order).padStart(2, "0")} ·{" "}
              {selected.difficulty.toUpperCase()}
            </span>
            <h1>{selected.title}</h1>
            <p>{selected.description}</p>
          </div>
          <div className="title-stat">
            <ProgressRing value={phaseProgress(selected)} />
            <div>
              <b>{phaseModules(selected).length} sections</b>
              <span>
                {phaseModules(selected).reduce(
                  (sum, item) => sum + item.topics.length,
                  0,
                )}{" "}
                topics in learning order
              </span>
              <small>All topics are open · choose any topic</small>
            </div>
          </div>
        </section>
        {selected.id === "frontend" && (
          <section
            className="framework-choice panel"
            aria-labelledby="framework-choice-title"
          >
            <div className="framework-choice-copy">
              <span className="eyebrow teal">CHOOSE A FRONTEND FRAMEWORK</span>
              <h2 id="framework-choice-title">Learn React, Angular, or both</h2>
              <p>
                First, everyone learns the same web basics. Then you can study
                React, Angular, or both. You can change this choice later.
              </p>
            </div>
            <div className="framework-choice-options">
              {(
                [
                  [
                    "react",
                    "R",
                    "React",
                    "Build modern websites with a flexible library and Next.js",
                  ],
                  [
                    "angular",
                    "A",
                    "Angular",
                    "Build large, structured business apps with Angular and RxJS",
                  ],
                  [
                    "both",
                    "R+A",
                    "Learn both",
                    "Learn both and understand when to use each one",
                  ],
                ] as const
              ).map(([value, mark, label, description]) => (
                <button
                  key={value}
                  className={
                    store.state.frontendFrameworkPath === value ? "active" : ""
                  }
                  aria-pressed={store.state.frontendFrameworkPath === value}
                  onClick={() => store.setFrontendFrameworkPath(value)}
                >
                  <span>{mark}</span>
                  <div>
                    <b>{label}</b>
                    <small>{description}</small>
                  </div>
                  {store.state.frontendFrameworkPath === value && <Check />}
                </button>
              ))}
            </div>
            {!store.state.frontendFrameworkPath && (
              <div className="framework-choice-prompt">
                <Lightbulb /> Choose one option to show its lessons. You can
                change it at any time.
              </div>
            )}
          </section>
        )}
        <div className="module-grid">
          {phaseModules(selected).map((item, moduleIndex) => (
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
                      title={!lesson ? "Open the full topic lesson" : undefined}
                      onClick={() => {
                        if (available) {
                          onLearningFocusChange(false);
                          openLesson(topic, selected.id);
                        } else
                          openTopicPreview({
                            module: item.title,
                            topic,
                            position: topicIndex,
                            topics: item.topics,
                          });
                      }}
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
          <span className="eyebrow">YOUR COMPLETE COURSE</span>
          <h1>
            Start at zero. Grow into an{" "}
            <span className="gradient-text">AI engineer</span>
          </h1>
          <p>
            Learn one topic at a time. Practice it, use it in a project, and
            prepare for interview questions.
          </p>
        </div>
        <div className="title-stat">
          <ProgressRing value={overall} />
          <div>
            <b>Course progress</b>
            <span>
              {curriculumPhases.length} stages · {totalCatalogTopics} topics
            </span>
            <small>
              {store.state.completedLessons.length} lessons completed
            </small>
          </div>
        </div>
      </section>
      <div
        className="roadmap-view-switch"
        role="group"
        aria-label="Learning path view"
      >
        <button
          className={roadmapView === "cards" ? "active" : ""}
          aria-pressed={roadmapView === "cards"}
          onClick={() => setRoadmapView("cards")}
        >
          <Layers3 /> Card view
        </button>
        <button
          className={roadmapView === "flow" ? "active" : ""}
          aria-pressed={roadmapView === "flow"}
          onClick={() => setRoadmapView("flow")}
        >
          <Network /> Interactive flow
        </button>
      </div>
      {roadmapView === "flow" ? (
        <section
          className="roadmap-flow panel"
          aria-label="Interactive learning path flow"
        >
          <div className="roadmap-flow-intro">
            <span className="eyebrow teal">ZERO TO PROFESSIONAL</span>
            <h2>Click any stage to explore its learning tree</h2>
            <p>
              Follow the main path from top to bottom. Branches show the major
              sections inside each stage.
            </p>
          </div>
          <div className="roadmap-flow-tree">
            {curriculumPhases.map((node, index) => {
              const progress = phaseProgress(node);
              return (
                <div className="flow-stage" key={node.id}>
                  {index > 0 && (
                    <span className="flow-connector" aria-hidden="true" />
                  )}
                  <button
                    onClick={() => setSelected(node)}
                    aria-label={`Explore ${node.title}`}
                  >
                    <span>{String(node.order).padStart(2, "0")}</span>
                    <div>
                      <small>
                        {node.difficulty} · {node.duration}
                      </small>
                      <b>{node.title}</b>
                      <em>
                        {node.modules.length} sections ·{" "}
                        {node.modules.reduce(
                          (sum, module) => sum + module.topics.length,
                          0,
                        )}{" "}
                        topics
                      </em>
                    </div>
                    <strong>{progress}%</strong>
                    <ArrowRight />
                  </button>
                  <div
                    className="flow-branches"
                    aria-label={`${node.title} sections`}
                  >
                    {node.modules.slice(0, 6).map((module) => (
                      <button key={module.id} onClick={() => setSelected(node)}>
                        <span>{module.title}</span>
                        <small>{module.topics.length} topics</small>
                      </button>
                    ))}
                    {node.modules.length > 6 && (
                      <button onClick={() => setSelected(node)}>
                        <span>+ {node.modules.length - 6} more sections</span>
                        <small>Open stage</small>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
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
                        STAGE {String(node.order).padStart(2, "0")}
                      </span>
                      <h2>{node.title}</h2>
                    </div>
                    <span className={`status-pill ${status}`}>
                      {status === "complete"
                        ? "Completed"
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
                      {node.modules.length} sections
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
      )}
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
          <button aria-label="Send lesson question">
            <ArrowRight size={16} aria-hidden="true" />
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
              <button aria-label={`Open ${p.title}`}>
                <ArrowRight size={17} aria-hidden="true" />
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
              aria-label={
                done.includes(r.title)
                  ? `Mark ${r.title} as not reviewed`
                  : `Mark ${r.title} as reviewed`
              }
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
            <button
              className="round-action"
              aria-label={`Open practice for ${r.title}`}
            >
              <ArrowRight size={17} aria-hidden="true" />
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
      title: "Focused practice",
      kicker: "PRACTICE WHAT YOU LEARN",
      text: "Answer questions, fix bugs, write code, and explain ideas from your current lessons.",
      action: "Start practicing",
    },
    knowledge: {
      icon: NotebookPen,
      title: "Your notes",
      kicker: "SAVE WHAT YOU LEARN",
      text: "Keep notes, code examples, useful decisions, and mistakes you do not want to repeat.",
      action: "Write your first note",
    },
    progress: {
      icon: BarChart3,
      title: "See what you can do",
      kicker: "YOUR PROGRESS",
      text: "See your results from lessons, practice, projects, review, and interview answers.",
      action: "See my progress",
    },
    mentor: {
      icon: Sparkles,
      title: "Get help without losing the answer",
      kicker: "AI HELP",
      text: "Ask for a small hint, a simple explanation, or feedback on your own solution.",
      action: "Ask for help",
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
          Back to Home
        </button>
      </div>
      <div className="coming-grid">
        <div>
          <CheckCircle2 />
          <b>Help based on your course</b>
          <span>
            Suggestions use your lessons, reviews, and saved project work.
          </span>
        </div>
        <div>
          <BrainCircuit />
          <b>Practice at the right level</b>
          <span>
            Questions become harder as your answers and projects improve.
          </span>
        </div>
        <div>
          <Award />
          <b>Progress based on real work</b>
          <span>
            Your progress comes from what you can explain and build yourself.
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
      title: "Practice questions and coding tasks",
      meta: "Practice · 4 challenges",
      page: "practice" as NavId,
    },
    {
      title: "Official guides and learning resources",
      meta: "Resources · hand-picked",
      page: "resources" as NavId,
    },
    {
      title: "Foundation course test",
      meta: "Quiz · 10 questions",
      page: "quizzes" as NavId,
    },
    {
      title: "Intelligent Search Dashboard",
      meta: "Project P05",
      page: "projects" as NavId,
    },
    {
      title: "Topics to review today",
      meta: "Review · due today",
      page: "reviews" as NavId,
    },
    {
      title: "Technical interview practice",
      meta: "Interview Prep · guided",
      page: "interview" as NavId,
    },
    {
      title: "My notes and mistakes",
      meta: "My Notes",
      page: "knowledge" as NavId,
    },
    {
      title: "Certificates of Completion",
      meta: "Certificates earned from completed work",
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
          <button onClick={close} aria-label="Close search">
            <X aria-hidden="true" />
          </button>
        </div>
        <span className="eyebrow">
          {query ? `${results.length} RESULTS` : "GO TO A PAGE"}
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
        <button
          className="modal-close"
          onClick={close}
          aria-label="Close settings"
        >
          <X aria-hidden="true" />
        </button>
        <span className="eyebrow teal">PROFILE ON THIS DEVICE</span>
        <h2 id="settings-title">Your Forge profile</h2>
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
            <span>Choose a dark or light screen.</span>
          </div>
          <button className="secondary-button" onClick={() => setDark(!dark)}>
            {dark ? <Sun /> : <Moon />}
            {dark ? "Use light" : "Use dark"}
          </button>
        </div>
        <div className="setting-row">
          <div>
            <b>Where your work is saved</b>
            <span>
              Your lessons and progress stay in this browser under profile{" "}
              {profile.id}.
            </span>
          </div>
          <span className="local-status">
            <CheckCircle2 /> Saved
          </span>
        </div>
        <div className="setting-row">
          <div>
            <b>Change profile</b>
            <span>Log out without deleting this profile or its progress.</span>
          </div>
          <button className="secondary-button" onClick={logout}>
            Log out
          </button>
        </div>
        <div className="setting-row danger">
          <div>
            <b>Delete this profile’s progress</b>
            <span>
              This removes all saved learning work and cannot be undone.
            </span>
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
  account,
}: {
  profiles: LearnerProfile[];
  createProfile: (profile: Omit<LearnerProfile, "id" | "createdAt">) => void;
  login: (id: string) => void;
  account: CloudAccount;
}) {
  const [mode, setMode] = useState<
    | "welcome"
    | "create"
    | "login"
    | "account-login"
    | "account-create"
    | "account-recover"
  >("welcome");
  const [accountForm, setAccountForm] = useState({
    email: "",
    password: "",
    fullName: "",
    username: "",
    recoveryCode: "",
  });
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
          <span className="eyebrow teal">FORGE · SAVED ON THIS DEVICE</span>
          <h1>Learn web development and AI, one clear step at a time.</h1>
          <p>
            Start with no experience. Learn with simple lessons, practice,
            projects, review, and interview preparation. Your work stays in this
            browser.
          </p>
          <div className="profile-actions">
            <button
              className="primary-button"
              onClick={() => setMode("account-login")}
            >
              Sign in to Forge <ArrowRight />
            </button>
            <button
              className="secondary-button"
              onClick={() => setMode("create")}
            >
              Start learning on this device
            </button>
            <button
              className="text-button"
              onClick={() => setMode("login")}
              disabled={!profiles.length}
            >
              Login to saved local profile
            </button>
          </div>
          <small>
            Cloud accounts synchronize across devices. Local learning remains
            available offline.
          </small>
        </div>
      </main>
    );
  if (
    mode === "account-login" ||
    mode === "account-create" ||
    mode === "account-recover"
  ) {
    const creating = mode === "account-create";
    const recovering = mode === "account-recover";
    return (
      <main className="profile-gate">
        <form
          className="profile-card panel"
          onSubmit={async (event) => {
            event.preventDefault();
            if (creating) await account.register(accountForm);
            else if (recovering) {
              const recovered = await account.recover({
                email: accountForm.email,
                recoveryCode: accountForm.recoveryCode,
                password: accountForm.password,
              });
              if (recovered) setMode("account-login");
            } else
              await account.login({
                email: accountForm.email,
                password: accountForm.password,
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
          <span className="eyebrow teal">FORGE CLOUD ACCOUNT</span>
          <h1>
            {creating
              ? "Create your account"
              : recovering
                ? "Recover your account"
                : "Welcome back"}
          </h1>
          <p>
            {creating
              ? "Save your learning securely and continue on another device."
              : recovering
                ? "Enter the recovery code you saved when creating your account."
                : "Continue your lessons, projects, reviews, and practice."}
          </p>
          {account.error && (
            <div className="account-error" role="alert">
              {account.error}
            </div>
          )}
          {!creating && !recovering && account.recoveryCode && (
            <div className="account-recovery-result" role="status">
              <b>Password changed. Save your new recovery code:</b>
              <code>{account.recoveryCode}</code>
            </div>
          )}
          <div className="profile-form account-form">
            {creating && (
              <>
                <label>
                  Full name
                  <input
                    required
                    autoComplete="name"
                    value={accountForm.fullName}
                    onChange={(event) =>
                      setAccountForm({
                        ...accountForm,
                        fullName: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Username
                  <input
                    required
                    autoComplete="username"
                    pattern="[a-z0-9_-]{3,30}"
                    value={accountForm.username}
                    onChange={(event) =>
                      setAccountForm({
                        ...accountForm,
                        username: event.target.value.toLowerCase(),
                      })
                    }
                  />
                </label>
              </>
            )}
            <label>
              Email
              <input
                required
                type="email"
                autoComplete="email"
                value={accountForm.email}
                onChange={(event) =>
                  setAccountForm({ ...accountForm, email: event.target.value })
                }
              />
            </label>
            {recovering && (
              <label>
                Recovery code
                <input
                  required
                  autoComplete="off"
                  value={accountForm.recoveryCode}
                  onChange={(event) =>
                    setAccountForm({
                      ...accountForm,
                      recoveryCode: event.target.value,
                    })
                  }
                />
              </label>
            )}
            <label>
              Password
              <input
                required
                type="password"
                minLength={10}
                maxLength={128}
                autoComplete={
                  creating || recovering ? "new-password" : "current-password"
                }
                value={accountForm.password}
                onChange={(event) =>
                  setAccountForm({
                    ...accountForm,
                    password: event.target.value,
                  })
                }
              />
            </label>
          </div>
          <button
            className="primary-button"
            type="submit"
            disabled={account.loading}
          >
            {account.loading
              ? "Please wait…"
              : creating
                ? "Create secure account"
                : recovering
                  ? "Set new password"
                  : "Sign in"}
          </button>
          <button
            className="text-button account-mode-switch"
            type="button"
            onClick={() => {
              account.clearError();
              setMode(creating ? "account-login" : "account-create");
            }}
          >
            {creating
              ? "Already have an account? Sign in"
              : "New to Forge? Create an account"}
          </button>
          {!creating && !recovering && (
            <button
              className="text-button account-mode-switch"
              type="button"
              onClick={() => setMode("account-recover")}
            >
              Recover access with a saved code
            </button>
          )}
        </form>
      </main>
    );
  }
  if (mode === "login")
    return (
      <main className="profile-gate">
        <section className="profile-card panel">
          <button className="back-link" onClick={() => setMode("welcome")}>
            <ChevronLeft /> Back
          </button>
          <span className="eyebrow teal">WELCOME BACK</span>
          <h1>Choose a profile</h1>
          <p>Each person’s work is saved separately on this device.</p>
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
        <span className="eyebrow teal">PROFILE ON THIS DEVICE</span>
        <h1>Set up your learning</h1>
        <p>
          You do not need a password. This profile is saved only in this
          browser.
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
  cloudEnabled,
  recoveryCode,
}: {
  profile: LearnerProfile;
  logout: () => void;
  cloudEnabled: boolean;
  recoveryCode: string | null;
}) {
  const routeIds: NavId[] = [
    "home",
    "learn",
    "roadmap",
    "resources",
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
  const [catalogLearningFocus, setCatalogLearningFocus] = useState(false);
  const [focusNavOpen, setFocusNavOpen] = useState(false);
  const [fullScreen, setFullScreen] = useState(
    Boolean(document.fullscreenElement),
  );
  const [roadmapReturnPhaseId, setRoadmapReturnPhaseId] = useState<
    string | null
  >(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const store = useForgeStore(profile.id);
  const cloud = useCloudProgress(store, cloudEnabled);
  const learningFocus = active === "learn" || catalogLearningFocus;
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
      if (
        !learningFocus &&
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
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
  }, [learningFocus]);
  useEffect(() => {
    const sync = () => setFullScreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const path = active === "home" ? "/" : `/${active}`;
    if (window.location.pathname !== path)
      window.history.replaceState({ page: active }, "", path);
  }, [active]);
  const title = useMemo(
    () => navItems.find((x) => x.id === active)?.label || "AI Help",
    [active],
  );
  let view;
  if (active === "home")
    view = <Dashboard navigate={setActive} store={store} profile={profile} />;
  else if (active === "roadmap")
    view = (
      <RoadmapPage
        store={store}
        initialPhaseId={roadmapReturnPhaseId}
        onInitialPhaseConsumed={() => setRoadmapReturnPhaseId(null)}
        onLearningFocusChange={setCatalogLearningFocus}
        openLesson={(title, phaseId) => {
          setRoadmapReturnPhaseId(phaseId);
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
        onBack={() => {
          setCatalogLearningFocus(false);
          setActive("roadmap");
        }}
        backLabel={
          roadmapReturnPhaseId
            ? `Back to ${curriculumPhases.find((phase) => phase.id === roadmapReturnPhaseId)?.title ?? "previous page"}`
            : "Back to Learning Path"
        }
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
  else if (active === "resources")
    view = (
      <Suspense
        fallback={
          <div className="page loading-page panel">
            Opening learning resources…
          </div>
        }
      >
        <ResourcesPage />
      </Suspense>
    );
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
    <div className={`app-shell ${learningFocus ? "learning-focus" : ""}`}>
      {!learningFocus && (
        <Sidebar
          active={active}
          onNavigate={setActive}
          open={mobileOpen}
          close={() => setMobileOpen(false)}
          store={store}
          profile={profile}
        />
      )}
      {learningFocus && (
        <>
          <button
            className="focus-nav-edge"
            onClick={() => setFocusNavOpen(true)}
            aria-label="Open main navigation"
          >
            <Menu />
            <span>Menu</span>
          </button>
          <div className="focus-screen-actions">
            <button onClick={() => setFocusNavOpen(true)}>
              <Menu />
              <span>Menu</span>
            </button>
            <button
              onClick={() => {
                if (document.fullscreenElement) void document.exitFullscreen();
                else void document.documentElement.requestFullscreen();
              }}
              aria-label={fullScreen ? "Exit full screen" : "Enter full screen"}
            >
              {fullScreen ? <Minimize2 /> : <Maximize2 />}
              <span>{fullScreen ? "Exit full screen" : "Full screen"}</span>
            </button>
          </div>
          {focusNavOpen && (
            <div className="focus-navigation">
              <Sidebar
                active={active}
                onNavigate={(id) => {
                  setActive(id);
                  setFocusNavOpen(false);
                }}
                open
                close={() => setFocusNavOpen(false)}
                store={store}
                profile={profile}
              />
            </div>
          )}
        </>
      )}
      <div className="main-shell">
        {!learningFocus && recoveryCode && (
          <div className="recovery-code-banner" role="alert">
            <span>
              <b>Save your one-time account recovery code now</b>
              Store it in a password manager. Forge only stores a secure hash
              and cannot show it again.
            </span>
            <code>{recoveryCode}</code>
            <button
              className="secondary-button"
              onClick={() =>
                void navigator.clipboard
                  .writeText(recoveryCode)
                  .then(() => notify("Recovery code copied"))
              }
            >
              Copy code
            </button>
          </div>
        )}
        {!learningFocus && cloudEnabled && cloud.status === "needs-import" && (
          <div className="cloud-import-banner" role="status">
            <span>
              <b>Bring this device’s progress into your account</b>
              Your local work stays untouched and will sync after import.
            </span>
            <button
              className="primary-button"
              onClick={cloud.importLocalProgress}
            >
              Import my Forge progress
            </button>
          </div>
        )}
        {!learningFocus && cloudEnabled && cloud.status === "offline" && (
          <div className="cloud-status-banner" role="status">
            Offline — changes remain saved on this device and will sync when
            Forge reconnects.
          </div>
        )}
        {!learningFocus && (
          <Topbar
            title={title}
            dark={dark}
            setDark={setDark}
            openMenu={() => setMobileOpen(true)}
            openSearch={() => setSearchOpen(true)}
            openSettings={() => setSettingsOpen(true)}
          />
        )}
        {view}
        {!learningFocus && (
          <button
            className="floating-mentor"
            onClick={() => setActive("mentor")}
          >
            <Sparkles size={19} />
            <span>Ask for help</span>
          </button>
        )}
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
  const account = useCloudAccount();
  const { activeProfile, activateCloudProfile } = profiles;
  useEffect(() => {
    if (account.user && activeProfile?.id !== account.user.id)
      activateCloudProfile(account.user);
  }, [account.user, activeProfile?.id, activateCloudProfile]);
  if (!activeProfile)
    return (
      <Welcome
        profiles={profiles.profiles}
        createProfile={profiles.createProfile}
        login={profiles.login}
        account={account}
      />
    );
  return (
    <LearningWorkspace
      key={activeProfile.id}
      profile={activeProfile}
      logout={() => {
        if (account.user) void account.logout();
        profiles.logout();
      }}
      cloudEnabled={account.user?.id === activeProfile.id}
      recoveryCode={account.recoveryCode}
    />
  );
}
