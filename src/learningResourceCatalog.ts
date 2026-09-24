import { coreResourceCatalog } from "./topicResources";
import type {
  LearningResource,
  LearningResourceSource,
  ResourceKind,
  ResourceLevel,
} from "./resourceTypes";
import { normalizeLearningResource } from "./resourceTypes";

const additionalResources: LearningResourceSource[] = [
  {
    id: "freecodecamp",
    technology: "Learning Platforms",
    title: "freeCodeCamp Curriculum",
    provider: "freeCodeCamp",
    url: "https://www.freecodecamp.org/learn/",
    kind: "Guided course",
    level: "Start here",
    description:
      "Short theory lessons, workshops, labs, reviews, quizzes, certification projects, and exams across web development, Python, databases, backend, and data science.",
    free: true,
  },
  {
    id: "odin-project",
    technology: "Learning Platforms",
    title: "Full Stack JavaScript Path",
    provider: "The Odin Project",
    url: "https://www.theodinproject.com/paths/full-stack-javascript",
    kind: "Guided course",
    level: "Foundation",
    description:
      "A project-heavy sequence through HTML, CSS, JavaScript, React, databases, Node, Git, and job preparation.",
    free: true,
  },
  {
    id: "frontend-mentor",
    technology: "Frontend Engineering",
    title: "Frontend Mentor Challenges",
    provider: "Frontend Mentor",
    url: "https://www.frontendmentor.io/challenges",
    kind: "Projects",
    level: "Foundation",
    description:
      "Design- and specification-driven UI projects graded from Newbie through Guru for responsive, accessible portfolio practice.",
    free: true,
  },
  {
    id: "roadmap-sh",
    technology: "Learning Platforms",
    title: "Developer Roadmaps",
    provider: "roadmap.sh",
    url: "https://roadmap.sh/",
    kind: "Reference",
    level: "Start here",
    description:
      "Community-maintained skill maps, guides, best practices, and projects for frontend, backend, full-stack, AI, DevOps, and related roles.",
    free: true,
  },
  {
    id: "hackerrank-prep",
    technology: "Career & Interviews",
    title: "Interview Preparation Kits",
    provider: "HackerRank",
    url: "https://www.hackerrank.com/interview/preparation-kits",
    kind: "Interview",
    level: "Intermediate",
    description:
      "Time-boxed preparation kits and coding problems organized around common technical interview skills and patterns.",
    free: true,
  },
  {
    id: "leetcode-study",
    technology: "Data Structures & Algorithms",
    title: "LeetCode Study Plans",
    provider: "LeetCode",
    url: "https://leetcode.com/studyplan/",
    kind: "Interview",
    level: "Intermediate",
    description:
      "Sequenced coding-interview practice covering essential patterns, SQL, algorithms, and role-oriented preparation.",
    free: true,
  },
  {
    id: "exercism-tracks",
    technology: "Learning Platforms",
    title: "Programming Language Tracks",
    provider: "Exercism",
    url: "https://exercism.org/tracks",
    kind: "Practice",
    level: "Foundation",
    description:
      "Concept maps, learning exercises, test suites, practice problems, automated analysis, and optional mentoring across programming languages.",
    free: true,
  },
  {
    id: "fullstack-open-platform",
    technology: "Full-Stack Development",
    title: "Full Stack Open",
    provider: "University of Helsinki",
    url: "https://fullstackopen.com/en/",
    kind: "Guided course",
    level: "Intermediate",
    description:
      "Exercise-driven React, Node, TypeScript, testing, GraphQL, CI/CD, container, and relational-database study with submissions.",
    official: true,
    free: true,
  },
  {
    id: "port-swigger-academy",
    technology: "Security",
    title: "Web Security Academy",
    provider: "PortSwigger",
    url: "https://portswigger.net/web-security",
    kind: "Practice",
    level: "Advanced",
    description:
      "Guided learning material and safe interactive labs for web vulnerabilities, exploitation mechanics, and defenses.",
    official: true,
    free: true,
  },
  {
    id: "playwright-docs",
    technology: "Testing",
    title: "Playwright Documentation",
    provider: "Microsoft",
    url: "https://playwright.dev/docs/intro",
    kind: "Official documentation",
    level: "Intermediate",
    description:
      "Cross-browser end-to-end testing, resilient locators, fixtures, isolation, debugging, traces, CI, and visual comparisons.",
    official: true,
    free: true,
  },
  {
    id: "vitest-guide",
    technology: "Testing",
    title: "Vitest Guide",
    provider: "Vitest",
    url: "https://vitest.dev/guide/",
    kind: "Official documentation",
    level: "Intermediate",
    description:
      "Fast JavaScript and TypeScript unit testing, mocking, coverage, browser mode, workspaces, and test organization.",
    official: true,
    free: true,
  },
  {
    id: "github-profile",
    technology: "Career & Interviews",
    title: "GitHub Profile and Portfolio",
    provider: "GitHub Docs",
    url: "https://docs.github.com/en/account-and-profile/get-started/profile",
    kind: "Official documentation",
    level: "Professional",
    description:
      "Build a credible public profile, profile README, pinned repositories, contribution evidence, and portfolio presentation.",
    official: true,
    free: true,
  },
  {
    id: "freecodecamp-project-euler",
    technology: "Data Structures & Algorithms",
    title: "Project Euler Problems",
    provider: "Project Euler",
    url: "https://projecteuler.net/archives",
    kind: "Practice",
    level: "Intermediate",
    description:
      "Mathematical programming problems that reward algorithmic thinking, correctness, and performance improvements.",
    free: true,
  },
  {
    id: "sql-practice",
    technology: "Databases & SQL",
    title: "SQL Practice",
    provider: "HackerRank",
    url: "https://www.hackerrank.com/domains/sql",
    kind: "Practice",
    level: "Foundation",
    description:
      "Graded SQL exercises covering selection, aggregation, joins, subqueries, and increasingly complex data transformations.",
    free: true,
  },
  {
    id: "huggingface-learn",
    technology: "AI Engineering",
    title: "Hugging Face Learn",
    provider: "Hugging Face",
    url: "https://huggingface.co/learn",
    kind: "Guided course",
    level: "Intermediate",
    description:
      "Open courses for LLMs, agents, deep reinforcement learning, computer vision, audio, diffusion, MCP, and open-source AI tooling.",
    official: true,
    free: true,
  },
];

