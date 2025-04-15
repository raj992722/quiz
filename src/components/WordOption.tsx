// src/components/WordOption.tsx
// import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";

interface WordOptionProps {
  id: string; // Unique ID for the draggable (e.g., `option-quick`)
  word: string;
  isUsed: boolean; // Flag to indicate if the word is currently placed in a blank
}

function WordOption({ id, word, isUsed }: WordOptionProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: { word: word, type: 'word' }, // Pass data: the word itself and a type identifier
    disabled: isUsed, // Disable dragging if already placed in a blank
  });

  // Apply transform for movement, handle z-index and opacity
  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 100 : 'auto', // Ensure dragging item appears on top
    opacity: isUsed ? 0.5 : 1, // Visually dim if used
    cursor: isUsed ? 'not-allowed' : (isDragging ? 'grabbing' : 'grab'), // Indicate state
    touchAction: 'none', // Recommended for preventing scrolling issues on touch devices
  };

  return (
    <Button
      ref={setNodeRef}
      style={style}
      variant="outline"
      // Add visual feedback for dragging state
      className={`transition-shadow duration-150 ease-in-out ${isDragging ? 'shadow-lg scale-105 ring-2 ring-blue-500' : ''}`}
      {...listeners} // Attach listeners for drag start
      {...attributes} // Attach necessary accessibility attributes
      disabled={isUsed} // Disable button interaction if used
      aria-label={`Draggable word option: ${word}${isUsed ? ' (already used)' : ''}`}
    >
      {word}
    </Button>
  );
}

export default WordOption;