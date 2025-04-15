// src/components/DroppableBlank.tsx
import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableBlankProps {
  id: string; // Unique ID for the droppable area (e.g., `blank-0`)
  children: React.ReactNode; // Content inside (filled word or placeholder)
  onClick?: () => void; // Handler for clicking to unselect
  isOver?: boolean; // Optional: indicate if a compatible item is dragging over
  isFilled: boolean; // Indicate if the blank currently holds a word
}

function DroppableBlank({ id, children, onClick, isOver, isFilled }: DroppableBlankProps) {
  const { setNodeRef, isOver: dndIsOver } = useDroppable({
    id: id,
    data: { type: 'blank' }, // Identify this as a droppable blank
    disabled: isFilled, // Disable dropping if already filled
  });

  const isCurrentlyOver = isOver ?? dndIsOver; // Use passed prop or internal state

  // Base styling
  const baseClasses = `
    inline-block border-b-2 border-dashed border-gray-400
    min-w-[80px] min-h-[28px] md:min-h-[32px] mx-1 px-2 py-0.5
    text-center align-middle rounded-sm transition-colors duration-150 ease-in-out
  `;

  // Styling based on state
  const stateClasses = isFilled
    ? 'bg-blue-100 border-blue-400 border-solid text-blue-800 font-semibold cursor-pointer hover:bg-blue-200' // Filled state (clickable)
    : isCurrentlyOver
    ? 'bg-green-100 border-green-400 border-solid ring-2 ring-green-300' // Dragging over state
    : 'hover:bg-gray-100'; // Empty hover state

  return (
    <span
      ref={setNodeRef} // Assign the ref for dnd-kit
      onClick={isFilled ? onClick : undefined} // Only allow click if filled
      className={`${baseClasses} ${stateClasses}`}
      role={isFilled ? "button" : undefined} // Accessibility role
      aria-label={isFilled ? `Filled with ${children}, click to remove` : `Blank drop area`}
    >
      {/* Render the word or a non-breaking space for layout */}
      {children || '\u00A0'}
    </span>
  );
}

export default DroppableBlank;