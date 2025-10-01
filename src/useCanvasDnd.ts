// src/useCanvasDnd.ts
import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { Active, DataRef, DragEndEvent, DragOverEvent, DragStartEvent, Over, UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { canvasComponentsAtom, selectedCanvasComponentIdAtom } from './state/atoms';
import { FormComponent } from './types';

export const useCanvasDnd = () => {
  const setCanvasComponents = useSetAtom(canvasComponentsAtom);
  const setSelectedId = useSetAtom(selectedCanvasComponentIdAtom);
  
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

    let newComponent: FormComponent = {
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

    setCanvasComponents((prev) => {
      const overIndex = findComponentIndex(over.id, prev);
      const newIndex = overIndex !== -1 ? overIndex : prev.length;
      const updatedComponents = [...prev.slice(0, newIndex), newComponent, ...prev.slice(newIndex)];
      setSelectedId(newComponent.id);
      return updatedComponents;
    });
  };
  
  const handleReorderComponent = (active: Active, over: Over) => {
    if (active.id !== over.id) {
      setCanvasComponents((items) => {
        const oldIndex = findComponentIndex(active.id, items);
        let newIndex = findComponentIndex(over.id, items);

        if (over.id === 'bottom-drop-zone') {
          newIndex = items.length;
        }
        
        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(items, oldIndex, newIndex);
        }
        return items;
      });
    }
  };
  
  const findComponentIndex = (id: UniqueIdentifier, components: FormComponent[]) => {
    if (id === 'bottom-drop-zone' || id === 'canvas-drop-area') {
      return components.length;
    }
    return components.findIndex(c => c.id === id);
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