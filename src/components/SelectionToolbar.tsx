// src/components/SelectionToolbar.tsx
import { DraggableSyntheticListeners } from '@dnd-kit/core';
import { HTMLAttributes } from 'react';
import './SelectionToolbar.css';

interface SelectionToolbarProps extends HTMLAttributes<HTMLDivElement> {
  onDelete: () => void;
  listeners?: DraggableSyntheticListeners; // Kept for visual handle, but not required for drag
}

export const SelectionToolbar = ({ onDelete, listeners }: SelectionToolbarProps) => {
  return (
    <div className="selection-toolbar">
      {/* This handle is now purely a visual affordance */}
      <div className="toolbar-drag-handle" {...listeners} aria-label="Drag to reorder">
        <span className="material-symbols-outlined">drag_indicator</span>
      </div>
      <div className="toolbar-divider" />
      <button className="toolbar-action-button" aria-label="Component settings">
        <span className="material-symbols-outlined">settings</span>
        <span>Settings</span>
      </button>
      <button className="toolbar-action-button" aria-label="Duplicate component">
        <span className="material-symbols-outlined">content_copy</span>
      </button>
      <button className="toolbar-action-button" onClick={onDelete} aria-label="Delete component">
        <span className="material-symbols-outlined">delete</span>
      </button>
      <button className="toolbar-action-button" aria-label="More component options">
        <span className="material-symbols-outlined">more_vert</span>
      </button>
    </div>
  );
};