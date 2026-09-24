import {
  normalizeLearningResource,
  type LearningResource,
  type LearningResourceSource,
} from "./resourceTypes";

type TopicResource = LearningResource;

const resource = (item: LearningResourceSource): TopicResource =>
  normalizeLearningResource(item);

const phaseResources: Record<string, TopicResource[]> = {
  orientation: [
    resource({ id: "github-skills", technology: "Git & GitHub", title: "GitHub Skills", provider: "GitHub", url: "https://skills.github.com/", kind: "Guided course", level: "Start here", description: "Interactive repository-based courses for commits, pull requests, reviews, conflicts, Pages, and Actions.", official: true, free: true }),
    resource({ id: "pro-git", technology: "Git & GitHub", title: "Pro Git", provider: "Git", url: "https://git-scm.com/book/en/v2", kind: "Official documentation", level: "Foundation", description: "The complete Git mental model, daily commands, branching, distributed workflows, debugging, and internals.", official: true, free: true }),
    resource({ id: "mdn-getting-started", technology: "Web Foundations", title: "Getting started with the web", provider: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started", kind: "Guided course", level: "Start here", description: "A gentle setup and first-website path for learners who have never written code.", official: true, free: true }),
  ],
  web: [
    resource({ id: "mdn-learn", technology: "HTML & CSS", title: "Learn web development", provider: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development", kind: "Guided course", level: "Foundation", description: "Standards-based HTML, CSS, JavaScript, accessibility, responsive design, tests, and integrated challenges.", official: true, free: true }),
    resource({ id: "webdev-learn", technology: "HTML & CSS", title: "Learn web development", provider: "web.dev", url: "https://web.dev/learn/", kind: "Guided course", level: "Foundation", description: "Focused courses for HTML, CSS, accessibility, responsive design, performance, forms, images, and testing.", official: true, free: true }),
    resource({ id: "wai-tutorials", technology: "Accessibility", title: "Web accessibility tutorials", provider: "W3C WAI", url: "https://www.w3.org/WAI/tutorials/", kind: "Official documentation", level: "Intermediate", description: "Practical accessible patterns for page structure, menus, images, tables, forms, and carousels.", official: true, free: true }),
  ],
  javascript: [
    resource({ id: "mdn-js-guide", technology: "JavaScript", title: "JavaScript Guide", provider: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", kind: "Official documentation", level: "Foundation", description: "A standards-oriented guide from grammar and control flow through objects, promises, modules, and advanced language features.", official: true, free: true }),
    resource({ id: "javascript-info", technology: "JavaScript", title: "The Modern JavaScript Tutorial", provider: "JavaScript.info", url: "https://javascript.info/", kind: "Guided course", level: "Foundation", description: "A structured zero-to-advanced language and browser tutorial with tasks after major concepts.", free: true }),
    resource({ id: "exercism-js", technology: "JavaScript", title: "JavaScript Track", provider: "Exercism", url: "https://exercism.org/tracks/javascript", kind: "Practice", level: "Intermediate", description: "Test-driven concept and practice exercises with automated tests, hints, and optional mentoring.", free: true }),
    resource({ id: "freecodecamp-js-video", technology: "JavaScript", title: "Learn JavaScript — Full Course for Beginners", provider: "freeCodeCamp.org", url: "https://www.youtube.com/watch?v=PkZNo7MFNFg", kind: "Video tutorial", level: "Foundation", description: "A complete beginner JavaScript course with runnable examples and chapter navigation.", duration: "3h 27m", youtubeVideoId: "PkZNo7MFNFg", free: true }),
  ],
  typescript: [
    resource({ id: "ts-handbook", technology: "TypeScript", title: "TypeScript Handbook", provider: "TypeScript", url: "https://www.typescriptlang.org/docs/handbook/", kind: "Official documentation", level: "Foundation", description: "The canonical path through everyday types, narrowing, functions, object types, generics, classes, and modules.", official: true, free: true }),
    resource({ id: "ts-playground", technology: "TypeScript", title: "TypeScript Playground", provider: "TypeScript", url: "https://www.typescriptlang.org/play", kind: "Practice", level: "Foundation", description: "Experiment with compiler behavior, type inference, emitted JavaScript, and focused language examples.", official: true, free: true }),
    resource({ id: "exercism-ts", technology: "TypeScript", title: "TypeScript Track", provider: "Exercism", url: "https://exercism.org/tracks/typescript", kind: "Practice", level: "Intermediate", description: "Test-driven TypeScript problems for moving from syntax familiarity to idiomatic typed solutions.", free: true }),
  ],
  backend: [
    resource({ id: "node-learn", technology: "Backend & APIs", title: "Learn Node.js", provider: "Node.js", url: "https://nodejs.org/learn", kind: "Official documentation", level: "Foundation", description: "Official coverage of Node fundamentals, HTTP, asynchronous work, streams, diagnostics, testing, performance, and security.", official: true, free: true }),
    resource({ id: "postgres-tutorial", technology: "Databases & SQL", title: "PostgreSQL Tutorial", provider: "PostgreSQL", url: "https://www.postgresql.org/docs/current/tutorial.html", kind: "Official documentation", level: "Foundation", description: "Hands-on relational concepts and SQL from tables and queries through joins, aggregates, transactions, and window functions.", official: true, free: true }),
    resource({ id: "owasp-api", technology: "Backend & APIs", title: "API Security Top 10", provider: "OWASP", url: "https://owasp.org/API-Security/", kind: "Reference", level: "Advanced", description: "A practical threat model for authorization, authentication, resource consumption, misconfiguration, and unsafe API use.", official: true, free: true }),
  ],
  dsa: [
    resource({ id: "mit-algorithms", technology: "Data Structures & Algorithms", title: "Introduction to Algorithms", provider: "MIT OpenCourseWare", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/", kind: "Guided course", level: "Intermediate", description: "University-level lectures, notes, assignments, and exams covering algorithmic reasoning and core structures.", official: true, free: true }),
    resource({ id: "leetcode-explore", technology: "Data Structures & Algorithms", title: "Explore and Study Plans", provider: "LeetCode", url: "https://leetcode.com/explore/learn/", kind: "Practice", level: "Intermediate", description: "Pattern-oriented coding practice and interview study plans across major data structures and algorithms.", free: true }),
    resource({ id: "visualgo", technology: "Data Structures & Algorithms", title: "VisuAlgo", provider: "National University of Singapore", url: "https://visualgo.net/en", kind: "Reference", level: "Foundation", description: "Interactive visualizations for data structures and algorithms with execution steps and quizzes.", free: true }),
  ],
  "system-design": [
    resource({ id: "google-sre", technology: "System Design", title: "Site Reliability Engineering", provider: "Google", url: "https://sre.google/sre-book/table-of-contents/", kind: "Reference", level: "Advanced", description: "Production principles for reliability, SLOs, monitoring, incident response, capacity, and change management.", official: true, free: true }),
    resource({ id: "aws-well-architected", technology: "System Design", title: "AWS Well-Architected Framework", provider: "AWS", url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html", kind: "Official documentation", level: "Advanced", description: "A structured architecture review across operational excellence, security, reliability, performance, cost, and sustainability.", official: true, free: true }),
    resource({ id: "azure-architecture", technology: "System Design", title: "Azure Architecture Center", provider: "Microsoft", url: "https://learn.microsoft.com/en-us/azure/architecture/", kind: "Reference", level: "Professional", description: "Cloud design patterns, reference architectures, technology choices, and workload-quality guidance.", official: true, free: true }),
  ],
  python: [
    resource({ id: "python-tutorial", technology: "Python", title: "The Python Tutorial", provider: "Python", url: "https://docs.python.org/3/tutorial/", kind: "Official documentation", level: "Foundation", description: "The canonical introduction to Python syntax, collections, control flow, functions, modules, errors, classes, and environments.", official: true, free: true }),
    resource({ id: "python-library", technology: "Python", title: "Python Standard Library", provider: "Python", url: "https://docs.python.org/3/library/", kind: "Official documentation", level: "Intermediate", description: "The primary reference for built-in types, modules, concurrency, files, networking, testing, and runtime services.", official: true, free: true }),
    resource({ id: "exercism-python", technology: "Python", title: "Python Track", provider: "Exercism", url: "https://exercism.org/tracks/python", kind: "Practice", level: "Foundation", description: "Test-driven exercises, concept progression, automated feedback, and optional human mentoring.", free: true }),
  ],
  "machine-learning": [
    resource({ id: "google-mlcc", technology: "Machine Learning", title: "Machine Learning Crash Course", provider: "Google", url: "https://developers.google.com/machine-learning/crash-course", kind: "Guided course", level: "Foundation", description: "Interactive explanations, visualizations, programming exercises, and quizzes from regression through production ML and fairness.", official: true, free: true }),
    resource({ id: "sklearn-guide", technology: "Machine Learning", title: "scikit-learn User Guide", provider: "scikit-learn", url: "https://scikit-learn.org/stable/user_guide.html", kind: "Official documentation", level: "Intermediate", description: "Models, preprocessing, evaluation, pipelines, model selection, inspection, scaling, and common production pitfalls.", official: true, free: true }),
    resource({ id: "kaggle-learn", technology: "Machine Learning", title: "Kaggle Learn", provider: "Kaggle", url: "https://www.kaggle.com/learn", kind: "Practice", level: "Foundation", description: "Short notebook-based courses that apply Python, pandas, visualization, feature engineering, and ML to datasets.", free: true }),
  ],
  "deep-learning": [
    resource({ id: "pytorch-tutorials", technology: "Deep Learning", title: "PyTorch Tutorials", provider: "PyTorch", url: "https://docs.pytorch.org/tutorials/", kind: "Official documentation", level: "Intermediate", description: "A full workflow from tensors and neural networks through profiling, distributed training, and production serving.", official: true, free: true }),
    resource({ id: "tensorflow-tutorials", technology: "Deep Learning", title: "TensorFlow Tutorials", provider: "TensorFlow", url: "https://www.tensorflow.org/tutorials", kind: "Official documentation", level: "Intermediate", description: "Runnable notebook tutorials for data, models, vision, text, structured data, customization, and distributed training.", official: true, free: true }),
    resource({ id: "fastai-course", technology: "Deep Learning", title: "Practical Deep Learning", provider: "fast.ai", url: "https://course.fast.ai/", kind: "Guided course", level: "Intermediate", description: "Project-first deep learning across vision, NLP, tabular models, deployment, and model internals.", free: true }),
  ],
  llm: [
    resource({ id: "hf-llm-course", technology: "LLMs & Generative AI", title: "LLM Course", provider: "Hugging Face", url: "https://huggingface.co/learn/llm-course/chapter1/1", kind: "Guided course", level: "Intermediate", description: "Transformers, tokenizers, datasets, fine-tuning, sharing models, demos, and advanced NLP/LLM workflows.", official: true, free: true }),
    resource({ id: "openai-docs", technology: "LLMs & Generative AI", title: "OpenAI API documentation", provider: "OpenAI", url: "https://developers.openai.com/api/docs", kind: "Official documentation", level: "Intermediate", description: "Current API concepts, models, structured outputs, tools, agents, retrieval, safety, production, and evaluation guidance.", official: true, free: true }),
    resource({ id: "transformers-docs", technology: "LLMs & Generative AI", title: "Transformers documentation", provider: "Hugging Face", url: "https://huggingface.co/docs/transformers/index", kind: "Official documentation", level: "Advanced", description: "Model loading, inference, training, generation, task guides, optimization, and architecture reference.", official: true, free: true }),
  ],
  rag: [
    resource({ id: "openai-retrieval", technology: "RAG", title: "Retrieval guide", provider: "OpenAI", url: "https://developers.openai.com/api/docs/guides/retrieval", kind: "Official documentation", level: "Intermediate", description: "Semantic search, vector stores, file ingestion, attribute filtering, ranking, and grounded response patterns.", official: true, free: true }),
    resource({ id: "llamaindex-rag", technology: "RAG", title: "RAG from scratch", provider: "LlamaIndex", url: "https://docs.llamaindex.ai/en/stable/understanding/rag/", kind: "Official documentation", level: "Intermediate", description: "A component-level guide to loading, indexing, storing, querying, and evaluating retrieval systems.", official: true, free: true }),
    resource({ id: "openai-evals", technology: "RAG", title: "Evaluation best practices", provider: "OpenAI", url: "https://developers.openai.com/api/docs/guides/evaluation-best-practices", kind: "Official documentation", level: "Advanced", description: "Build task-specific evals, combine automated and human judgment, and continuously evaluate production changes.", official: true, free: true }),
  ],
  agents: [
    resource({ id: "hf-agents", technology: "AI Agents", title: "AI Agents Course", provider: "Hugging Face", url: "https://huggingface.co/learn/agents-course/unit0/introduction", kind: "Guided course", level: "Intermediate", description: "Agent fundamentals, tools, frameworks, agentic RAG, observability, evaluation, assignments, and a benchmarked final project.", official: true, free: true }),
    resource({ id: "openai-agents", technology: "AI Agents", title: "Agents guide", provider: "OpenAI", url: "https://developers.openai.com/api/docs/guides/agents", kind: "Official documentation", level: "Advanced", description: "Build tool-using agent workflows with explicit orchestration, safety, tracing, and production controls.", official: true, free: true }),
    resource({ id: "langgraph-tutorials", technology: "AI Agents", title: "LangGraph tutorials", provider: "LangChain", url: "https://docs.langchain.com/oss/python/langgraph/tutorials", kind: "Official documentation", level: "Advanced", description: "Hands-on stateful agent workflows, persistence, human review, memory, and multi-agent patterns.", official: true, free: true }),
  ],
  "full-stack-ai": [
    resource({ id: "openai-production", technology: "Full-Stack AI", title: "Production best practices", provider: "OpenAI", url: "https://developers.openai.com/api/docs/guides/production-best-practices", kind: "Official documentation", level: "Professional", description: "Production planning for reliability, security, scaling, latency, cost, and operational ownership.", official: true, free: true }),
    resource({ id: "github-actions", technology: "Full-Stack AI", title: "GitHub Actions documentation", provider: "GitHub", url: "https://docs.github.com/en/actions", kind: "Official documentation", level: "Intermediate", description: "Automate builds, tests, security checks, deployment, release workflows, and repository operations.", official: true, free: true }),
    resource({ id: "fullstack-open", technology: "Full-Stack AI", title: "Full Stack Open", provider: "University of Helsinki", url: "https://fullstackopen.com/en/", kind: "Guided course", level: "Intermediate", description: "Modern full-stack development through React, Node, testing, GraphQL, TypeScript, CI/CD, containers, and relational databases.", official: true, free: true }),
    resource({ id: "cloudflare-workers-video", technology: "Full-Stack AI", title: "Learn Cloudflare Workers 101", provider: "Cloudflare Developers", url: "https://www.youtube.com/watch?v=H7Qe96fqg1M", kind: "Video tutorial", level: "Foundation", description: "An official course covering local Worker development, bindings, deployment, and a first Workers AI application.", duration: "59m", youtubeVideoId: "H7Qe96fqg1M", official: true, free: true }),
    resource({ id: "cloudflare-workers-ai-video", technology: "Full-Stack AI", title: "Build a Workers AI application", provider: "Cloudflare Developers", url: "https://www.youtube.com/watch?v=cK_leoJsBWY", kind: "Video tutorial", level: "Intermediate", description: "An official walkthrough for connecting a Cloudflare Worker to Workers AI inference.", duration: "Video", youtubeVideoId: "cK_leoJsBWY", official: true, free: true }),
  ],
  devops: [
    resource({ id: "docker-start", technology: "DevOps & Cloud", title: "Docker Get Started", provider: "Docker", url: "https://docs.docker.com/get-started/", kind: "Official documentation", level: "Foundation", description: "Build, run, compose, publish, and reason about reproducible containerized applications.", official: true, free: true }),
    resource({ id: "kubernetes-basics", technology: "DevOps & Cloud", title: "Kubernetes Basics", provider: "Kubernetes", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/", kind: "Guided course", level: "Intermediate", description: "Interactive modules for deploy, explore, expose, scale, update, and debug operations on a cluster.", official: true, free: true }),
    resource({ id: "github-actions-devops", technology: "DevOps & Cloud", title: "GitHub Actions", provider: "GitHub", url: "https://docs.github.com/en/actions", kind: "Official documentation", level: "Intermediate", description: "CI/CD workflows, runners, deployment environments, security hardening, and reusable automation.", official: true, free: true }),
  ],
  career: [
    resource({ id: "github-resume", technology: "Career & Interviews", title: "Use your GitHub profile to enhance your resume", provider: "GitHub", url: "https://docs.github.com/en/account-and-profile/tutorials/using-your-github-profile-to-enhance-your-resume", kind: "Guided course", level: "Professional", description: "Official guidance for presenting skills, pinned work, live projects, profile details, and repository quality to employers.", official: true, free: true }),
    resource({ id: "greatfrontend", technology: "Career & Interviews", title: "Front-end interview preparation", provider: "GreatFrontEnd", url: "https://www.greatfrontend.com/interviews/get-started", kind: "Interview", level: "Professional", description: "Structured JavaScript, UI coding, React, Angular, DSA, quiz, and frontend system-design interview practice.", free: true }),
    resource({ id: "google-interview-warmup", technology: "Career & Interviews", title: "Interview Warmup", provider: "Google", url: "https://grow.google/certificates/interview-warmup/", kind: "Interview", level: "Professional", description: "Private spoken-answer practice with transcription and insight prompts for improving interview communication.", official: true, free: true }),
  ],
};

const frontendResources: Record<"common" | "react" | "angular", TopicResource[]> = {
  common: [
    phaseResources.web[0],
    resource({ id: "testing-library", technology: "Frontend Engineering", title: "Testing Library", provider: "Testing Library", url: "https://testing-library.com/docs/", kind: "Official documentation", level: "Intermediate", description: "Test user-visible behavior across DOM, React, Angular, and other UI environments.", official: true, free: true }),
    resource({ id: "owasp-top-ten", technology: "Frontend Engineering", title: "OWASP Top 10", provider: "OWASP", url: "https://owasp.org/projects/top-ten", kind: "Reference", level: "Advanced", description: "A maintained awareness standard for the most consequential web application security risks.", official: true, free: true }),
  ],
  react: [
    resource({ id: "react-learn", technology: "React", title: "React Learn", provider: "React", url: "https://react.dev/learn", kind: "Official documentation", level: "Foundation", description: "The official path for components, state, reducers, context, refs, effects, custom hooks, and escape hatches.", official: true, free: true }),
    resource({ id: "react-challenges", technology: "React", title: "React challenges", provider: "React", url: "https://react.dev/learn/adding-interactivity", kind: "Practice", level: "Intermediate", description: "Embedded challenges that build state, event, rendering, and update reasoning inside the official guide.", official: true, free: true }),
    resource({ id: "next-app", technology: "React", title: "Next.js App Router", provider: "Next.js", url: "https://nextjs.org/docs/app", kind: "Official documentation", level: "Advanced", description: "Production React routing, server and client components, data, caching, rendering, streaming, security, and deployment.", official: true, free: true }),
  ],
  angular: [
    resource({ id: "angular-tutorials", technology: "Angular", title: "Angular Tutorials", provider: "Angular", url: "https://angular.dev/tutorials", kind: "Guided course", level: "Foundation", description: "Official interactive tutorials for core Angular concepts and scalable application development.", official: true, free: true }),
    resource({ id: "angular-guide", technology: "Angular", title: "Angular documentation", provider: "Angular", url: "https://angular.dev/overview", kind: "Official documentation", level: "Intermediate", description: "Components, templates, signals, dependency injection, routing, forms, HTTP, SSR, testing, security, and performance.", official: true, free: true }),
    resource({ id: "rxjs-guide", technology: "Angular", title: "RxJS Guide", provider: "RxJS", url: "https://rxjs.dev/guide/overview", kind: "Official documentation", level: "Advanced", description: "Observable composition, operators, subjects, schedulers, testing, error behavior, and reactive design.", official: true, free: true }),
  ],
};

const topicResources: Record<string, TopicResource[]> = {
  "javascript:event loop": [
    resource({ id: "jsconf-event-loop-video", technology: "JavaScript", title: "In The Loop", provider: "JSConf / Jake Archibald", url: "https://www.youtube.com/watch?v=cCOL7MC4Pl0", kind: "Video tutorial", level: "Intermediate", description: "A visual deep dive into tasks, microtasks, rendering, and the browser event loop.", duration: "35m", youtubeVideoId: "cCOL7MC4Pl0", free: true }),
    phaseResources.javascript[0],
    phaseResources.javascript[1],
  ],
  "orientation:npm and package management": [
    resource({
      id: "npm-dependencies",
      technology: "npm",
      title: "Dependencies and development dependencies",
      provider: "npm",
      url: "https://docs.npmjs.com/specifying-dependencies-and-devdependencies-in-a-package-json-file/",
      kind: "Official documentation",
      level: "Foundation",
      description:
        "Learn where runtime and development packages belong, how npm records them, and how version requirements are installed.",
      official: true,
      free: true,
    }),
    resource({
      id: "npm-ci",
      technology: "npm",
      title: "npm ci: clean, repeatable installs",
      provider: "npm",
      url: "https://docs.npmjs.com/cli/commands/npm-ci/",
      kind: "Official documentation",
      level: "Intermediate",
      description:
        "Understand frozen installs, package-lock checks, clean node_modules behavior, and why teams use npm ci in automated builds.",
      official: true,
      free: true,
    }),
    resource({
      id: "npm-audit",
      technology: "npm",
      title: "Audit package security",
      provider: "npm",
      url: "https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities/",
      kind: "Official documentation",
      level: "Advanced",
      description:
        "Read vulnerability reports, identify the affected dependency path, and review fixes before changing a production package tree.",
      official: true,
      free: true,
    }),
  ],
};

export const getTopicResources = (
  phaseId: string,
  moduleTrack?: "common" | "react" | "angular",
  topic?: string,
) => {
  const topicKey = `${phaseId}:${topic?.trim().toLowerCase() ?? ""}`;
  if (topicResources[topicKey]) return topicResources[topicKey];
  if (phaseId === "frontend") return frontendResources[moduleTrack ?? "common"];
  return phaseResources[phaseId] ?? phaseResources.orientation;
};

export const coreResourceCatalog = Object.values(phaseResources)
  .flat()
  .concat(...Object.values(frontendResources))
  .concat(...Object.values(topicResources))
  .filter(
    (item, index, items) =>
      items.findIndex((candidate) => candidate.id === item.id) === index,
  );
