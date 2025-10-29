// src/features/Editor/SelectionToolbar.tsx
import { DraggableSyntheticListeners } from '@dnd-kit/core';
import * as Toolbar from '@radix-ui/react-toolbar';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { SelectionToolbarMenu } from './SelectionToolbarMenu';
import { Tooltip } from '../../components/Tooltip';
import { Button } from '../../components/Button';
import { useIsMac } from '../../data/useIsMac';
import styles from './SelectionToolbar.module.css';

export interface SelectionToolbarProps {
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
  const isMac = useIsMac();

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
      <Toolbar.Root className={styles.selectionToolbar} onClick={(e) => e.stopPropagation()}>
        <Toolbar.Button asChild className={styles.dragHandle} {...listeners}>
          <Button variant="on-solid" size="s" iconOnly aria-label="Drag to reorder">
            <span className="material-symbols-rounded">drag_indicator</span>
          </Button>
        </Toolbar.Button>

        <Toolbar.Separator className={styles.divider} />

        <Tooltip content={renameTooltipContent} side="top">
          <Toolbar.Button asChild>
            <Button
              variant="on-solid"
              size="s"
              iconOnly
              onClick={onRename}
              aria-label="Rename component"
              disabled={!canRename}
            >
              <span className="material-symbols-rounded">edit</span>
            </Button>
          </Toolbar.Button>
        </Tooltip>

        {/* --- SMART CONTEXTUAL BUTTON --- */}
        {canUnwrap && (
          <Tooltip content="Unwrap Container" side="top">
            <Toolbar.Button asChild>
              <Button
                variant="on-solid"
                size="s"
                iconOnly
                onClick={onUnwrap}
                aria-label="Unwrap container"
              >
                <span className="material-symbols-rounded">disabled_by_default</span>
              </Button>
            </Toolbar.Button>
          </Tooltip>
        )}
        {canWrap && !canUnwrap && (
          <Tooltip content="Wrap in Container" side="top">
            <Toolbar.Button asChild>
              <Button
                variant="on-solid"
                size="s"
                iconOnly
                onClick={onWrap}
                aria-label="Wrap in container"
              >
                <span className="material-symbols-rounded">add_box</span>
              </Button>
            </Toolbar.Button>
          </Tooltip>
        )}

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Toolbar.Button asChild>
              <Button variant="on-solid" size="s" iconOnly aria-label="More options">
                <span className="material-symbols-rounded">more_vert</span>
              </Button>
            </Toolbar.Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="popover-content"
              style={{ minWidth: 240, padding: 'var(--spacing-1)' }}
              sideOffset={8}
              align="start"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              {/* DropdownMenu doesn't have a direct component for this, so we render it as a child */}
              <SelectionToolbarMenu
                selectedId={componentId}
                onDelete={onDelete}
                onRename={onRename}
                onNudge={onNudge}
                onClose={() => {}} // Dropdown handles its own close
                onDuplicate={onDuplicate}
                onWrap={onWrap}
                onUnwrap={onUnwrap}
                canWrap={canWrap}
                canUnwrap={canUnwrap}
                canRename={canRename}
              />
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </Toolbar.Root>
    </div>
  );
};