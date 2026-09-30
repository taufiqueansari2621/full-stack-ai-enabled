export type SavedProject = {
  id: string;
  updatedAt: string;
  completedTaskIds: string[];
};
export type SavedInterviewSession = {
  id: string;
  answerCount: number;
  averageScore: number;
  firstAnswerAt: string;
  lastAnswerAt: string;
  legacy: number;
};
export type SavedInterviewAnswer = {
  id: string;
  question: string;
  answer: string;
  score: number;
  createdAt: string;
};
export type RecordPage<T> = { records: T[]; next: string | null };
