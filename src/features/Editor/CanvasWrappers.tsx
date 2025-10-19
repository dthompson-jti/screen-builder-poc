// src/features/Editor/CanvasWrappers.tsx
import React from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { DraggableSyntheticListeners } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  canvasInteractionAtom,
} from '../../data/atoms';
import { canvasComponentsByIdAtom, commitActionAtom, rootComponentIdAtom } from '../../data/historyAtoms';
import { CanvasComponent, DndData } from '../../types';
import { SelectionToolbar } from './SelectionToolbar';
import { getComponentName } from './canvasUtils'; // Imported utility

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
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const rootId = useAtomValue(rootComponentIdAtom);
  
  const isRoot = component.id === rootId;
  const isSelected = (interactionState.mode === 'selecting' && interactionState.ids.includes(component.id));
  const isEditing = interactionState.mode === 'editing' && interactionState.id === component.id;
  const showToolbar = isSelected && !isEditing && interactionState.mode === 'selecting' && interactionState.ids.length === 1 && !isRoot;

  // Determine if component is a layout, or a field/widget.
  const isLayout = component.componentType === 'layout';
  const isPlainText = !isLayout && component.properties.controlType === 'plain-text';

  // --- Handlers ---
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRoot) return;

    // Check for Alt+Click on any form component, or Double-Click on Plain Text component
    if ((e.altKey && !isLayout) || (e.detail === 2 && isPlainText)) {
      setInteractionState({ mode: 'editing', id: component.id });
      return;
    }
    
    if (e.shiftKey) {
      const currentIds = interactionState.mode === 'selecting' ? interactionState.ids : [];
      const newIds = currentIds.includes(component.id)
        ? currentIds.filter(id => id !== component.id)
        : [...currentIds, component.id];
      setInteractionState(newIds.length > 0 ? { mode: 'selecting', ids: newIds } : { mode: 'idle' });
    } else {
      setInteractionState({ mode: 'selecting', ids: [component.id] });
    }
  };

  const handleDelete = () => {
    commitAction({
      action: { type: 'COMPONENT_DELETE', payload: { componentId: component.id } },
      message: `Delete '${getComponentName(component)}'`
    });
    setInteractionState({ mode: 'idle' });
  };
  
  const handleRename = () => {
    if (component.componentType !== 'layout') {
      setInteractionState({ mode: 'editing', id: component.id });
    }
  };

  const handleNudge = (direction: 'up' | 'down') => {
      const parent = allComponents[component.parentId];
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

  // NOTE: onUnwrap logic disabled
  const canWrap = true; 

  const handleWrap = () => {
    commitAction({
      action: { type: 'COMPONENTS_WRAP', payload: { componentIds: [component.id], parentId: component.parentId } },
      message: `Wrap '${getComponentName(component)}'`
    });
  };

  const className = isSelected && !isRoot ? styles.selected : '';

  return (
    <div className={className} onClick={handleSelect}>
      {showToolbar && (
        <SelectionToolbar 
          onDelete={handleDelete} 
          onRename={handleRename} 
          onNudge={handleNudge} 
          listeners={dndListeners} 
          onWrap={handleWrap}
          canWrap={canWrap}
        />
      )}
      {children}
    </div>
  );
};

export const SortableWrapper = ({ component, children }: { component: CanvasComponent, children: React.ReactNode }) => {
  const rootId = useAtomValue(rootComponentIdAtom);
  const isRoot = component.id === rootId;
  const isEmptyContainer = component.componentType === 'layout' && component.children.length === 0;
  const isDisabled = isEmptyContainer || isRoot;

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
  
  // FIX: Declared className variable
  const className = `${styles.sortableItem} ${isDragging ? styles.isDragging : ''}`;

  return (
    <div ref={setNodeRef} style={sortableStyle} className={className} data-id={component.id}>
      {/* Pass listeners to the nested SelectionWrapper */}
      {React.cloneElement(children as React.ReactElement<Partial<SelectionWrapperProps>>, { dndListeners: listeners })}
    </div>
  );
};