export const learningResources: LearningResource[] = coreResourceCatalog
  .concat(additionalResources.map(normalizeLearningResource))
  .filter(
    (item, index, items) =>
      items.findIndex((candidate) => candidate.id === item.id) === index,
  );

export const resourceTechnologies = [
  "All technologies",
  ...Array.from(new Set(learningResources.map((item) => item.technology))).sort(),
];

export const resourceKinds: ("All resources" | ResourceKind)[] = [
  "All resources",
  "Official documentation",
  "Video tutorial",
  "Guided course",
  "Practice",
  "Projects",
  "Interview",
  "Reference",
];

export type AcademyStage = {
  level: Exclude<ResourceLevel, "Start here">;
  objective: string;
  learning: string;
  practice: string;
  evidence: string;
};

export const academyStages: AcademyStage[] = [
  {
    level: "Foundation",
    objective: "Understand the basics and make a small result that works.",
    learning: "Clear explanations, examples, important words, and simple predictions.",
    practice: "Small exercises with hints and quick checks.",
    evidence: "A mini-project, your own explanation, and a topic quiz.",
  },
  {
    level: "Intermediate",
    objective: "Combine topics and handle common unusual cases on your own.",
    learning: "Common coding patterns, APIs, debugging, and connecting features.",
    practice: "Medium exercises, broken tests, and section projects.",
    evidence: "A tested app feature, code review, and section test.",
  },
  {
    level: "Advanced",
    objective: "Design systems that are safe, fast, and easy to change.",
    learning: "Architecture, how tools work inside, speed, security, and other options.",
    practice: "Hard open-ended tasks, live-app problems, and safe data changes.",
    evidence: "A live portfolio project with tests, measurements, and saved decisions.",
  },
  {
    level: "Professional",
    objective: "Explain your choices and run real systems people can depend on.",
    learning: "Reliability, monitoring, growth, teamwork, and product needs.",
    practice: "Unclear requirements, live-app problems, and practice interviews.",
    evidence: "A final project, support guide, design review, interview, and case study.",
  },
];

