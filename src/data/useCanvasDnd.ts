// src/data/useCanvasDnd.ts

import { useState } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { Active, DragEndEvent, DragOverEvent, DragStartEvent, Over, ClientRect } from '@dnd-kit/core';
import { activeDndIdAtom, overDndIdAtom, dropPlaceholderAtom, canvasInteractionAtom } from './atoms';
import { canvasComponentsByIdAtom, commitActionAtom } from './historyAtoms';
import { DndData, CanvasComponent } from '../types';

const findHoveredContainer = (overId: string, allComponents: Record<string, CanvasComponent>): string | null => {
  const overComponent = allComponents[overId];
  if (!overComponent) return null;
  if (overComponent.componentType === 'layout') return overId;
  if (overComponent.parentId) {
      const parent = allComponents[overComponent.parentId];
      if (parent && parent.componentType === 'layout') {
          return parent.id;
      }
  }
  return null;
};

// Helper to get the display name/label
const getComponentName = (component: CanvasComponent): string => {
    if (component.componentType === 'layout') {
        return component.name;
    }
    // Handle form components
    if (component.properties.controlType === 'plain-text') {
        return component.properties.content?.substring(0, 30) || 'Plain Text';
    }
    return component.properties.label;
};

export const useCanvasDnd = () => {
  const setInteractionState = useSetAtom(canvasInteractionAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const setActiveId = useSetAtom(activeDndIdAtom);
  const setOverId = useSetAtom(overDndIdAtom);
  const setDropPlaceholder = useSetAtom(dropPlaceholderAtom);
  const [activeDndItem, setActiveDndItem] = useState<Active | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
    setActiveDndItem(event.active);
    setInteractionState({ mode: 'idle' });
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
    const { name, type, origin, controlType } = activeData;
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
          controlType,
          bindingData: activeData.data ? {
            // FIX: Use a safe string conversion to satisfy both TypeScript and ESLint.
            fieldId: String(activeData.id),
            ...activeData.data
          } : undefined,
        }
      },
      message: `Add '${name}'`
    });
  };
  
  const handleMoveComponent = (active: Active, dropTarget: { parentId: string, index: number }) => {
    const activeId = active.id as string;
    const { parentId: newParentId, index: newIndex } = dropTarget;
    const oldComponent = allComponents[activeId];
    if (!oldComponent) return;

    const oldParentId = oldComponent.parentId;
    if (!oldParentId) return;
    const oldParent = allComponents[oldParentId];
    if (!oldParent || oldParent.componentType !== 'layout') return;

    const oldIndex = oldParent.children.indexOf(activeId);
    if (oldParentId === newParentId) {
      const adjustedNewIndex = oldIndex < newIndex ? newIndex -1 : newIndex;
      if (oldIndex !== adjustedNewIndex) {
        commitAction({
          action: { type: 'COMPONENT_REORDER', payload: { componentId: activeId, parentId: oldParentId, oldIndex, newIndex: adjustedNewIndex } },
          message: `Reorder '${getComponentName(oldComponent)}'`
        });
      }
    } else {
      commitAction({
        action: { type: 'COMPONENT_MOVE', payload: { componentId: activeId, oldParentId, newParentId, newIndex } },
        message: `Move '${getComponentName(oldComponent)}'`
      });
    }
  };

  const getDropTarget = (
    over: Over, 
    draggingRect: ClientRect, 
    allComponents: Record<string, CanvasComponent>
  ): { parentId: string; index: number; viewportRect: ClientRect | null; isGrid: boolean } | null => {
    const overId = over.id as string;
    const overComponent = allComponents[overId];
    if (!overComponent) return null;

    if (overComponent.componentType === 'layout' && overComponent.children.length === 0) {
      return { parentId: overId, index: 0, viewportRect: null, isGrid: overComponent.properties.arrangement === 'grid' };
    }

    const parentId = overComponent.componentType === 'layout' ? overId : overComponent.parentId;
    if (!parentId) return null;
    const parent = allComponents[parentId];
    if (!parent || parent.componentType !== 'layout') return null;

    const isGrid = parent.properties.arrangement === 'grid';
    const children = parent.children;
    const overRect = over.rect;
    
    if (overId === parentId) {
        const lastChildId = children[children.length - 1];
        const lastChildNode = lastChildId ? document.querySelector(`[data-id="${lastChildId}"]`) : null;
        const lastChildRect = lastChildNode?.getBoundingClientRect();

        const viewportRect = lastChildRect ? {
            ...lastChildRect,
            top: lastChildRect.bottom,
            height: 4,
        } : null;

        return { parentId, index: children.length, viewportRect, isGrid };
    }

    const indexInParent = children.indexOf(overId);
    if (indexInParent === -1) return null;
    
    const isAfter = draggingRect.top > overRect.top + overRect.height / 2;
    const finalIndex = isAfter ? indexInParent + 1 : indexInParent;
    const placeholderViewportRect: ClientRect = {
        top: isAfter ? overRect.bottom : overRect.top,
        left: overRect.left,
        width: overRect.width,
        height: 4, 
        right: overRect.right,
        bottom: isAfter ? overRect.bottom + 4 : overRect.top + 4,
    };

    return { parentId, index: finalIndex, viewportRect: placeholderViewportRect, isGrid };
  };
  
  const resetState = () => {
    setActiveId(null);
    setOverId(null);
    setDropPlaceholder(null);
    setActiveDndItem(null);
  };
  
  return {
    activeDndItem,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
};