export type TutorRequest = {
  mode: string;
  message: string;
  level: number;
  context: {
    lesson?: string;
    challenge?: string;
    error?: string;
    activeFile?: { path: string; content: string };
    learnerLevel?: string;
  };
};

export type TutorAnswer = {
  text: string;
  model: string;
  provider: string;
};

export interface AiProvider {
  generate(request: TutorRequest): Promise<TutorAnswer>;
}
