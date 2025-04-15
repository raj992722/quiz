// src/components/GameScreen.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent, // Import DragOverEvent
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter, // Or other collision detection strategies
} from '@dnd-kit/core';
import { Question, UserAnswer } from '../types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import DroppableBlank from './DroppableBlank';
import WordOption from './WordOption';

interface GameScreenProps {
  question: Question;
  initialUserAnswer: UserAnswer;
  onComplete: (questionId: number, answers: (string | null)[]) => void;
  questionNumber: number;
  totalQuestions: number;
}

const TIMER_DURATION = 30;

function GameScreen({ question, initialUserAnswer, onComplete, questionNumber, totalQuestions }: GameScreenProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>(initialUserAnswer.answers);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [activeId, setActiveId] = useState<string | null>(null); // ID of the item being dragged
  const [overId, setOverId] = useState<string | null>(null); // ID of the droppable being hovered over

  const numBlanks = useMemo(() => (question.question.match(/___/g) || []).length, [question.question]);

  // --- Dnd Sensors ---
  const sensors = useSensors(
    // Delay ensures small movements aren't treated as drags (good for touch)
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor) // Keep for accessibility
  );

  // --- Timer Logic (no changes needed) ---
  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete(question.questionId, selectedAnswers);
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, onComplete, question.questionId, selectedAnswers]);

  // --- Derived State ---
  const allBlanksFilled = useMemo(() => selectedAnswers.every(answer => answer !== null), [selectedAnswers]);
  const usedWords = useMemo(() => new Set(selectedAnswers.filter(s => s !== null)), [selectedAnswers]);
  const activeWordData = useMemo(() => {
      if (!activeId) return null;
      // Find the word data associated with the active draggable ID
      const option = question.options.find(opt => `option-${opt}` === activeId);
      return option ? { word: option } : null;
  }, [activeId, question.options]);


  // --- Dnd Event Handlers ---
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
      const { over } = event;
      // Update the ID of the droppable being hovered over
      // Ensure it's a blank and not the draggable itself
      setOverId(over ? (over.id as string) : null);
  }, []);


  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    // Reset active/over states
    setActiveId(null);
    setOverId(null);

    // Ensure we have an active item and a droppable target
    if (active && over && over.data.current?.type === 'blank') {
      const wordData = active.data.current;
      const blankId = over.id as string;
      const blankIndex = parseInt(blankId.substring('blank-'.length), 10);
      const word = wordData?.word as string;

      // Check if valid drop: word exists, blank index is valid, and word is not already used elsewhere
      if (word && wordData?.type === 'word' && blankIndex >= 0 && blankIndex < numBlanks) {

         // Only place if the blank is empty
         if (selectedAnswers[blankIndex] === null) {
             // Ensure the word isn't already placed in *another* blank
             const isUsedElsewhere = selectedAnswers.some((ans, idx) => ans === word && idx !== blankIndex);
             if (!isUsedElsewhere) {
                 const newAnswers = [...selectedAnswers];
                 newAnswers[blankIndex] = word;
                 setSelectedAnswers(newAnswers);
             } else {
                console.warn("Word already used in another blank."); // Or provide user feedback
             }

         } else {
             console.warn("Blank is already filled."); // Or provide user feedback
         }
      }
    }
  }, [numBlanks, selectedAnswers]); // Add selectedAnswers to dependencies

  const handleDragCancel = useCallback(() => {
      // Reset states if drag is cancelled
      setActiveId(null);
      setOverId(null);
  }, []);


  // --- Click Handler for Unselecting ---
  const handleBlankClick = useCallback((index: number) => {
    if (selectedAnswers[index] !== null) {
      const newAnswers = [...selectedAnswers];
      newAnswers[index] = null; // Clear the blank
      setSelectedAnswers(newAnswers);
    }
  }, [selectedAnswers]); // Add dependency

  // --- Next Button ---
  const handleNextClick = () => {
    if (allBlanksFilled) {
      onComplete(question.questionId, selectedAnswers);
    }
  };

  // --- Rendering Logic ---
  const renderSentenceWithBlanks = () => {
    const parts = question.question.split('_____________');
    const elements: React.ReactNode[] = [];

    parts.forEach((part, index) => {
      elements.push(<span key={`text-${index}`}>{part}</span>);
      if (index < numBlanks) {
        const filledWord = selectedAnswers[index];
        const blankId = `blank-${index}`;
        elements.push(
          <DroppableBlank
            key={blankId}
            id={blankId}
            onClick={() => handleBlankClick(index)}
            isFilled={filledWord !== null}
            // Pass isOver status explicitly for styling
             isOver={overId === blankId && activeId !== null && activeId.startsWith('option-')}
          >
            {filledWord || '\u00A0'}
          </DroppableBlank>
        );
      }
    });
    // Responsive line height and text size
    return <span className="text-base md:text-lg lg:text-xl leading-relaxed md:leading-loose">{elements}</span>;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter} // Simple collision detection
      onDragStart={handleDragStart}
      onDragOver={handleDragOver} // Add over handler
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {/* Responsive Padding */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6">
        {/* Max width increases slightly on larger screens */}
        <Card className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl shadow-lg">
          <CardHeader>
            {/* Responsive Header Layout */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2 sm:gap-4">
              <CardTitle className="text-lg sm:text-xl md:text-2xl">Question {questionNumber}/{totalQuestions}</CardTitle>
              {/* Timer Section - Adapts width */}
              <div className="text-left sm:text-right w-full sm:w-auto flex-shrink-0">
                <div className="text-base sm:text-lg font-semibold">Time Left: {timeLeft}s</div>
                <Progress value={(timeLeft / TIMER_DURATION) * 100} className="w-full sm:w-[120px] md:w-[150px] h-2 mt-1" />
              </div>
            </div>
            <CardDescription className="pt-4">
              {renderSentenceWithBlanks()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-3 font-medium text-gray-700 text-sm sm:text-base">
              {activeId ? 'Drop the word onto a blank' : 'Drag words to the blanks above:'}
            </p>
            {/* Responsive Options Area - Justify center, wrap, min height */}
            <div className="flex flex-wrap gap-2 md:gap-3 justify-center min-h-[60px] p-2 border border-gray-200 rounded-md bg-gray-50">
              {question.options.map((option) => (
                <WordOption
                  key={option}
                  id={`option-${option}`} // Draggable ID must be unique
                  word={option}
                  isUsed={usedWords.has(option)}
                />
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex text-black justify-end">
            <Button className='text-blue-800 relative w-full' onClick={handleNextClick} disabled={!allBlanksFilled}>
              Next
            </Button>
          </CardFooter>
        </Card>

        {/* Drag Overlay: Renders a copy of the item being dragged */}
        <DragOverlay dropAnimation={null}>
          {activeId && activeId.startsWith('option-') && activeWordData ? (
            // Use WordOption component directly for consistent styling
             <WordOption id={`${activeId}-overlay`} word={activeWordData.word} isUsed={false} />
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

export default GameScreen;