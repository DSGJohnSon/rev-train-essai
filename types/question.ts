export type AnswerType = 'text' | 'image' | 'text-image';
export type AnswerId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface Answer {
  id: AnswerId;
  type: AnswerType;
  text?: string;
  image?: string;
  isCorrect: boolean;
}

export interface Question {
  _id: string;
  title: string;
  illustration?: string;
  answers: Answer[];
  correctAnswers: AnswerId[];
  categories: string[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionHistory {
  _id: string;
  questionId: string;
  version: number;
  snapshot: Question;
  changeType: 'created' | 'updated' | 'deleted';
  changedAt: Date;
  restoredFrom?: number;
}