export type RoleRoadmap = {
  id: "frontend" | "fullstack" | "ai" | "dsa";
  title: string;
  outcome: string;
  sequence: string[];
  portfolio: string[];
  interview: string[];
};

export const roleRoadmaps: RoleRoadmap[] = [
  {
    id: "dsa",
    title: "DSA & Coding Interviews",
    outcome: "Solve coding problems by recognizing patterns, proving correctness, and explaining trade-offs clearly.",
    sequence: [
      "Programming, complexity analysis and mathematical foundations",
      "Arrays, strings, hashing, linked lists, stacks and queues",
      "Recursion, sorting, binary search and two-pointer patterns",
      "Trees, heaps, tries, graphs and graph traversal",
      "Greedy methods, backtracking and dynamic programming",
      "Advanced data structures, bit manipulation and range queries",
      "Timed practice, mock interviews and company-style problem sets",
    ],
    portfolio: [
      "Visual algorithm explorer",
      "Tested data-structure library",
      "Problem-pattern notebook",
      "Timed interview practice dashboard",
    ],
    interview: ["Complexity", "Core patterns", "Trees & graphs", "Dynamic programming", "Live coding", "Communication"],
  },
  {
    id: "frontend",
    title: "Frontend Developer",
    outcome: "Build fast, accessible, tested websites with React or Angular.",
    sequence: [
      "Computer, terminal, Git and web foundations",
      "Semantic HTML, CSS, responsive design and accessibility",
      "JavaScript, browser APIs and asynchronous systems",
      "TypeScript and frontend engineering foundation",
      "React or Angular specialization",
      "Testing, security, performance and frontend architecture",
      "Deployment, monitoring and frontend system design",
    ],
    portfolio: [
      "Responsive product page",
      "Accessible data application",
      "Framework SaaS dashboard",
      "Production frontend capstone",
    ],
    interview: ["JavaScript", "UI coding", "Framework", "Frontend system design", "Behavioral"],
  },
  {
    id: "fullstack",
    title: "Full-Stack Developer",
    outcome: "Build and run a complete product, from the website and API to data and deployment.",
    sequence: [
      "Complete frontend foundation and one framework",
      "Node.js, HTTP, API design and authentication",
      "SQL, PostgreSQL, data modeling and transactions",
      "Testing across unit, integration and end-to-end boundaries",
      "Caching, queues, observability and distributed systems",
      "Containers, CI/CD, cloud and incident response",
      "System design, portfolio and product-company interviews",
    ],
    portfolio: [
      "Typed REST API",
      "Transactional full-stack product",
      "Multi-tenant SaaS",
      "Observable production capstone",
    ],
    interview: ["DSA", "Backend", "SQL", "System design", "Project deep dive", "Behavioral"],
  },
  {
    id: "ai",
    title: "AI Engineer",
    outcome: "Build AI products with checked answers, reliable data, useful search, and safe operation.",
    sequence: [
      "Python, data structures, SQL, statistics and linear algebra",
      "Data analysis, pipelines and classical machine learning",
      "Deep learning, PyTorch and transformer foundations",
      "LLM APIs, prompting, structured output and tool use",
      "Embeddings, retrieval, reranking, RAG and evaluation",
      "Agents, safety, observability, latency and cost control",
      "Full-stack AI delivery, MLOps and AI system design",
    ],
    portfolio: [
      "Reproducible ML pipeline",
      "Evaluated RAG assistant",
      "Permission-aware research agent",
      "Production AI capstone with evals",
    ],
    interview: ["Python", "ML theory", "Model evaluation", "AI system design", "Project defense", "Behavioral"],
  },
];
