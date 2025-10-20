// src/features/Editor/CanvasWrappers.tsx
import React from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { DraggableSyntheticListeners } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  canvasInteractionAtom,
  isPropertiesPanelVisibleAtom, 
  CanvasInteractionState,
  selectionAnchorIdAtom,
} from '../../data/atoms';
import { canvasComponentsByIdAtom, commitActionAtom, rootComponentIdAtom } from '../../data/historyAtoms';
import { CanvasComponent, DndData, LayoutComponent } from '../../types';
import { SelectionToolbar } from './SelectionToolbar';
import { getComponentName } from './canvasUtils';
import { useComponentCapabilities } from './useComponentCapabilities'; // IMPORTED

import styles from './EditorCanvas.module.css';

// --- TYPE DEFINITIONS ---
export interface SelectionWrapperProps {
  component: CanvasComponent;
  dndListeners?: DraggableSyntheticListeners;
  children: React.ReactNode;
}

// --- INTERACTION WRAPPERS ---
export const SelectionWrapper = ({ component, dndListeners, children }: SelectionWrapperProps) => {
  const [interactionState, setInteractionState] = useAtom(canvasInteractionAtom);
  const [anchorId, setAnchorId] = useAtom(selectionAnchorIdAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const rootId = useAtomValue(rootComponentIdAtom);
  const setIsPropertiesPanelVisible = useSetAtom(isPropertiesPanelVisibleAtom); 
  
  const isRoot = component.id === rootId;
  const isSelected = (interactionState.mode === 'selecting' && interactionState.ids.includes(component.id));
  const isEditing = interactionState.mode === 'editing' && interactionState.id === component.id;
  const showToolbar = isSelected && !isEditing && interactionState.mode === 'selecting' && interactionState.ids.length === 1 && !isRoot;

  const isLayout = component.componentType === 'layout';
  const isPlainText = !isLayout && component.properties.controlType === 'plain-text';

  // REFACTORED: Use the centralized capabilities hook
  const { canRename, canWrap, canUnwrap } = useComponentCapabilities(isSelected ? [component.id] : []);
  const parent = allComponents[component.parentId] as LayoutComponent | undefined;

  const handleSelect = (e: React.MouseEvent) => {
    // FIX: If the click is on the root component itself, do nothing and let the
    // event bubble up to the canvas's main click handler which correctly selects the root.
    if (isRoot) {
      return;
    }

    // For any other component, stop propagation to prevent the canvas handler from firing.
    e.stopPropagation();
    
    setIsPropertiesPanelVisible(true);

    if ((e.altKey && !isLayout) || (e.detail === 2 && isPlainText)) {
      setInteractionState({ mode: 'editing', id: component.id });
      return;
    }
    
    const isCtrlClick = e.ctrlKey || e.metaKey;

    if (isCtrlClick) {
      const currentIds = interactionState.mode === 'selecting' ? interactionState.ids : [];
      const newIds = currentIds.includes(component.id)
        ? currentIds.filter(id => id !== component.id)
        : [...currentIds, component.id];
      
      const newInteractionState: CanvasInteractionState = newIds.length > 0 ? { mode: 'selecting', ids: newIds } : { mode: 'idle' };
      if (newIds.length === 0) {
        setIsPropertiesPanelVisible(false);
        setAnchorId(null);
      } else {
        setAnchorId(component.id);
      }
      setInteractionState(newInteractionState);

    } else if (e.shiftKey && anchorId && parent) {
      const anchorComponent = allComponents[anchorId];
      if (anchorComponent && anchorComponent.parentId === component.parentId) {
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

  const handleDelete = () => {
    commitAction({
      action: { type: 'COMPONENT_DELETE', payload: { componentId: component.id } },
      message: `Delete '${getComponentName(component)}'`
    });
    setInteractionState({ mode: 'idle' });
    setAnchorId(null);
  };
  
  const handleRename = () => {
    if (canRename) {
      setInteractionState({ mode: 'editing', id: component.id });
    }
  };

  const handleNudge = (direction: 'up' | 'down') => {
      if (!parent || parent.componentType !== 'layout') return;
      const oldIndex = parent.children.indexOf(component.id);
      const newIndex = direction === 'up' ? oldIndex - 1 : oldIndex + 1;
      if (newIndex >= 0 && newIndex < parent.children.length) {
          commitAction({
              action: { type: 'COMPONENT_REORDER', payload: { componentId: component.id, parentId: parent.id, oldIndex, newIndex } },
              message: `Reorder component`
          });
      }
  };

  const handleWrap = () => {
    if (!canWrap) return;
    commitAction({
      action: { type: 'COMPONENTS_WRAP', payload: { componentIds: [component.id], parentId: component.parentId } },
      message: `Wrap '${getComponentName(component)}'`
    });
  };

  const handleUnwrap = () => {
    if (!canUnwrap) return;
    commitAction({
        action: { type: 'COMPONENT_UNWRAP', payload: { componentId: component.id } },
        message: `Unwrap '${getComponentName(component)}'`
    });
  };

  // FIX: Add a dedicated, styleable class 'selectableWrapper' to this div.
  const className = `${styles.selectableWrapper} ${isSelected ? styles.selected : ''}`;

  return (
    <div className={className} onClick={handleSelect}>
      {showToolbar && (
        <SelectionToolbar 
          componentId={component.id}
          onDelete={handleDelete} 
          onRename={handleRename} 
          onNudge={handleNudge} 
          listeners={dndListeners} 
          onWrap={handleWrap}
          onUnwrap={handleUnwrap}
          canWrap={canWrap}
          canUnwrap={canUnwrap}
          canRename={canRename}
        />
      )}
      {children}
    </div>
  );
};

export const SortableWrapper = ({ component, children }: { component: CanvasComponent, children: React.ReactNode }) => {
  const rootId = useAtomValue(rootComponentIdAtom);
  const isRoot = component.id === rootId;
  const isDisabled = isRoot;

  const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: component.id,
    data: { 
      id: component.id,
      name: getComponentName(component),
      type: component.componentType,
      childrenCount: component.componentType === 'layout' ? component.children.length : undefined,
    } satisfies DndData,
    disabled: isDisabled,
  });
  
  const sortableStyle: React.CSSProperties = { 
    transform: CSS.Transform.toString(transform), 
    transition,
  };
  
  if (component.contextualLayout?.columnSpan) {
    sortableStyle.gridColumn = `span ${component.contextualLayout.columnSpan}`;
  }

  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const parent = allComponents[component.parentId];
  if (parent && parent.componentType === 'layout' && parent.properties.arrangement === 'wrap') {
    sortableStyle.flexShrink = component.contextualLayout?.preventShrinking ? 0 : 1;
  }
  
  if (isDisabled) {
    sortableStyle.transform = 'none';
  }
  
  const className = `${styles.sortableItem} ${isDragging ? styles.isDragging : ''}`;

  return (
    <div ref={setNodeRef} style={sortableStyle} className={className} data-id={component.id}>
      {React.cloneElement(children as React.ReactElement<Partial<SelectionWrapperProps>>, { dndListeners: listeners })}
    </div>
  );
};