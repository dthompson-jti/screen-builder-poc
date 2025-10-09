// src/data/useCanvasDnd.ts
import { useSetAtom, useAtomValue } from 'jotai';
import { Active, DragEndEvent, DragOverEvent, DragStartEvent, Over } from '@dnd-kit/core';
import { selectedCanvasComponentIdsAtom, activeDndIdAtom, overDndIdAtom } from './atoms';
import { canvasComponentsByIdAtom, commitActionAtom } from './historyAtoms';
import { DndData, FormComponent, LayoutComponent } from '../types';

export const useCanvasDnd = () => {
  const setSelectedIds = useSetAtom(selectedCanvasComponentIdsAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const setActiveId = useSetAtom(activeDndIdAtom);
  const setOverId = useSetAtom(overDndIdAtom);
  
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
    setSelectedIds([]);
  };
  
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? over.id : null);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!active || !over) {
      resetState();
      return;
    }
    
    if (active.id === over.id) {
      resetState();
      return;
    }
    
    const activeData = active.data.current as DndData;
    
    if (activeData?.isNew) {
      handleAddNewComponent(activeData, over);
    } else {
      handleMoveComponent(active, over);
    }
    
    resetState();
  };
  
  const handleAddNewComponent = (activeData: DndData, over: Over) => {
    const { name, type } = activeData;
    
    const { parentId, index } = getDropTarget(over);

    if (!parentId) {
      console.error('Could not determine a valid parent ID for the drop operation.');
      return;
    }
    
    if (type === 'layout') {
      const newComponent: Omit<LayoutComponent, 'id' | 'parentId'> = {
        name: 'Layout Container',
        componentType: 'layout',
        children: [],
        properties: { arrangement: 'stack', gap: 'md' },
      };
      commitAction({
        action: { type: 'COMPONENT_ADD', payload: { component: newComponent, parentId, index } },
        message: `Add 'Layout Container'`
      });
    } else {
      const newComponent: Omit<FormComponent, 'id' | 'parentId'> = {
        name,
        componentType: 'widget',
        type: 'text-input',
        origin: activeData.origin,
        binding: null
      };
      commitAction({
        action: { type: 'COMPONENT_ADD', payload: { component: newComponent, parentId, index } },
        message: `Add '${name}'`
      });
    }
  };
  
  const handleMoveComponent = (active: Active, over: Over) => {
    const activeId = active.id as string;
    const { parentId: newParentId, index: newIndex } = getDropTarget(over);
    
    // For moves, the active item is one of our components, so its parent is known
    const oldParentId = allComponents[activeId]?.parentId;
    if (!oldParentId) return;

    const oldParent = allComponents[oldParentId];
    if (!oldParent || oldParent.componentType !== 'layout') return;
    
    const oldIndex = oldParent.children.indexOf(activeId);

    if (oldParentId === newParentId) {
      if (typeof oldIndex === 'number' && oldIndex !== newIndex) {
        commitAction({
          action: { type: 'COMPONENT_REORDER', payload: { componentId: activeId, parentId: oldParentId, oldIndex, newIndex } },
          message: `Reorder '${(active.data.current as DndData)?.name}'`
        });
      }
    } else if (oldParentId && newParentId) {
      commitAction({
        action: { type: 'COMPONENT_MOVE', payload: { componentId: activeId, oldParentId, newParentId, newIndex } },
        message: `Move '${(active.data.current as DndData)?.name}'`
      });
    }
  };

  const getDropTarget = (over: Over): { parentId: string; index: number } => {
    const overId = over.id as string;
    const overComponent = allComponents[overId];

    if (!overComponent) {
      console.warn(`Could not find component for overId: ${overId}. Defaulting to root.`);
      return { parentId: 'root', index: 0 };
    }

    // Case 1: Dropping on a layout container.
    // The new item should be added to the end of this container.
    if (overComponent.componentType === 'layout') {
      return { parentId: overId, index: overComponent.children.length };
    }
    
    // Case 2: Dropping on a regular component (widget/field).
    // The new item should be placed in the *same container* as the item being
    // dropped on, right at its index.
    const parent = allComponents[overComponent.parentId];
    if (parent && parent.componentType === 'layout') {
      const indexInParent = parent.children.indexOf(overId);
      return { parentId: overComponent.parentId, index: indexInParent };
    }

    // Fallback: This should rarely happen but provides a safe default.
    console.warn('Could not determine drop target parent. Defaulting to root.');
    return { parentId: 'root', index: 0 };
  };
  
  const resetState = () => {
    setActiveId(null);
    setOverId(null);
  };
  
  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
};