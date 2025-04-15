// src/App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Question, UserAnswer, GameState } from './types';
import GameScreen from './components/GameScreen';
import FeedbackScreen from './components/FeedbackScreen';
// import { Toaster } from "@/components/ui/toaster"; // If using shadcn toast
// import { useToast } from "@/components/ui/use-toast"; // If using shadcn toast

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/data'; // Your JSON server URL

function App() {
  const [gameState, setGameState] = useState<GameState>('loading');
  const [question, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  // const { toast } = useToast(); // If using shadcn toast

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const {questions}:{questions:Question[]}= await response.json();
        // Ensure data has the expected structure if needed
        console.log(questions)
         if (!questions || questions.length === 0) {
           throw new Error("No questions found or invalid data format.");
        }
        setQuestions(questions);
         // Initialize userAnswers structure
        setUserAnswers(questions.map(q=> {
             const numBlanks = (q.question.match(/_____________/g) || []).length;
             console.log("numBlanks",numBlanks)
             return {
                 questionId: q.questionId,
                 answers: Array(numBlanks).fill(null), // Initialize with nulls
                 isCorrect: null
             };
         }));
         console.log('userAnswers',userAnswers)
        setGameState('playing');
      } catch (error) {
        console.error("Failed to fetch questions:", error);
        // Handle error state appropriately - show message to user
        setGameState('loading'); // Keep it loading or set an error state
        //  toast({ // Example using shadcn toast
        //     variant: "destructive",
        //     title: "Error Fetching Questions",
        //     description: `Could not load questions from ${API_URL}. Please ensure the JSON server is running. Error: ${error instanceof Error ? error.message : String(error)}`,
        //  });
      }
    };

    fetchQuestions();
  }, []); // Add toast dependency if used


  const handleAnswerSubmit = useCallback((questionId: number, answers: (string | null)[]) => {
    setUserAnswers(prevAnswers => {
      const answerIndex = prevAnswers.findIndex(a => a.questionId === questionId);
      if (answerIndex === -1) return prevAnswers; // Should not happen

      const currentQuestion = question.find(q => q.questionId === questionId);
      if (!currentQuestion) return prevAnswers; // Should not happen

      // Basic correctness check (exact match in order)
      const isCorrect = answers.length === currentQuestion.correctAnswer.length &&
                       answers.every((ans, i) => ans === currentQuestion.correctAnswer[i]);

      const updatedAnswers = [...prevAnswers];
      updatedAnswers[answerIndex] = { ...updatedAnswers[answerIndex], answers, isCorrect };
      return updatedAnswers;
    });

    // Move to next question or finish
    if (currentQuestionIndex < question.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      setGameState('finished');
    }
  }, [currentQuestionIndex, question]); // Removed userAnswers from dependency array


    // Recalculate derived state within render or specific handlers
    const currentQuestion = question[currentQuestionIndex];
    const currentUserAnswer = userAnswers.find(ua => ua.questionId === currentQuestion?.questionId);

  if (gameState === 'loading') {
    return <div className="flex justify-center items-center h-screen">Loading questions...</div>;
  }

   if (gameState === 'playing' && currentQuestion && currentUserAnswer) {
    return (
        <GameScreen
            key={currentQuestion.questionId} // Force re-mount for timer reset
            question={currentQuestion}
            initialUserAnswer={currentUserAnswer} // Pass initial state for this question
            onComplete={handleAnswerSubmit}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={question.length}
        />
    );
   }


  if (gameState === 'finished') {
    return <FeedbackScreen questions={question} userAnswers={userAnswers} />;
  }

  // Fallback or error state rendering
  return <div className="flex justify-center items-center h-screen">An unexpected error occurred.</div>;
}

export default App;

 // Add main layout and Toaster provider if using shadcn toast
 // In your main entry (e.g., main.tsx or index.tsx if not using shadcn's layout):
 // import App from './App';
 // import './index.css';
 // import { Toaster } from "@/components/ui/toaster" // Import Toaster
 // ReactDOM.createRoot(document.getElementById('root')!).render(
 //  <React.StrictMode>
 //    <App />
 //    <Toaster /> {/* Add Toaster here */}
 //  </React.StrictMode>,
 // )