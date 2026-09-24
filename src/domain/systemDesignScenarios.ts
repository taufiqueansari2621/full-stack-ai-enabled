export type SystemDesignScenario = {
  id: string;
  title: string;
  brief: string;
  starterNodes: string[];
};

export const systemDesignComponents = [
  "Client",
  "CDN",
  "Load Balancer",
  "API",
  "Service",
  "Database",
  "Cache",
  "Queue",
  "Object Storage",
  "Search",
  "Vector Database",
  "AI Service",
] as const;

export const systemDesignScenarios: SystemDesignScenario[] = [
  {
    id: "url-shortener",
    title: "URL Shortener",
    brief: "Create short links with fast redirects, unique IDs, abuse controls, and durable analytics.",
    starterNodes: ["Client", "Load Balancer", "API", "Cache", "Database"],
  },
  {
    id: "chat",
    title: "Chat Application",
    brief: "Deliver ordered messages, online presence, offline history, and reliable fan-out.",
    starterNodes: ["Client", "Load Balancer", "Service", "Queue", "Database"],
  },
  {
    id: "notifications",
    title: "Notification Service",
    brief: "Accept events, apply preferences, retry delivery, and prevent duplicate notifications.",
    starterNodes: ["API", "Queue", "Service", "Cache", "Database"],
  },
  {
    id: "commerce",
    title: "E-commerce Platform",
    brief: "Serve a catalog, protect inventory, process orders, and tolerate payment failures.",
    starterNodes: ["Client", "CDN", "API", "Service", "Database", "Queue"],
  },
  {
    id: "video",
    title: "Video Platform",
    brief: "Upload, process, store, and globally stream video while controlling cost and access.",
    starterNodes: ["Client", "CDN", "API", "Queue", "Object Storage"],
  },
  {
    id: "search",
    title: "Search System",
    brief: "Index changing content and return relevant, low-latency results at scale.",
    starterNodes: ["Client", "API", "Queue", "Search", "Cache"],
  },
  {
    id: "rag",
    title: "AI RAG Platform",
    brief: "Ingest authorized sources, retrieve grounded context, generate answers, and evaluate quality.",
    starterNodes: ["Client", "API", "Vector Database", "AI Service", "Database"],
  },
];

export const systemDesignPrompts = [
  "scaling",
  "availability",
  "consistency",
  "security",
  "failure handling",
  "cost",
  "trade-offs",
] as const;
