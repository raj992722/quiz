// src/components/FeedbackScreen.tsx - Example Responsive Adjustments
import React from 'react';
import { Question, UserAnswer } from '../types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from 'lucide-react';

interface FeedbackScreenProps {
  questions: Question[];
  userAnswers: UserAnswer[];
}

function FeedbackScreen({ questions, userAnswers }: FeedbackScreenProps) {
  const score = userAnswers.filter(answer => answer.isCorrect === true).length;
  const total = questions.length;

  // Helper (minor style tweaks possible)
  const renderAnsweredSentence = (question: Question, userAnswer: UserAnswer) => {
    const parts = question.question.split('___');
    const elements: React.ReactNode[] = [];
    const numBlanks = parts.length - 1;

    parts.forEach((part, index) => {
      elements.push(<span key={`text-${index}`}>{part}</span>);
      if (index < numBlanks) {
         const userWord = userAnswer.answers[index];
         const correctWord = question.correctAnswer[index];
         const isWordCorrect = userWord === correctWord;

         let className = "font-semibold mx-1 px-1.5 py-0.5 rounded text-sm md:text-base"; // Responsive text
         if (userWord === null) {
             className += " bg-gray-200 text-gray-500 italic";
         } else if (isWordCorrect) {
             className += " bg-green-100 text-green-700";
         } else {
             className += " bg-red-100 text-red-700 line-through";
         }

        elements.push(<span key={`blank-${index}`} className={className}>{userWord || '(missed)'}</span>);

         if ((userWord !== null && !isWordCorrect) || userWord === null) {
             elements.push(
                <span key={`correct-${index}`} className="font-semibold mx-1 px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-sm md:text-base">
                     ({correctWord})
                </span>
             );
         }
      }
    });
    // Responsive text size for sentence review
    return <p className="mt-1 text-gray-700 text-sm md:text-base lg:text-lg leading-relaxed">{elements}</p>;
  };

  return (
    // Responsive Padding
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 p-3 sm:p-4 md:p-6">
      {/* Responsive Max Width */}
      <Card className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl shadow-lg mb-6">
        <CardHeader>
          {/* Responsive Title */}
          <CardTitle className="text-center text-xl sm:text-2xl md:text-3xl">Quiz Results</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {/* Responsive Score Text */}
          <p className="text-lg sm:text-xl md:text-2xl font-semibold">
            Your Score: <span className="text-blue-600">{score}</span> out of {total}
          </p>
        </CardContent>
      </Card>

      {/* Responsive Max Width for list */}
      <div className="space-y-3 md:space-y-4 w-full max-w-xl md:max-w-2xl lg:max-w-3xl">
        {questions.map((question, index) => {
          const userAnswer = userAnswers.find(ua => ua.questionId === question.questionId);
          if (!userAnswer) return null;
          const isCorrect = userAnswer.isCorrect;

          return (
            <Card key={question.questionId} className={`border-l-4 ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
              <CardHeader className="p-3 md:p-4"> {/* Responsive Padding */}
                <div className="flex justify-between items-start">
                    <CardTitle className="text-base sm:text-lg md:text-xl">Question {index + 1}</CardTitle> {/* Responsive Title */}
                     {isCorrect ? <CheckCircle className="text-green-500 w-5 h-5 md:w-6 md:h-6" /> : <XCircle className="text-red-500 w-5 h-5 md:w-6 md:h-6" />} {/* Responsive Icons */}
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-4"> {/* Responsive Padding */}
                  {renderAnsweredSentence(question, userAnswer)}
                  {!isCorrect && (
                       <p className="mt-2 text-xs sm:text-sm text-green-700 font-medium"> {/* Responsive Text */}
                         Correct order: {question.correctAnswer.join(', ')}
                       </p>
                    )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button onClick={() => window.location.reload()} className="mt-6 text-base relative w-full text-green-900 md:text-lg px-5 py-2.5"> {/* Responsive Button */}
          Play Again
       </Button>
    </div>
  );
}

export default FeedbackScreen;