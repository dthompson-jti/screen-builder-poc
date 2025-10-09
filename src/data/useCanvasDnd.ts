// src/data/useCanvasDnd.ts
import { useSetAtom, useAtomValue } from 'jotai';
import { Active, DragEndEvent, DragOverEvent, DragStartEvent, Over, ClientRect } from '@dnd-kit/core';
import { selectedCanvasComponentIdsAtom, activeDndIdAtom, overDndIdAtom, dropPlaceholderAtom } from './atoms';
import { canvasComponentsByIdAtom, commitActionAtom } from './historyAtoms';
import { DndData, CanvasComponent } from '../types';

const findHoveredContainer = (overId: string, allComponents: Record<string, CanvasComponent>): string | null => {
  const overComponent = allComponents[overId];
  if (!overComponent) return null;
  if (overComponent.componentType === 'layout') return overId;
  if (overComponent.parentId) return overComponent.parentId;
  return null;
};

export const useCanvasDnd = () => {
  const setSelectedIds = useSetAtom(selectedCanvasComponentIdsAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const setActiveId = useSetAtom(activeDndIdAtom);
  const setOverId = useSetAtom(overDndIdAtom);
  const setDropPlaceholder = useSetAtom(dropPlaceholderAtom);
  
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
    setSelectedIds([]);
  };
  
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const draggingRect = active.rect.current.translated;
    if (!over || !draggingRect) {
      setOverId(null);
      setDropPlaceholder(null);
      return;
    }
    const overId = over.id as string;
    const hoveredContainerId = findHoveredContainer(overId, allComponents);
    setOverId(hoveredContainerId);
    const dropTarget = getDropTarget(over, draggingRect, allComponents);
    if (dropTarget) {
      setDropPlaceholder(dropTarget);
    } else {
      setDropPlaceholder(null);
    }
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) {
      resetState();
      return;
    }
    const draggingRect = active.rect.current.translated;
    if (!draggingRect) {
        resetState();
        return;
    }
    const finalDropTarget = getDropTarget(over, draggingRect, allComponents);
    if (!finalDropTarget) {
      resetState();
      return;
    }
    const activeData = active.data.current as DndData;
    if (activeData?.isNew) {
      handleAddNewComponent(activeData, finalDropTarget);
    } else {
      handleMoveComponent(active, finalDropTarget);
    }
    resetState();
  };
  
  const handleAddNewComponent = (activeData: DndData, dropTarget: { parentId: string, index: number }) => {
    const { name, type, origin } = activeData;
    const { parentId, index } = dropTarget;
    
    commitAction({
      action: {
        type: 'COMPONENT_ADD',
        payload: {
          componentType: type as 'layout' | 'widget',
          name,
          origin,
          parentId,
          index,
        }
      },
      message: `Add '${name}'`
    });
  };
  
  const handleMoveComponent = (active: Active, dropTarget: { parentId: string, index: number }) => {
    const activeId = active.id as string;
    const { parentId: newParentId, index: newIndex } = dropTarget;
    const oldParentId = allComponents[activeId]?.parentId;
    if (!oldParentId) return;
    const oldParent = allComponents[oldParentId];
    if (!oldParent || oldParent.componentType !== 'layout') return;
    const oldIndex = oldParent.children.indexOf(activeId);
    if (oldParentId === newParentId) {
      const adjustedNewIndex = oldIndex < newIndex ? newIndex -1 : newIndex;
      if (oldIndex !== adjustedNewIndex) {
        commitAction({
          action: { type: 'COMPONENT_REORDER', payload: { componentId: activeId, parentId: oldParentId, oldIndex, newIndex: adjustedNewIndex } },
          message: `Reorder '${(active.data.current as DndData)?.name}'`
        });
      }
    } else {
      commitAction({
        action: { type: 'COMPONENT_MOVE', payload: { componentId: activeId, oldParentId, newParentId, newIndex } },
        message: `Move '${(active.data.current as DndData)?.name}'`
      });
    }
  };

  const getDropTarget = (
    over: Over, 
    draggingRect: ClientRect, 
    allComponents: Record<string, CanvasComponent>
  ): { parentId: string; index: number; rect: ClientRect | null; isGrid: boolean } | null => {
    const overId = over.id as string;
    const overComponent = allComponents[overId];
    if (!overComponent) return null;

    // Case 1: Dropping directly on an empty layout container
    if (overComponent.componentType === 'layout' && overComponent.children.length === 0) {
      // For an empty container, the placeholder rect is calculated in the component itself
      return { parentId: overId, index: 0, rect: null, isGrid: overComponent.properties.arrangement === 'grid' };
    }

    // Case 2: Dropping on a component or a populated container
    const parentId = overComponent.componentType === 'layout' ? overId : overComponent.parentId;
    const parent = allComponents[parentId];
    if (!parent || parent.componentType !== 'layout') return null;

    const isGrid = parent.properties.arrangement === 'grid';
    const children = parent.children;
    const overRect = over.rect;
    
    // If dropping on the container itself (not a child), append to the end
    if (overId === parentId) {
        const lastChildId = children[children.length - 1];
        const lastChildNode = lastChildId ? document.querySelector(`[data-id="${lastChildId}"]`) : null;
        const lastChildRect = lastChildNode?.getBoundingClientRect();

        const rect = lastChildRect ? {
            ...lastChildRect,
            top: lastChildRect.bottom,
            height: 4,
        } : null;

        return { parentId, index: children.length, rect, isGrid };
    }

    const indexInParent = children.indexOf(overId);
    
    // STABILIZATION FIX: Use consistent top/bottom logic for all container types for now.
    // This provides a stable horizontal line indicator and fixes the buggy grid indicator.
    const isAfter = draggingRect.top > overRect.top + overRect.height / 2;
    const finalIndex = isAfter ? indexInParent + 1 : indexInParent;
    const placeholderRect: ClientRect = {
        top: isAfter ? overRect.bottom : overRect.top,
        left: overRect.left,
        width: overRect.width,
        height: 4, // A consistent 4px line
        right: overRect.right,
        bottom: isAfter ? overRect.bottom + 4 : overRect.top + 4,
    };

    return { parentId, index: finalIndex, rect: placeholderRect, isGrid };
  };
  
  const resetState = () => {
    setActiveId(null);
    setOverId(null);
    setDropPlaceholder(null);
  };
  
  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
};