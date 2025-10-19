// src/features/Editor/EditorCanvas/SelectionToolbar.tsx
import { useState } from 'react';
import { DraggableSyntheticListeners } from '@dnd-kit/core';
import { SelectionToolbarMenu } from './SelectionToolbarMenu';
import { Tooltip } from '../../../components/Tooltip';
import { useIsMac } from '../../../data/useIsMac';
import styles from './SelectionToolbar.module.css';

interface SelectionToolbarProps {
  onDelete: () => void;
  onRename: () => void;
  onNudge: (direction: 'up' | 'down') => void;
  listeners?: DraggableSyntheticListeners;
  onDuplicate?: () => void;
  onWrap?: () => void;
  onUnwrap?: () => void;
  canWrap?: boolean;
  canUnwrap?: boolean;
}

export const SelectionToolbar = ({
  onDelete,
  onRename,
  onNudge,
  listeners,
  onDuplicate = () => {},
  onWrap = () => {},
  onUnwrap = () => {},
  canWrap = false,
  canUnwrap = false,
}: SelectionToolbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMac = useIsMac();

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };

  const renameTooltipContent = (
    <div style={{ textAlign: 'left' }}>
      <div>Rename (Enter)</div>
      <div style={{ color: 'var(--surface-fg-secondary)' }}>
        or {isMac ? 'Option' : 'Alt'}+Click label
      </div>
    </div>
  );

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
        <Tooltip content={renameTooltipContent} side="top">
          <button 
            className={`btn btn-tertiary on-solid ${styles.toolbarButton}`}
            onClick={onRename}
            aria-label="Rename component"
          >
            <span className="material-symbols-rounded">edit</span>
          </button>
        </Tooltip>
        <button 
          className={`btn btn-tertiary on-solid ${styles.toolbarButton}`}
          onClick={handleMenuToggle}
          aria-label="More options"
        >
          <span className="material-symbols-rounded">more_vert</span>
        </button>
      </div>
      {isMenuOpen && (
        <SelectionToolbarMenu
          onDelete={onDelete}
          onRename={onRename}
          onNudge={onNudge}
          onClose={() => setIsMenuOpen(false)}
          onDuplicate={onDuplicate}
          onWrap={onWrap}
          onUnwrap={onUnwrap}
          canWrap={canWrap}
          canUnwrap={canUnwrap}
        />
      )}
    </div>
  );
};