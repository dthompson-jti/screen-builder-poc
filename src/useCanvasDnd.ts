// src/useCanvasDnd.ts
import { useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { DragEndEvent, DragStartEvent, DragOverEvent, UniqueIdentifier, Active } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import {
  canvasComponentsAtom,
  selectedCanvasComponentIdAtom,
  activeToolbarTabAtom,
} from './state/atoms'; // This path is correct as useCanvasDnd.ts is in src/
import { FormComponent, BoundData, DraggableComponent } from './types';

/**
 * A custom hook to encapsulate all Drag-and-Drop logic for the editor canvas.
 */
export const useCanvasDnd = () => {
  const [canvasComponents, setCanvasComponents] = useAtom(canvasComponentsAtom);
  const setSelectedComponentId = useSetAtom(selectedCanvasComponentIdAtom);
  const [activeTabId] = useAtom(activeToolbarTabAtom);

  const [activeItem, setActiveItem] = useState<Active | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveItem(event.active);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? over.id : null);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    
    setActiveItem(null);
    setOverId(null);

    if (!over) return;
    
    // --- Logic for adding a NEW component from the browser ---
    if (active.data.current?.isNew) {
      const draggedData = active.data.current as DraggableComponent;
      const newId = `${draggedData.id}-${Date.now()}`;
      const origin = activeTabId === 'data' ? 'data' : 'general';
      
      let binding: BoundData | null = null;
      if (origin === 'data' && draggedData.nodeId && draggedData.nodeName && draggedData.path) {
        binding = {
          nodeId: draggedData.nodeId,
          nodeName: draggedData.nodeName,
          fieldId: draggedData.id,
          fieldName: draggedData.name,
          path: draggedData.path,
        };
      }

      const newComponent: FormComponent = { 
        id: newId, 
        type: draggedData.id.toString(), 
        name: draggedData.name, 
        origin, 
        binding 
      };

      if (over.id === 'canvas-drop-area' || over.id === 'bottom-drop-zone') {
        setCanvasComponents((prev) => [...prev, newComponent]);
        setSelectedComponentId(newId);
        return;
      }

      const overIndex = canvasComponents.findIndex((c: FormComponent) => c.id === over.id);
      if (overIndex !== -1) {
        setCanvasComponents((prev: FormComponent[]) => [
          ...prev.slice(0, overIndex),
          newComponent,
          ...prev.slice(overIndex),
        ]);
        setSelectedComponentId(newId);
      }
      return;
    }
    
    // --- Logic for REORDERING an existing component on the canvas ---
    if (active.id !== over.id) {
      const oldIndex = canvasComponents.findIndex((c: FormComponent) => c.id === active.id);
      
      if (over.id === 'bottom-drop-zone') {
        const newIndex = canvasComponents.length - 1;
        if (oldIndex !== newIndex) {
          setCanvasComponents((items) => arrayMove(items, oldIndex, newIndex));
        }
        return;
      }
      
      const newIndex = canvasComponents.findIndex((c: FormComponent) => c.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        setCanvasComponents((items: FormComponent[]) => arrayMove(items, oldIndex, newIndex));
      }
    }
  };

  return {
    activeItem,
    overId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
};