export type CurriculumModule = { id: string; title: string; topics: string[] };
export type CurriculumPhase = {
  id: string;
  order: number;
  title: string;
  description: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  modules: CurriculumModule[];
  lessonIds: string[];
};

const module = (
  id: string,
  title: string,
  topics: string[],
): CurriculumModule => ({ id, title, topics });

export const curriculumPhases: CurriculumPhase[] = [
  {
    id: "orientation",
    order: 0,
    title: "Orientation & Developer Setup",
    description:
      "Start at zero: understand computers, the web, tools, terminals, Git, npm, debugging, and the developer mindset.",
    duration: "2 weeks",
    difficulty: "Beginner",
    lessonIds: ["day-1-computers", "day-2-web"],
    modules: [
      module("computer-basics", "Computer & Software Basics", [
        "How computers execute instructions",
        "Hardware, memory and storage",
        "Programs and algorithms",
        "Operating systems and files",
      ]),
      module("web-basics", "Internet & Web Basics", [
        "How the web works",
        "Client and server",
        "DNS, URLs and HTTP",
        "Browsers and developer tools",
      ]),
      module("developer-setup", "Developer Setup", [
        "Terminal and file system",
        "VS Code and extensions",
        "Git and GitHub",
        "npm and package management",
        "Debugging mindset",
      ]),
    ],
  },
  {
    id: "web",
    order: 1,
    title: "Web Fundamentals",
    description:
      "Build semantic, accessible, responsive websites with HTML and modern CSS.",
    duration: "4 weeks",
    difficulty: "Beginner",
    lessonIds: ["day-3-html", "day-4-semantic-html", "day-5-css"],
    modules: [
      module("html", "HTML", [
        "HTML document structure",
        "Text, links and images",
        "Lists and tables",
        "Forms and validation",
        "Semantic and accessible HTML",
        "Metadata and SEO",
      ]),
      module("css", "CSS", [
        "CSS foundations and the box model",
        "Cascade and specificity",
        "Typography, colors and units",
        "Display and positioning",
        "Flexbox",
        "Grid",
        "Responsive design",
        "Transitions and animation",
        "CSS architecture",
      ]),
      module("web-projects", "Web Projects", [
        "Personal page",
        "Landing page",
        "Responsive portfolio",
        "Business website",
      ]),
    ],
  },
  {
    id: "javascript",
    order: 2,
    title: "JavaScript",
    description:
      "Progress from language fundamentals through DOM applications, asynchronous systems, architecture, testing, and security.",
    duration: "7 weeks",
    difficulty: "Beginner",
    lessonIds: ["day-6-javascript"],
    modules: [
      module("js-foundations", "Language Foundations", [
        "Variables, values, and functions",
        "Types and conversion",
        "Operators and expressions",
        "Conditions and switch",
        "Loops",
        "Scope and hoisting",
      ]),
      module("js-data", "Data & Functions", [
        "Arrays",
        "Objects",
        "Destructuring",
        "Spread and rest",
        "Map and Set",
        "Higher-order functions",
        "Closures",
        "Recursion",
      ]),
      module("js-browser", "Browser JavaScript", [
        "DOM",
        "Events",
        "Forms and validation",
        "Modules",
        "Web storage",
        "Accessibility with JavaScript",
      ]),
      module("js-async", "Asynchronous JavaScript", [
        "Promises",
        "Async and await",
        "Fetch and HTTP APIs",
        "Event loop",
        "Call stack",
        "Cancellation and errors",
      ]),
      module("js-advanced", "Advanced JavaScript", [
        "Prototypes and classes",
        "OOP and functional programming",
        "Design patterns",
        "Memory and performance",
        "Testing",
        "Security basics",
      ]),
    ],
  },
  {
    id: "typescript",
    order: 3,
    title: "TypeScript Systems",
    description:
      "Model reliable applications and SDKs with expressive, maintainable types.",
    duration: "4 weeks",
    difficulty: "Intermediate",
    lessonIds: [],
    modules: [
      module("ts-foundations", "TypeScript Foundations", [
        "Setup and compiler",
        "Annotations and inference",
        "Primitive types",
        "Arrays, tuples and enums",
        "Objects and functions",
      ]),
      module("ts-type-system", "Type System", [
        "Interfaces and aliases",
        "Unions and intersections",
        "Literal types",
        "Narrowing",
        "unknown, never and void",
      ]),
      module("ts-advanced", "Advanced Types", [
        "Generics and constraints",
        "keyof and typeof",
        "Indexed access",
        "Conditional types",
        "Mapped and utility types",
      ]),
      module("ts-production", "Production TypeScript", [
        "API typing",
        "React typing",
        "Library typing",
        "SDK design",
        "Architecture and testing",
      ]),
    ],
  },
  {
    id: "frontend",
    order: 4,
    title: "Frontend Engineering",
    description:
      "Build production React applications with accessible UX, state, performance, architecture, and tests.",
    duration: "8 weeks",
    difficulty: "Intermediate",
    lessonIds: [],
    modules: [
      module("react-core", "React Fundamentals", [
        "Vite and build tools",
        "JSX and components",
        "Props and state",
        "Events, lists and forms",
        "Conditional rendering",
      ]),
      module("react-hooks", "Hooks", [
        "useState",
        "useEffect",
        "useRef",
        "useMemo and useCallback",
        "Context",
        "Custom hooks",
      ]),
      module("react-production", "Production React", [
        "Routing",
        "API integration",
        "State management",
        "Error boundaries and Suspense",
        "Performance",
        "Testing",
        "Accessibility and security",
      ]),
      module("frontend-architecture", "Frontend Architecture", [
        "Component design",
        "Feature boundaries",
        "Design systems",
        "Observability",
        "Production deployment",
      ]),
    ],
  },
  {
    id: "backend",
    order: 5,
    title: "Backend & Data",
    description:
      "Design secure APIs, relational data, caching, queues, and real-time services.",
    duration: "8 weeks",
    difficulty: "Intermediate",
    lessonIds: [],
    modules: [
      module("node", "Node.js", [
        "Runtime and modules",
        "File system",
        "Events and streams",
        "HTTP",
        "npm packages",
      ]),
      module("apis", "APIs with Express", [
        "REST design",
        "Routing and controllers",
        "Services and middleware",
        "Validation and errors",
        "Testing and logging",
      ]),
      module("security", "Identity & Security", [
        "Authentication and authorization",
        "Cookies and sessions",
        "JWT concepts",
        "OAuth concepts",
        "Rate limiting and secure defaults",
      ]),
      module("sql", "SQL & PostgreSQL", [
        "Tables and data types",
        "CRUD and filtering",
        "JOINs and aggregation",
        "Constraints and transactions",
        "Normalization and schema design",
        "Indexes and query optimization",
      ]),
      module("distributed-backend", "Scalable Backend", [
        "Redis and caching",
        "Queues and background jobs",
        "WebSockets",
        "Real-time systems",
      ]),
    ],
  },
  {
    id: "system-design",
    order: 6,
    title: "System Design",
    description:
      "Reason about scale, reliability, data, communication, security, and operational trade-offs.",
    duration: "6 weeks",
    difficulty: "Advanced",
    lessonIds: [],
    modules: [
      module("design-foundations", "Foundations", [
        "Networking and HTTP",
        "Latency and throughput",
        "Availability and reliability",
        "Vertical and horizontal scaling",
      ]),
      module("design-components", "System Components", [
        "Load balancers and CDNs",
        "Caching",
        "Replication and partitioning",
        "Queues and Pub/Sub",
        "API gateways and rate limiting",
      ]),
      module("design-architecture", "Architecture", [
        "Monoliths and microservices",
        "Event-driven systems",
        "Consistency and CAP",
        "Observability",
        "Fault tolerance and recovery",
        "LLD and HLD",
      ]),
      module("design-exercises", "Design Exercises", [
        "URL shortener",
        "Chat system",
        "File storage",
        "Social feed",
        "Search system",
        "AI chat application",
      ]),
    ],
  },
  {
    id: "python",
    order: 7,
    title: "Python for AI",
    description:
      "Learn production Python and the numerical/data tools required for AI engineering.",
    duration: "5 weeks",
    difficulty: "Intermediate",
    lessonIds: [],
    modules: [
      module("python-core", "Python Foundations", [
        "Syntax and types",
        "Conditions and loops",
        "Functions",
        "Collections",
        "Modules and packages",
      ]),
      module("python-production", "Production Python", [
        "Virtual environments",
        "OOP",
        "Exceptions and files",
        "JSON and APIs",
        "Type hints and testing",
      ]),
      module("python-data", "Data Toolkit", [
        "NumPy",
        "Pandas",
        "Matplotlib",
        "Data preprocessing",
      ]),
    ],
  },
  {
    id: "machine-learning",
    order: 8,
    title: "Machine Learning",
    description:
      "Train, validate, evaluate, and improve classical machine-learning systems using real datasets.",
    duration: "6 weeks",
    difficulty: "Advanced",
    lessonIds: [],
    modules: [
      module("ml-foundations", "ML Foundations", [
        "AI vs ML vs deep learning",
        "Features and labels",
        "Training, validation and testing",
        "Supervised and unsupervised learning",
      ]),
      module("ml-models", "Models", [
        "Regression",
        "Classification",
        "Clustering",
        "Scikit-learn workflows",
      ]),
      module("ml-quality", "Model Quality", [
        "Metrics",
        "Overfitting and underfitting",
        "Bias and variance",
        "Cross-validation",
        "Feature engineering and hyperparameters",
      ]),
    ],
  },
  {
    id: "deep-learning",
    order: 9,
    title: "Deep Learning",
    description:
      "Understand neural networks, optimization, PyTorch training, attention, and transformer foundations.",
    duration: "5 weeks",
    difficulty: "Advanced",
    lessonIds: [],
    modules: [
      module("neural-networks", "Neural Networks", [
        "Perceptrons",
        "Activation functions",
        "Loss functions",
        "Gradient descent",
        "Backpropagation and optimizers",
      ]),
      module("pytorch", "PyTorch", [
        "Tensors",
        "Models and modules",
        "Datasets",
        "Training loops",
        "Evaluation",
      ]),
      module("dl-architectures", "Architectures", [
        "CNN concepts",
        "RNN concepts",
        "Attention",
        "Transformers",
      ]),
    ],
  },
  {
    id: "llm",
    order: 10,
    title: "Generative AI & LLM Engineering",
    description:
      "Build dependable model-powered features with structured output, tools, evaluation, safety, cost, and latency awareness.",
    duration: "6 weeks",
    difficulty: "Advanced",
    lessonIds: [],
    modules: [
      module("llm-foundations", "LLM Foundations", [
        "Tokens and tokenization",
        "Embeddings",
        "Transformer architecture",
        "Attention and context windows",
        "Sampling concepts",
      ]),
      module("llm-apps", "LLM Applications", [
        "Prompting and system instructions",
        "Structured outputs",
        "Tool calling",
        "Streaming",
        "Model APIs",
      ]),
      module("llm-production", "Production LLMs", [
        "Evaluation",
        "Safety",
        "Caching",
        "Cost and latency",
        "Observability",
      ]),
    ],
  },
  {
    id: "rag",
    order: 11,
    title: "Retrieval-Augmented Generation",
    description:
      "Build grounded knowledge applications with ingestion, retrieval, citations, and rigorous evaluation.",
    duration: "5 weeks",
    difficulty: "Advanced",
    lessonIds: [],
    modules: [
      module("rag-ingestion", "Ingestion", [
        "RAG fundamentals",
        "Document parsing",
        "Chunking",
        "Embeddings and metadata",
      ]),
      module("rag-retrieval", "Retrieval", [
        "Vector databases",
        "Similarity search",
        "Filtering",
        "Hybrid search",
        "Reranking",
      ]),
      module("rag-generation", "Grounded Generation", [
        "Prompt construction",
        "Citations",
        "Hallucination reduction",
        "RAG evaluation",
        "Production RAG",
      ]),
    ],
  },
  {
    id: "agents",
    order: 12,
    title: "AI Agents",
    description:
      "Create controlled tool-using workflows with state, approvals, guardrails, retries, and evaluation.",
    duration: "5 weeks",
    difficulty: "Advanced",
    lessonIds: [],
    modules: [
      module("agent-core", "Agent Foundations", [
        "Agents and tools",
        "Function calling",
        "Planning",
        "Memory concepts",
        "State and workflows",
      ]),
      module("agent-reliability", "Reliable Agents", [
        "Retries",
        "Human approval",
        "Guardrails",
        "Observability",
        "Agent evaluation",
        "Security",
      ]),
      module("agent-systems", "Agent Systems", [
        "Multi-agent concepts",
        "Research agent",
        "Coding assistant",
        "Support and workflow agents",
      ]),
    ],
  },
  {
    id: "full-stack-ai",
    order: 13,
    title: "Full-Stack AI Engineering",
    description:
      "Combine React, TypeScript, Node, PostgreSQL, Python, RAG, and agents in production-style products.",
    duration: "6 weeks",
    difficulty: "Advanced",
    lessonIds: [],
    modules: [
      module("ai-integration", "AI Product Integration", [
        "Frontend streaming UX",
        "Typed AI APIs",
        "Authentication and ownership",
        "Data and vector architecture",
        "Async AI jobs",
      ]),
      module("ai-saas", "Production AI SaaS", [
        "Evaluation pipelines",
        "Feedback systems",
        "Cost controls",
        "Safety and permissions",
        "Monitoring and incident response",
      ]),
      module("ai-capstone", "Capstone", [
        "Architecture",
        "Milestones",
        "Testing",
        "Deployment",
        "Portfolio case study",
      ]),
    ],
  },
  {
    id: "devops",
    order: 14,
    title: "DevOps & Deployment",
    description:
      "Ship and operate applications using Linux, CI/CD, containers, cloud services, security, and observability.",
    duration: "4 weeks",
    difficulty: "Advanced",
    lessonIds: [],
    modules: [
      module("delivery", "Software Delivery", [
        "Linux fundamentals",
        "Environment variables and secrets",
        "Git workflows",
        "CI/CD",
        "Docker and containers",
      ]),
      module("deployment", "Deployment", [
        "Cloud concepts",
        "Frontend and backend deployment",
        "Database deployment",
        "HTTPS and domains",
      ]),
      module("operations", "Operations", [
        "Logging and monitoring",
        "Performance",
        "Scaling",
        "Backup and recovery",
      ]),
    ],
  },
  {
    id: "career",
    order: 15,
    title: "Interview & Job Preparation",
    description:
      "Turn technical mastery and project evidence into strong interviews, portfolio stories, and applications.",
    duration: "4 weeks",
    difficulty: "Advanced",
    lessonIds: [],
    modules: [
      module("technical-interviews", "Technical Interviews", [
        "JavaScript and TypeScript",
        "React",
        "Node and SQL",
        "System design",
        "Python and ML",
        "LLMs, RAG and agents",
      ]),
      module("career-assets", "Career Assets", [
        "Resume",
        "GitHub profile",
        "Portfolio case studies",
        "Project deep dives",
      ]),
      module("job-process", "Job Process", [
        "Behavioral interviews",
        "Mock interviews",
        "Applications",
        "Negotiation and growth plan",
      ]),
    ],
  },
];

export const totalCatalogTopics = curriculumPhases.reduce(
  (sum, phase) =>
    sum + phase.modules.reduce((count, item) => count + item.topics.length, 0),
  0,
);
