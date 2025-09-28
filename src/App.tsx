// src/App.tsx
import { useState, useEffect } from 'react'; // FIX: Remove unused 'React' import
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
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
import { isComponentBrowserVisibleAtom, activeToolbarTabAtom, appViewModeAtom } from './appAtoms.ts';
import { FormComponent } from './types.ts';
import { BrowserItemPreview } from './component-browser/BrowserItemPreview.tsx';
import { PlaceholderPanel } from './PlaceholderPanel.tsx';
import { FullScreenPlaceholder } from './FullScreenPlaceholder'; // FIX: Remove .tsx extension from import path

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

const INITIAL_PANEL_WIDTH = 456; 
const MIN_PANEL_WIDTH = 437;

function App() {
  const [canvasComponents, setCanvasComponents] = useAtom(canvasComponentsAtom);
  const setSelectedComponentId = useSetAtom(selectedCanvasComponentIdAtom);
  const [isPanelVisible] = useAtom(isComponentBrowserVisibleAtom);
  const activeTabId = useAtomValue(activeToolbarTabAtom);
  const viewMode = useAtomValue(appViewModeAtom);

  const [activeItem, setActiveItem] = useState<Active | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);

  useEffect(() => {
    if (!isPanelVisible) {
      setSelectedComponentId(null);
    }
  }, [isPanelVisible, setSelectedComponentId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
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

  const renderLeftPanelContent = () => {
    if (!isPanelVisible) return null;
    
    if (activeTabId === 'data') {
      return <ComponentBrowser />;
    }
    
    return <PlaceholderPanel title={activeTabId} />;
  }
  
  const renderMainContent = () => {
    switch (viewMode) {
      case 'preview':
        return <FullScreenPlaceholder icon="visibility" title="Preview Mode" message="This is a placeholder for the form preview." />;
      case 'settings':
        return <FullScreenPlaceholder icon="settings" title="Settings" message="This is a placeholder for the form settings." />;
      case 'editor':
      default:
        return (
          <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
            <MainToolbar />
            <ResizablePanel 
              initialWidth={INITIAL_PANEL_WIDTH} 
              minWidth={MIN_PANEL_WIDTH} 
              position="left"
              isAnimatedVisible={isPanelVisible}
            >
              {renderLeftPanelContent()}
            </ResizablePanel>
            <div style={{ flex: 1, minWidth: 0 }}>
              <EditorCanvas active={activeItem} overId={overId} />
            </div>
            <ResizablePanel initialWidth={300} minWidth={280} position="right">
              <PropertiesPanel />
            </ResizablePanel>
            <DragOverlay dropAnimation={dropAnimation}>
              {renderDragOverlay()}
            </DragOverlay>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} autoScroll={false}>
        <AppHeader />
        {renderMainContent()}
      </DndContext>
    </div>
  )
}

export default App;