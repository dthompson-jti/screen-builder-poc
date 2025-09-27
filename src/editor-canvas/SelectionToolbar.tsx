// src/editor-canvas/SelectionToolbar.tsx
import { DraggableSyntheticListeners } from '@dnd-kit/core';
import { HTMLAttributes } from 'react';
import './SelectionToolbar.css';

// Listeners are no longer needed as the parent component is now draggable
interface SelectionToolbarProps extends HTMLAttributes<HTMLDivElement> {
  listeners?: DraggableSyntheticListeners;
  // FIX: Add an onDelete prop for the new delete functionality.
  onDelete: () => void;
}

export const SelectionToolbar = ({ listeners, onDelete }: SelectionToolbarProps) => {
  return (
    <div className="selection-toolbar">
      {/* This handle is now purely a visual affordance */}
      <div className="toolbar-drag-handle" {...listeners} aria-label="Drag to reorder">
        <span className="material-symbols-outlined">drag_indicator</span>
      </div>
      <div className="toolbar-divider" />
      <button className="toolbar-action-button">
        <span className="material-symbols-outlined">settings</span>
        <span>Settings</span>
      </button>
      {/* THE FIX: Added aria-label for accessibility */}
      <button className="toolbar-action-button" aria-label="Duplicate component">
        <span className="material-symbols-outlined">content_copy</span>
      </button>
      {/* FIX: Add the new delete button. */}
      <button className="toolbar-action-button" onClick={onDelete} aria-label="Delete component">
        <span className="material-symbols-outlined">delete</span>
      </button>
      {/* THE FIX: Added aria-label for accessibility */}
      <button className="toolbar-action-button" aria-label="More component options">
        <span className="material-symbols-outlined">more_vert</span>
      </button>
    </div>
  );
};