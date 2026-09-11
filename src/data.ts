export type NavId = 'home' | 'learn' | 'roadmap' | 'practice' | 'projects' | 'interview' | 'knowledge' | 'reviews' | 'progress' | 'mentor'

export type RoadmapNode = {
  id: string
  title: string
  description: string
  progress: number
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  status: 'complete' | 'active' | 'locked'
  icon: string
  topics: string[]
}

export const roadmapNodes: RoadmapNode[] = [
  { id: 'foundations', title: 'Web Foundations', description: 'How the web works, Git, semantic HTML, CSS and accessible interfaces.', progress: 100, duration: '2 weeks', difficulty: 'Beginner', status: 'complete', icon: '01', topics: ['Computer science', 'Git & Linux', 'HTML', 'CSS', 'Accessibility'] },
  { id: 'javascript', title: 'JavaScript Mastery', description: 'From language fundamentals to closures, prototypes, async internals and performance.', progress: 68, duration: '3 weeks', difficulty: 'Intermediate', status: 'active', icon: '02', topics: ['Execution context', 'Closures', 'Event loop', 'Promises', 'Memory'] },
  { id: 'typescript', title: 'TypeScript Systems', description: 'Model reliable applications with expressive types and reusable abstractions.', progress: 18, duration: '2 weeks', difficulty: 'Intermediate', status: 'active', icon: '03', topics: ['Type system', 'Generics', 'Narrowing', 'Utility types', 'SDK design'] },
  { id: 'frontend', title: 'Frontend Engineering', description: 'Build production interfaces with React, Angular, testing and performance.', progress: 0, duration: '9 weeks', difficulty: 'Advanced', status: 'locked', icon: '04', topics: ['React', 'Angular', 'State', 'Testing', 'Performance'] },
  { id: 'backend', title: 'Backend & Data', description: 'Secure APIs, databases, queues, caching and realtime systems.', progress: 0, duration: '5 weeks', difficulty: 'Advanced', status: 'locked', icon: '05', topics: ['Node.js', 'PostgreSQL', 'Redis', 'Security', 'Queues'] },
  { id: 'system-design', title: 'System Design', description: 'Design maintainable systems and reason clearly about scale and reliability.', progress: 0, duration: '7 weeks', difficulty: 'Advanced', status: 'locked', icon: '06', topics: ['LLD', 'HLD', 'Caching', 'Scaling', 'Observability'] },
  { id: 'ai', title: 'Applied AI Engineering', description: 'Build evaluated ML, LLM, RAG and agent systems that are safe to operate.', progress: 0, duration: '19 weeks', difficulty: 'Advanced', status: 'locked', icon: '07', topics: ['Python', 'ML', 'LLMs', 'RAG', 'Agents', 'Evals'] },
]

export const projectCards = [
  { id: 'p05', code: 'P05', title: 'Intelligent Search Dashboard', type: 'JavaScript', level: 'Intermediate', progress: 72, description: 'Fast search with debounce, caching, pagination, URL state and resilient error handling.', accent: 'blue', tasks: '8 / 11', hours: '14h' },
  { id: 'p16', code: 'P16', title: 'Enterprise Analytics', type: 'Angular', level: 'Advanced', progress: 26, description: 'Role-aware dashboards, large datasets, realtime charts and performance budgets.', accent: 'violet', tasks: '4 / 15', hours: '24h' },
  { id: 'p25', code: 'P25', title: 'Multi-tenant SaaS', type: 'Backend', level: 'Advanced', progress: 0, description: 'Tenant isolation, RBAC, audit logs, queues and production observability.', accent: 'amber', tasks: '0 / 18', hours: '32h' },
  { id: 'p31', code: 'P31', title: 'Enterprise Knowledge Copilot', type: 'AI + RAG', level: 'Expert', progress: 0, description: 'Permission-aware retrieval, reranking, citations, evaluation and AI safety.', accent: 'green', tasks: '0 / 21', hours: '40h' },
]

export const reviewItems = [
  { title: 'Closures & lexical scope', type: 'Concept recall', duration: '6 min', due: 'Due now', strength: 54 },
  { title: 'Two pointer pattern', type: 'Coding repeat', duration: '12 min', due: 'Due now', strength: 61 },
  { title: 'Event loop ordering', type: 'Prediction', duration: '8 min', due: 'Today', strength: 72 },
  { title: 'Database indexing', type: 'Interview answer', duration: '10 min', due: 'Tomorrow', strength: 81 },
]

export const weeklyActivity = [42, 68, 54, 88, 74, 96, 62]

export const skills = [
  { name: 'JavaScript', score: 78, color: '#5eead4' },
  { name: 'TypeScript', score: 54, color: '#60a5fa' },
  { name: 'Frontend', score: 44, color: '#a78bfa' },
  { name: 'Backend', score: 31, color: '#fbbf24' },
  { name: 'System design', score: 22, color: '#fb7185' },
  { name: 'AI engineering', score: 18, color: '#34d399' },
]

export const interviewQuestions = [
  'Explain how the JavaScript event loop prioritizes microtasks and macrotasks.',
  'What is a closure, and where have you used one in a real project?',
  'Design a rate limiter for a public API. What changes at 100,000 requests per second?',
  'How would you prevent one tenant from retrieving another tenant’s documents in a RAG system?',
]
