// src/types.ts
export interface Question {
    questionId: number;
    question: string; // e.g., "The ___ cat sat on the ___ mat."
    options: string[]; // e.g., ["quick", "brown", "lazy", "blue"]
    correctAnswer: string[]; // e.g., ["quick", "blue"] - Order matters!,
    answerType:string;
    questionType:string;
  }
  
  export interface UserAnswer {
    questionId: number;
    answers: (string | null)[]; // Stores user's placed words, null for empty blanks
    isCorrect: boolean | null; // Null initially, true/false after checking
  }
  
  export type GameState = "loading" | "playing" | "finished";