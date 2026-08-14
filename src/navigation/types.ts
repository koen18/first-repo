export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  AddTask: { date?: string; taskId?: string } | undefined;
  AddExam: undefined;
  Exams: undefined;
  ExamDetail: { examId: string };
  SummaryTool: undefined;
  QuizTool: undefined;
  FlashcardTool: undefined;
  QuizPlay: { quizId: string };
  DeckReview: { deckId: string };
  Settings: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Planner: undefined;
  Study: undefined;
  Coach: undefined;
  Progress: undefined;
};
