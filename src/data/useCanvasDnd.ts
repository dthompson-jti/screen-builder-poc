// src/data/useCanvasDnd.ts
import { useSetAtom, useAtomValue } from 'jotai';
import { Active, DragEndEvent, DragOverEvent, DragStartEvent, Over, ClientRect } from '@dnd-kit/core';
import { selectedCanvasComponentIdsAtom, activeDndIdAtom, overDndIdAtom, dropIndicatorAtom } from './atoms';
import { canvasComponentsByIdAtom, commitActionAtom } from './historyAtoms';
import { DndData, FormComponent, LayoutComponent, CanvasComponent } from '../types';

// Helper to determine which container is being hovered over
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
  const setDropIndicator = useSetAtom(dropIndicatorAtom);
  
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
    setSelectedIds([]);
  };
  
  const handleDragOver = (event: DragOverEvent) => {
    // FIX: Destructure 'active' from the event and use 'active.rect' instead of 'draggingRect'
    const { active, over } = event;
    const draggingRect = active.rect.current.translated;

    if (!over || !draggingRect) {
      setOverId(null);
      setDropIndicator(null);
      return;
    }

    const overId = over.id as string;
    const hoveredContainerId = findHoveredContainer(overId, allComponents);
    setOverId(hoveredContainerId);

    const dropTarget = getDropTarget(over, draggingRect, allComponents);
    if (dropTarget) {
      setDropIndicator(dropTarget);
    } else {
      setDropIndicator(null);
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
    const { name, type } = activeData;
    const { parentId, index } = dropTarget;
    
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

  const getDropTarget = (over: Over, draggingRect: ClientRect, allComponents: Record<string, CanvasComponent>): { parentId: string; index: number } | null => {
    const overId = over.id as string;
    const overComponent = allComponents[overId];
  
    if (!overComponent) return null;
  
    if (overComponent.componentType === 'layout') {
      return { parentId: overId, index: overComponent.children.length };
    }
  
    const parent = allComponents[overComponent.parentId];
    if (parent && parent.componentType === 'layout') {
      const overNodeRect = over.rect;
      const overNodeMiddleY = overNodeRect.top + overNodeRect.height / 2;
      const indexInParent = parent.children.indexOf(overId);
  
      let finalIndex;
      if (draggingRect.top + draggingRect.height / 2 < overNodeMiddleY) {
        finalIndex = indexInParent;
      } else {
        finalIndex = indexInParent + 1;
      }

      return { parentId: overComponent.parentId, index: finalIndex };
    }
  
    return null;
  };
  
  const resetState = () => {
    setActiveId(null);
    setOverId(null);
    setDropIndicator(null);
  };
  
  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
};