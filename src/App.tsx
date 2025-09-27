// src/App.tsx
import { useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
// FIX: Revert sensor imports back to standard PointerSensor
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, DragOverEvent, UniqueIdentifier, Active, DropAnimation, defaultDropAnimationSideEffects, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { AppHeader } from './AppHeader';
import { ComponentBrowser } from './component-browser/ComponentBrowser';
import { ResizablePanel } from './ResizablePanel.tsx';
import { EditorCanvas } from './editor-canvas/EditorCanvas.tsx';
import { TextInputPreview } from './editor-canvas/TextInputPreview.tsx';
import { canvasComponentsAtom, selectedCanvasComponentIdAtom } from './editor-canvas/canvasAtoms.ts';
import { PropertiesPanel } from './properties-panel/PropertiesPanel.tsx';
import { MainToolbar } from './MainToolbar.tsx';
import { isComponentBrowserVisibleAtom } from './appAtoms.ts';
import { FormComponent } from './types.ts';
import { BrowserItemPreview } from './component-browser/BrowserItemPreview.tsx';
// FIX: Removed import of CustomPointerSensor

const dropAnimation: DropAnimation = {
  duration: 0,
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0',
      },
    },
  }),
};

function App() {
  const [canvasComponents, setCanvasComponents] = useAtom(canvasComponentsAtom);
  const setSelectedComponentId = useSetAtom(selectedCanvasComponentIdAtom);
  const isPanelVisible = useAtomValue(isComponentBrowserVisibleAtom);
  
  const [activeItem, setActiveItem] = useState<Active | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);

  // FIX: Revert to standard PointerSensor with activation constraint (delay)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

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
    
    if (active.data.current?.isNew) {
      const { id, name } = active.data.current;
      const newId = `${id.toString()}-${Date.now()}`;
      const newComponent: FormComponent = { id: newId, type: id.toString(), name: name };

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
    
    if (active.id !== over.id) {
      const oldIndex = canvasComponents.findIndex((c: FormComponent) => c.id === active.id);
      
      if (over.id === 'bottom-drop-zone') {
        const newIndex = canvasComponents.length;
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
  
  const renderDragOverlay = () => {
    if (!activeItem) return null;
    
    const isNew = activeItem.data.current?.isNew;
    const name = activeItem.data.current?.name;
    const icon = activeItem.data.current?.icon;

    if (isNew) {
      return <BrowserItemPreview name={name} icon={icon} />;
    } else {
      const activeComponent = canvasComponents.find(c => c.id === activeItem.id);
      if (!activeComponent) return null;
      return <div style={{ pointerEvents: 'none' }}><TextInputPreview label={activeComponent.name} /></div>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <AppHeader />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} autoScroll={false}>
          <MainToolbar />
          {isPanelVisible && (
            <ResizablePanel initialWidth={380} minWidth={364} position="left">
              <ComponentBrowser />
            </ResizablePanel>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <EditorCanvas active={activeItem} overId={overId} />
          </div>
          <ResizablePanel initialWidth={300} minWidth={280} position="right">
            <PropertiesPanel />
          </ResizablePanel>
          
          <DragOverlay dropAnimation={dropAnimation}>
            {renderDragOverlay()}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}

export default App;