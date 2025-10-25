// src/features/Editor/SelectionToolbar.tsx
import { useState } from 'react';
import { DraggableSyntheticListeners } from '@dnd-kit/core';
import { SelectionToolbarMenu } from './SelectionToolbarMenu';
import { Tooltip } from '../../components/Tooltip';
import { Button } from '../../components/Button';
import { useIsMac } from '../../data/useIsMac';
import styles from './SelectionToolbar.module.css';

interface SelectionToolbarProps {
  componentId: string;
  onDelete: () => void;
  onRename: () => void;
  onNudge: (direction: 'up' | 'down') => void;
  listeners?: DraggableSyntheticListeners;
  onDuplicate?: () => void;
  onWrap: () => void;
  onUnwrap: () => void;
  canWrap: boolean;
  canUnwrap: boolean;
  canRename: boolean;
}

export const SelectionToolbar = ({
  componentId,
  onDelete,
  onRename,
  onNudge,
  listeners,
  onDuplicate = () => {},
  onWrap,
  onUnwrap,
  canWrap,
  canUnwrap,
  canRename,
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
        <Button 
          variant="on-solid"
          size="s"
          {...listeners}
          aria-label="Drag to reorder"
          style={{ cursor: 'grab' }}
        >
          <span className="material-symbols-rounded">drag_indicator</span>
        </Button>
        <div className={styles.divider} />
        <Tooltip content={renameTooltipContent} side="top">
          <Button 
            variant="on-solid"
            size="s"
            onClick={onRename}
            aria-label="Rename component"
            disabled={!canRename}
          >
            <span className="material-symbols-rounded">edit</span>
          </Button>
        </Tooltip>

        {/* --- SMART CONTEXTUAL BUTTON --- */}
        {canUnwrap && (
          <Tooltip content="Unwrap Container" side="top">
            <Button
              variant="on-solid"
              size="s"
              onClick={onUnwrap}
              aria-label="Unwrap container"
            >
              <span className="material-symbols-rounded">disabled_by_default</span>
            </Button>
          </Tooltip>
        )}
        {canWrap && !canUnwrap && (
           <Tooltip content="Wrap in Container" side="top">
            <Button
              variant="on-solid"
              size="s"
              onClick={onWrap}
              aria-label="Wrap in container"
            >
              <span className="material-symbols-rounded">add_box</span>
            </Button>
          </Tooltip>
        )}

        <Button 
          variant="on-solid"
          size="s"
          onClick={handleMenuToggle}
          aria-label="More options"
        >
          <span className="material-symbols-rounded">more_vert</span>
        </Button>
      </div>
      {isMenuOpen && (
        <SelectionToolbarMenu
          selectedId={componentId}
          onDelete={onDelete}
          onRename={onRename}
          onNudge={onNudge}
          onClose={() => setIsMenuOpen(false)}
          onDuplicate={onDuplicate}
          onWrap={onWrap}
          onUnwrap={onUnwrap}
          canWrap={canWrap}
          canUnwrap={canUnwrap}
          canRename={canRename}
        />
      )}
    </div>
  );
};