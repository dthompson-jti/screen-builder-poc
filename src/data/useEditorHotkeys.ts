// src/data/useEditorHotkeys.ts
import { useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { canvasInteractionAtom, selectedCanvasComponentIdsAtom } from './atoms';
import { canvasComponentsByIdAtom, commitActionAtom } from './historyAtoms';

export const useEditorHotkeys = () => {
  const [interactionState, setInteractionState] = useAtom(canvasInteractionAtom);
  const selectedIds = useAtomValue(selectedCanvasComponentIdsAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const commitAction = useSetAtom(commitActionAtom);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isTyping = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
      
      if (isTyping && activeElement?.tagName === 'TEXTAREA') {
        const isCommitShortcut = (event.metaKey || event.ctrlKey) && event.key === 'Enter';
        if (!isCommitShortcut) return;
      } else if (isTyping) {
        return;
      }
      
      if (interactionState.mode === 'editing') return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedIds.length > 0) {
        event.preventDefault();
        commitAction({ action: { type: 'COMPONENTS_DELETE_BULK', payload: { componentIds: selectedIds } }, message: `Delete ${selectedIds.length} component(s)` });
        setInteractionState({ mode: 'idle' });
        return;
      }
      
      if (event.key === 'Enter' && selectedIds.length === 1) {
        event.preventDefault();
        const component = allComponents[selectedIds[0]];
        if (component && (component.componentType === 'widget' || component.componentType === 'field')) {
          setInteractionState({ mode: 'editing', id: selectedIds[0] });
        }
        return;
      }

      if (isCtrlOrCmd && event.key.toLowerCase() === 'g') {
        event.preventDefault();
        if (event.shiftKey) {
          if (selectedIds.length !== 1) return;
          const selected = allComponents[selectedIds[0]];
          if (selected?.componentType === 'layout' && selected.children.length > 0) {
            commitAction({ action: { type: 'COMPONENT_UNWRAP', payload: { componentId: selected.id } }, message: `Unwrap container` });
          }
        } else {
          if (selectedIds.length === 0) return;
          const firstSelected = allComponents[selectedIds[0]];
          if (!firstSelected) return;
          commitAction({ action: { type: 'COMPONENTS_WRAP', payload: { componentIds: selectedIds, parentId: firstSelected.parentId } }, message: `Wrap ${selectedIds.length} component(s)` });
        }
        return;
      }

      if (event.key.startsWith('Arrow') && selectedIds.length === 1) {
        event.preventDefault();
        const component = allComponents[selectedIds[0]];
        if (!component) return;
        const parent = allComponents[component.parentId];
        if (!parent || parent.componentType !== 'layout') return;

        if (event.shiftKey) {
          const grandparent = allComponents[parent.parentId];
          if (!grandparent || grandparent.componentType !== 'layout') return;
          const parentIndex = grandparent.children.indexOf(parent.id);
          const moveDirection = (event.key === 'ArrowUp' || event.key === 'ArrowLeft') ? -1 : 1;
          const targetParentIndex = parentIndex + moveDirection;
          if (targetParentIndex >= 0 && targetParentIndex < grandparent.children.length) {
            const newParentId = grandparent.children[targetParentIndex];
            const newParent = allComponents[newParentId];
            if (newParent && newParent.componentType === 'layout') {
              commitAction({ action: { type: 'COMPONENT_MOVE', payload: { componentId: component.id, oldParentId: parent.id, newParentId, newIndex: 0 } }, message: `Move component to new container` });
            }
          }
        } else {
          const oldIndex = parent.children.indexOf(component.id);
          const moveDirection = (event.key === 'ArrowUp' || event.key === 'ArrowLeft') ? -1 : 1;
          const newIndex = oldIndex + moveDirection;
          if (newIndex >= 0 && newIndex < parent.children.length) {
            commitAction({ action: { type: 'COMPONENT_REORDER', payload: { componentId: component.id, parentId: parent.id, oldIndex, newIndex } }, message: `Reorder component` });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [interactionState, selectedIds, allComponents, commitAction, setInteractionState]);
};