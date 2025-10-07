// src/data/useCanvasDnd.ts
import { useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Active, DragEndEvent, DragOverEvent, DragStartEvent, Over, UniqueIdentifier } from '@dnd-kit/core';
import { selectedCanvasComponentIdAtom } from './atoms';
import { commitActionAtom, canvasComponentsAtom } from './historyAtoms';
// FIX: Import the new DndData type to ensure type safety.
import { FormComponent, DndData } from '../types';

export const useCanvasDnd = () => {
  const canvasComponents = useAtomValue(canvasComponentsAtom);
  const setSelectedId = useSetAtom(selectedCanvasComponentIdAtom);
  const commitAction = useSetAtom(commitActionAtom);
  
  const [activeItem, setActiveItem] = useState<Active | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  
  const handleDragStart = (event: DragStartEvent) => {
    setActiveItem(event.active);
    setSelectedId(null);
  };
  
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? over.id : null);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      resetState();
      return;
    }
    
    // FIX: Use a type assertion to safely access the data.
    // This resolves all the `no-unsafe-*` errors in this function.
    const activeData = active.data.current as DndData;
    const overData = over.data.current as DndData; // Also type the 'over' data

    if (activeData?.isNew) {
      handleAddNewComponent(activeData, over, overData);
    } else {
      handleReorderComponent(active, over);
    }
    
    resetState();
  };
  
  // FIX: Update function signature to accept the typed data
  const handleAddNewComponent = (activeData: DndData, over: Over, overData: DndData) => {
    if (!activeData) return;

    const newComponent: FormComponent = {
      id: `comp-${Date.now()}`,
      name: activeData.name,
      type: activeData.type,
      origin: activeData.origin,
    };

    if (activeData.origin === 'data') {
        const componentData = activeData.data || {};
        const nodeName = componentData.nodeName;
        const nodeId = componentData.nodeId;
        if (nodeName && nodeId) {
             newComponent.binding = {
                nodeId: nodeId,
                nodeName: nodeName,
                fieldId: activeData.id,
                fieldName: activeData.name,
                path: `${nodeName} > ${activeData.name}`,
            }
        }
    }
    
    // FIX: Safely access containerId from the typed overData
    const overIndex = canvasComponents.findIndex((c: FormComponent) => c.id === over.id || c.id === overData?.sortable?.containerId);

    commitAction({
      action: { type: 'COMPONENT_ADD', payload: { component: newComponent, index: overIndex } },
      message: `Add '${newComponent.name}'`
    });

    setSelectedId(newComponent.id);
  };
  
  const handleReorderComponent = (active: Active, over: Over) => {
    if (active.id !== over.id) {
      const oldIndex = canvasComponents.findIndex((c: FormComponent) => c.id === active.id);
      let newIndex = canvasComponents.findIndex((c: FormComponent) => c.id === over.id);

      if (over.id === 'bottom-drop-zone' && oldIndex !== -1) {
        // When dropping at the end, the new index should be the last valid index.
        newIndex = canvasComponents.length -1;
      }
      
      if (oldIndex !== -1 && newIndex !== -1) {
        commitAction({
          action: { type: 'COMPONENT_REORDER', payload: { oldIndex, newIndex } },
          message: `Reorder '${(active.data.current as DndData)?.name || 'component'}'`
        });
      }
    }
  };
  
  const resetState = () => {
    setActiveItem(null);
    setOverId(null);
  };
  
  return {
    activeItem,
    overId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
};