// src/data/useEditorHotkeys.ts
import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import {
  canvasInteractionAtom,
  selectedCanvasComponentIdsAtom,
  appViewModeAtom,
} from './atoms';
import { canvasComponentsByIdAtom } from './historyAtoms';
import { useUndoRedo } from './useUndoRedo';
import { useCanvasActions } from '../features/Editor/useCanvasActions';

export const useEditorHotkeys = () => {
  const interactionState = useAtomValue(canvasInteractionAtom);
  const selectedIds = useAtomValue(selectedCanvasComponentIdsAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const { undo, redo } = useUndoRedo();
  const actions = useCanvasActions(selectedIds);
  const viewMode = useAtomValue(appViewModeAtom);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // CRITICAL FIX: Disable all editor hotkeys if not in editor view.
      if (viewMode !== 'editor') {
        return;
      }

      const activeElement = document.activeElement;
      const isTyping =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA';

      if (isTyping && activeElement?.tagName === 'TEXTAREA') {
        const isCommitShortcut =
          (event.metaKey || event.ctrlKey) && event.key === 'Enter';
        if (!isCommitShortcut) return;
      } else if (isTyping) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      // Undo/Redo Logic
      const isUndo = isCtrlOrCmd && event.key === 'z' && !event.shiftKey;
      const isRedo =
        (isMac && isCtrlOrCmd && event.shiftKey && event.key === 'z') ||
        (!isMac && isCtrlOrCmd && event.key === 'y');

      if (isUndo) {
        event.preventDefault();
        undo();
        return;
      }
      if (isRedo) {
        event.preventDefault();
        redo();
        return;
      }

      // Editor-specific hotkeys (only when not editing text)
      if (interactionState.mode === 'editing') return;

      if (
        (event.key === 'Delete' || event.key === 'Backspace') &&
        selectedIds.length > 0
      ) {
        event.preventDefault();
        actions.handleDelete();
        return;
      }

      if (event.key === 'Enter' && selectedIds.length === 1) {
        event.preventDefault();
        const idToEdit = selectedIds[0];
        if (idToEdit) {
          actions.handleRename(); // MODIFIED: handleRename no longer needs an ID
        }
        return;
      }

      if (isCtrlOrCmd && event.key.toLowerCase() === 'g') {
        event.preventDefault();
        if (event.shiftKey) {
          actions.handleUnwrap();
        } else {
          actions.handleWrap();
        }
        return;
      }

      if (event.key.startsWith('Arrow') && selectedIds.length === 1) {
        event.preventDefault();
        const component = allComponents[selectedIds[0]];
        if (!component) return;
        const parent = allComponents[component.parentId];
        if (!parent || parent.componentType !== 'layout') return;

        // CRITICAL FIX: Translate event.key to the required literal type.
        // This resolves the TypeScript error shown in the screenshot.
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          const direction = event.key === 'ArrowUp' ? 'up' : 'down';
          actions.handleNudge(direction);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [interactionState, selectedIds, allComponents, undo, redo, actions, viewMode]);
};