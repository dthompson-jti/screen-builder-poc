// src/features/Editor/useCanvasActions.ts
import { useSetAtom, useAtomValue } from 'jotai';
import {
  canvasInteractionAtom,
  selectionAnchorIdAtom,
} from '../../data/atoms';
import {
  commitActionAtom,
  canvasComponentsByIdAtom,
} from '../../data/historyAtoms';
import { getComponentName } from './canvasUtils';

/**
 * A hook that provides all reusable mutation functions for the canvas.
 * It centralizes calls to `commitActionAtom` and manages post-action UI state.
 */
export const useCanvasActions = (selectedIds: string[]) => {
  const setInteractionState = useSetAtom(canvasInteractionAtom);
  const setAnchorId = useSetAtom(selectionAnchorIdAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);

  const handleDelete = () => {
    if (selectedIds.length === 0) return;
    if (selectedIds.length === 1) {
      const component = allComponents[selectedIds[0]];
      commitAction({
        action: {
          type: 'COMPONENT_DELETE',
          payload: { componentId: selectedIds[0] },
        },
        message: `Delete '${getComponentName(component)}'`,
      });
    } else {
      commitAction({
        action: {
          type: 'COMPONENTS_DELETE_BULK',
          payload: { componentIds: selectedIds },
        },
        message: `Delete ${selectedIds.length} components`,
      });
    }
    setInteractionState({ mode: 'idle' });
    setAnchorId(null);
  };

  const handleRename = () => {
    if (selectedIds.length !== 1) return;
    setInteractionState({ mode: 'editing', id: selectedIds[0] });
  };

  const handleWrap = () => {
    if (selectedIds.length === 0) return;
    const firstComponent = allComponents[selectedIds[0]];
    if (!firstComponent) return;
    commitAction({
      action: {
        type: 'COMPONENTS_WRAP',
        payload: {
          componentIds: selectedIds,
          parentId: firstComponent.parentId,
        },
      },
      message: `Wrap ${selectedIds.length} component(s)`,
    });
  };

  const handleUnwrap = () => {
    if (selectedIds.length !== 1) return;
    const component = allComponents[selectedIds[0]];
    if (!component || component.componentType !== 'layout') return;
    commitAction({
      action: { type: 'COMPONENT_UNWRAP', payload: { componentId: component.id } },
      message: `Unwrap '${getComponentName(component)}'`,
    });
  };

  const handleNudge = (direction: 'up' | 'down') => {
    if (selectedIds.length !== 1) return;
    const componentId = selectedIds[0];
    const component = allComponents[componentId];
    const parent = allComponents[component.parentId];
    if (!parent || parent.componentType !== 'layout') return;
    const oldIndex = parent.children.indexOf(componentId);
    const newIndex = direction === 'up' ? oldIndex - 1 : oldIndex + 1;
    if (newIndex >= 0 && newIndex < parent.children.length) {
      commitAction({
        action: {
          type: 'COMPONENT_REORDER',
          payload: { componentId, parentId: parent.id, oldIndex, newIndex },
        },
        message: 'Reorder component',
      });
    }
  };
  
  const handleConvert = (targetType: 'heading' | 'paragraph' | 'link') => {
    if (selectedIds.length !== 1) return;
    commitAction({
      action: { type: 'COMPONENT_CONVERT', payload: { componentId: selectedIds[0], targetType } },
      message: `Convert component to ${targetType}`
    });
  };

  return {
    handleDelete,
    handleRename,
    handleWrap,
    handleUnwrap,
    handleNudge,
    handleConvert,
  };
};