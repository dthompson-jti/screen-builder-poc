// src/components/SelectionToolbar.tsx
import { DraggableSyntheticListeners } from '@dnd-kit/core';
import { HTMLAttributes } from 'react';
import { useSetAtom } from 'jotai';
import { isPropertiesPanelVisibleAtom } from '../state/atoms';
import './SelectionToolbar.css';

interface SelectionToolbarProps extends HTMLAttributes<HTMLDivElement> {
  onDelete: () => void;
  listeners?: DraggableSyntheticListeners;
}

export const SelectionToolbar = ({ onDelete, listeners }: SelectionToolbarProps) => {
  // FIX: Add atom setter to re-open the panel
  const setIsPropertiesPanelVisible = useSetAtom(isPropertiesPanelVisibleAtom);

  const handleSettingsClick = () => {
    setIsPropertiesPanelVisible(true);
  };

  return (
    <div className="selection-toolbar">
      <div className="toolbar-drag-handle" {...listeners} aria-label="Drag to reorder">
        <span className="material-symbols-rounded">drag_indicator</span>
      </div>
      <div className="toolbar-divider" />
      <button className="toolbar-action-button" aria-label="Component settings" onClick={handleSettingsClick}>
        <span className="material-symbols-rounded">settings</span>
        <span>Settings</span>
      </button>
      <button className="toolbar-action-button" aria-label="Duplicate component">
        <span className="material-symbols-rounded">content_copy</span>
      </button>
      <button className="toolbar-action-button" onClick={onDelete} aria-label="Delete component">
        <span className="material-symbols-rounded">delete</span>
      </button>
      <button className="toolbar-action-button" aria-label="More component options">
        <span className="material-symbols-rounded">more_vert</span>
      </button>
    </div>
  );
};