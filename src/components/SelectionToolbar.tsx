// src/components/SelectionToolbar.tsx
import { useState } from 'react';
import { DraggableSyntheticListeners } from '@dnd-kit/core';
import { SelectionToolbarMenu } from './SelectionToolbarMenu';
import styles from './SelectionToolbar.module.css';

interface SelectionToolbarProps {
  onDelete: () => void;
  onRename: () => void;
  onNudge: (direction: 'up' | 'down') => void;
  listeners?: DraggableSyntheticListeners;
}

export const SelectionToolbar = ({ onDelete, onRename, onNudge, listeners }: SelectionToolbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };

  return (
    <div className={styles.toolbarWrapper}>
      <div className={styles.selectionToolbar} onClick={(e) => e.stopPropagation()}>
        <button 
          className={`btn btn-tertiary on-solid ${styles.toolbarButton}`}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <span className="material-symbols-rounded">drag_indicator</span>
        </button>
        <div className={styles.divider} />
        <button 
          className={`btn btn-tertiary on-solid ${styles.toolbarButton}`}
          onClick={onRename}
          aria-label="Rename component"
        >
          <span className="material-symbols-rounded">edit</span>
        </button>
        <button 
          className={`btn btn-tertiary on-solid ${styles.toolbarButton}`}
          onClick={handleMenuToggle}
          aria-label="More options"
        >
          <span className="material-symbols-rounded">more_vert</span>
        </button>
      </div>
      {isMenuOpen && <SelectionToolbarMenu onDelete={onDelete} onNudge={onNudge} onClose={() => setIsMenuOpen(false)} />}
    </div>
  );
};