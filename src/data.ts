export type NavId =
  | "home"
  | "learn"
  | "roadmap"
  | "resources"
  | "practice"
  | "quizzes"
  | "projects"
  | "workspace"
  | "labs"
  | "portfolio"
  | "interview"
  | "knowledge"
  | "reviews"
  | "progress"
  | "certificates"
  | "mentor";

export type RoadmapNode = {
  id: string;
  title: string;
  description: string;
  progress: number;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  status: "complete" | "active" | "locked";
  icon: string;
  topics: string[];
};

export const roadmapNodes: RoadmapNode[] = [
  {
    id: "foundations",
    title: "Web Foundations",
    description:
      "Learn how the web works, use Git, and build accessible pages with HTML and CSS.",
    progress: 100,
    duration: "2 weeks",
    difficulty: "Beginner",
    status: "complete",
    icon: "01",
    topics: ["Computer science", "Git & Linux", "HTML", "CSS", "Accessibility"],
  },
  {
    id: "javascript",
    title: "JavaScript",
    description:
      "Go from basic JavaScript to closures, prototypes, async code, and faster apps.",
    progress: 68,
    duration: "3 weeks",
    difficulty: "Intermediate",
    status: "active",
    icon: "02",
    topics: [
      "Execution context",
      "Closures",
      "Event loop",
      "Promises",
      "Memory",
    ],
  },
  {
    id: "typescript",
    title: "TypeScript",
    description:
      "Use types to catch mistakes and keep large apps clear and reliable.",
    progress: 18,
    duration: "2 weeks",
    difficulty: "Intermediate",
    status: "active",
    icon: "03",
    topics: [
      "Type system",
      "Generics",
      "Narrowing",
      "Utility types",
      "SDK design",
    ],
  },
  {
    id: "frontend",
    title: "Frontend Engineering",
    description:
      "Build real websites with React or Angular, tests, accessibility, and good performance.",
    progress: 0,
    duration: "9 weeks",
    difficulty: "Advanced",
    status: "locked",
    icon: "04",
    topics: ["React", "Angular", "State", "Testing", "Performance"],
  },
  {
    id: "backend",
    title: "Backend & Data",
    description:
      "Build safe APIs, work with databases, and add background jobs and live updates.",
    progress: 0,
    duration: "5 weeks",
    difficulty: "Advanced",
    status: "locked",
    icon: "05",
    topics: ["Node.js", "PostgreSQL", "Redis", "Security", "Queues"],
  },
  {
    id: "system-design",
    title: "System Design",
    description:
      "Design systems that stay reliable and easy to change as they grow.",
    progress: 0,
    duration: "7 weeks",
    difficulty: "Advanced",
    status: "locked",
    icon: "06",
    topics: ["LLD", "HLD", "Caching", "Scaling", "Observability"],
  },
  {
    id: "ai",
    title: "Applied AI Engineering",
    description:
      "Build ML, LLM, RAG, and agent systems. Test their quality and run them safely.",
    progress: 0,
    duration: "19 weeks",
    difficulty: "Advanced",
    status: "locked",
    icon: "07",
    topics: ["Python", "ML", "LLMs", "RAG", "Agents", "Evals"],
  },
];

export const projectCards = [
  {
    id: "p02",
    code: "P02",
    title: "Accessible Product Website",
    type: "Frontend",
    level: "Beginner",
    progress: 0,
    description:
      "Turn a product brief into a responsive, keyboard-friendly website with strong HTML, CSS, forms, and performance.",
    accent: "green",
    tasks: "0 / 10",
    hours: "10h",
  },
  {
    id: "p05",
    code: "P05",
    title: "Intelligent Search Dashboard",
    type: "JavaScript",
    level: "Intermediate",
    progress: 72,
    description:
      "Build fast search with typing delay, saved results, pages, shareable URLs, and clear error handling.",
    accent: "blue",
    tasks: "8 / 11",
    hours: "14h",
  },
  {
    id: "p16",
    code: "P16",
    title: "Enterprise Analytics",
    type: "Angular",
    level: "Advanced",
    progress: 26,
    description:
      "Build dashboards for different user roles, large data sets, live charts, and clear speed targets.",
    accent: "violet",
    tasks: "4 / 15",
    hours: "24h",
  },
  {
    id: "p11",
    code: "P11",
    title: "Production Design System",
    type: "React",
    level: "Intermediate",
    progress: 0,
    description:
      "Create accessible reusable components, design tokens, documentation, tests, and a versioned package.",
    accent: "blue",
    tasks: "0 / 10",
    hours: "18h",
  },
  {
    id: "p20",
    code: "P20",
    title: "Secure API Platform",
    type: "Backend",
    level: "Intermediate",
    progress: 0,
    description:
      "Design a typed REST API with PostgreSQL, authentication, authorization, tests, rate limits, and OpenAPI docs.",
    accent: "amber",
    tasks: "0 / 10",
    hours: "22h",
  },
  {
    id: "p25",
    code: "P25",
    title: "Multi-tenant SaaS",
    type: "Backend",
    level: "Advanced",
    progress: 0,
    description:
      "Keep each customer’s data separate. Add role permissions, activity logs, background jobs, and monitoring.",
    accent: "amber",
    tasks: "0 / 18",
    hours: "32h",
  },
  {
    id: "p31",
    code: "P31",
    title: "Enterprise Knowledge Copilot",
    type: "AI + RAG",
    level: "Expert",
    progress: 0,
    description:
      "Search only allowed documents, improve result order, show sources, test answer quality, and add AI safety checks.",
    accent: "green",
    tasks: "0 / 21",
    hours: "40h",
  },
  {
    id: "p34",
    code: "P34",
    title: "Production ML Product",
    type: "AI + ML",
    level: "Professional",
    progress: 0,
    description:
      "Train and evaluate a model, serve it through an API, monitor quality and drift, and publish a responsible model card.",
    accent: "violet",
    tasks: "0 / 11",
    hours: "45h",
  },
];

export const reviewItems = [
  {
    title: "Closures & lexical scope",
    type: "Remember the idea",
    duration: "6 min",
    due: "Due now",
    strength: 54,
  },
  {
    title: "Two pointer pattern",
    type: "Repeat the code",
    duration: "12 min",
    due: "Due now",
    strength: 61,
  },
  {
    title: "Event loop ordering",
    type: "Prediction",
    duration: "8 min",
    due: "Today",
    strength: 72,
  },
  {
    title: "Database indexing",
    type: "Interview answer",
    duration: "10 min",
    due: "Tomorrow",
    strength: 81,
  },
];

export const weeklyActivity = [42, 68, 54, 88, 74, 96, 62];

export const skills = [
  { name: "JavaScript", score: 78, color: "#5eead4" },
  { name: "TypeScript", score: 54, color: "#60a5fa" },
  { name: "Frontend", score: 44, color: "#a78bfa" },
  { name: "Backend", score: 31, color: "#fbbf24" },
  { name: "System design", score: 22, color: "#fb7185" },
  { name: "AI engineering", score: 18, color: "#34d399" },
];

export const interviewQuestions = [
  "Explain how the JavaScript event loop prioritizes microtasks and macrotasks.",
  "What is a closure, and where have you used one in a real project?",
  "Design a rate limiter for a public API. What changes at 100,000 requests per second?",
  "How would you prevent one tenant from retrieving another tenant’s documents in a RAG system?",
];
