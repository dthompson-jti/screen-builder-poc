// src/features/Editor/useEditorInteractions.ts
import { useSortable } from '@dnd-kit/sortable';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import {
  canvasInteractionAtom,
  isPropertiesPanelVisibleAtom,
  selectionAnchorIdAtom,
  CanvasInteractionState,
} from '../../data/atoms';
import { canvasComponentsByIdAtom, rootComponentIdAtom } from '../../data/historyAtoms';
import { CanvasComponent, DndData, LayoutComponent } from '../../types';
import { getComponentName } from './canvasUtils';
import { CSS } from '@dnd-kit/utilities';

/**
 * A hook that encapsulates all logic for making a component interactive on the canvas.
 * It provides props for sorting (dnd-kit), selection handling, and state flags.
 */
export const useEditorInteractions = (component: CanvasComponent) => {
  const [interactionState, setInteractionState] = useAtom(canvasInteractionAtom);
  const [anchorId, setAnchorId] = useAtom(selectionAnchorIdAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const rootId = useAtomValue(rootComponentIdAtom);
  const setIsPropertiesPanelVisible = useSetAtom(isPropertiesPanelVisibleAtom);

  const isRoot = component.id === rootId;
  const isSelected = (interactionState.mode === 'selecting' && interactionState.ids.includes(component.id)) || (interactionState.mode === 'editing' && interactionState.id === component.id);
  const isEditing = interactionState.mode === 'editing' && interactionState.id === component.id;
  const isMultiSelect = interactionState.mode === 'selecting' && interactionState.ids.length > 1;
  const isOnlySelection = isSelected && !isMultiSelect;

  const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id,
    data: {
      id: component.id,
      name: getComponentName(component),
      type: component.componentType,
      childrenCount: component.componentType === 'layout' ? component.children.length : undefined,
    } satisfies DndData,
    disabled: isRoot,
  });

  const handleSelect = (e: React.MouseEvent) => {
    if (isRoot) return;
    e.stopPropagation();
    setIsPropertiesPanelVisible(true);

    const isLayout = component.componentType === 'layout';
    const isPlainText = !isLayout && component.properties.controlType === 'plain-text';
    if ((e.altKey && !isLayout) || (e.detail === 2 && isPlainText)) {
      setInteractionState({ mode: 'editing', id: component.id });
      return;
    }

    const isCtrlClick = e.ctrlKey || e.metaKey;
    if (isCtrlClick) {
      const currentIds = interactionState.mode === 'selecting' ? interactionState.ids : [];
      const newIds = currentIds.includes(component.id) ? currentIds.filter(id => id !== component.id) : [...currentIds, component.id];
      const newInteractionState: CanvasInteractionState = newIds.length > 0 ? { mode: 'selecting', ids: newIds } : { mode: 'idle' };
      if (newIds.length === 0) {
        setIsPropertiesPanelVisible(false);
        setAnchorId(null);
      } else {
        setAnchorId(component.id);
      }
      setInteractionState(newInteractionState);
    } else if (e.shiftKey && anchorId) {
      const parent = allComponents[component.parentId] as LayoutComponent | undefined;
      const anchorComponent = allComponents[anchorId];
      if (parent && anchorComponent && anchorComponent.parentId === component.parentId) {
        const children = parent.children;
        const anchorIndex = children.indexOf(anchorId);
        const targetIndex = children.indexOf(component.id);
        const start = Math.min(anchorIndex, targetIndex);
        const end = Math.max(anchorIndex, targetIndex);
        const rangeIds = children.slice(start, end + 1);
        setInteractionState({ mode: 'selecting', ids: rangeIds });
      } else {
        setInteractionState({ mode: 'selecting', ids: [component.id] });
        setAnchorId(component.id);
      }
    } else {
      setInteractionState({ mode: 'selecting', ids: [component.id] });
      setAnchorId(component.id);
    }
  };
  
  const handleContextMenu = (e: React.MouseEvent) => {
    // Prevent the default browser context menu from appearing.
    e.preventDefault();
    // CRITICAL FIX: DO NOT stop propagation. This allows the event to bubble up
    // to the Radix ContextMenu.Trigger, which wraps the entire canvas.
    // e.stopPropagation(); 
    
    // If the right-clicked item is not already part of the selection,
    // clear the old selection and select only this item.
    if (!isSelected) {
      setInteractionState({ mode: 'selecting', ids: [component.id] });
      setAnchorId(component.id);
    }
  };

  const sortableStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  if (isRoot) sortableStyle.transform = 'none';

  if (component.contextualLayout?.columnSpan) {
    sortableStyle.gridColumn = `span ${component.contextualLayout.columnSpan}`;
  }
  const parent = allComponents[component.parentId];
  if (parent && parent.componentType === 'layout' && parent.properties.arrangement === 'wrap') {
    sortableStyle.flexShrink = component.contextualLayout?.preventShrinking ? 0 : 1;
  }

  return {
    // State flags
    isSelected,
    isEditing,
    isDragging,
    isOnlySelection,
    isRoot,
    // Props to spread
    sortableProps: {
      ref: setNodeRef,
      style: sortableStyle,
    },
    selectionProps: {
      onClick: handleSelect,
      onContextMenu: handleContextMenu,
    },
    dndListeners: listeners,
  };
};