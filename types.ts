
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Lesson {
  title: string;
  content: string;
  quiz?: QuizQuestion[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  icon: 'tax' | 'investment' | 'budget';
  difficulty: 'beginner' | 'intermediate';
}

export interface Goal {
  id: number;
  text: string;
  completed: boolean;
}

export interface Progress {
  coursesCompleted: string[];
  quizzesPassed: { [courseId: string]: number[] }; // courseId -> lesson indices
}

export interface PointEvent {
  points: number;
  timestamp: number;
  reason: string;
}

export enum AppView {
  DASHBOARD,
  COURSE_VIEW,
  QUIZ_VIEW,
}