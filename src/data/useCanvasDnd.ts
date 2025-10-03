// src/data/useCanvasDnd.ts
import { useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Active, DataRef, DragEndEvent, DragOverEvent, DragStartEvent, Over, UniqueIdentifier } from '@dnd-kit/core';
import { selectedCanvasComponentIdAtom } from './atoms';
import { commitActionAtom, canvasComponentsAtom } from './historyAtoms';
import { FormComponent } from '../types';

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
    
    const isNew = active.data.current?.isNew;

    if (isNew) {
      handleAddNewComponent(active.data, over);
    } else {
      handleReorderComponent(active, over);
    }
    
    resetState();
  };
  
  const handleAddNewComponent = (data: DataRef, over: Over) => {
    const activeData = data.current;
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
    
    const overIndex = canvasComponents.findIndex((c: FormComponent) => c.id === over.id || c.id === over.data?.current?.sortable?.containerId);

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
          message: `Reorder '${active.data.current?.name || 'component'}'`
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