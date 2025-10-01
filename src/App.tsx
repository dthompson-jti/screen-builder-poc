// src/App.tsx
// This is the main application component.
// NOTE: This file is at the root of /src, so imports from sibling directories
// like /state or /components will start with './'.

import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { DndContext, DragOverlay, DropAnimation, defaultDropAnimationSideEffects, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { AppHeader } from './components/AppHeader';
import { ComponentBrowser } from './components/ComponentBrowser';
import { GeneralComponentsBrowser } from './components/GeneralComponentsBrowser';
import { ResizablePanel } from './components/ResizablePanel';
import { EditorCanvas } from './components/EditorCanvas';
import { TextInputPreview } from './components/TextInputPreview';
import { PropertiesPanel } from './components/PropertiesPanel';
import { MainToolbar } from './components/MainToolbar';
import { BrowserItemPreview } from './components/BrowserItemPreview';
import { PlaceholderPanel } from './components/PlaceholderPanel';
import { FullScreenPlaceholder } from './components/FullScreenPlaceholder';
import { DataBindingModal } from './components/DataBindingModal';
import { SettingsPage } from './components/SettingsPage';
import { useCanvasDnd } from './useCanvasDnd';
import {
  canvasComponentsAtom,
  selectedCanvasComponentIdAtom,
  isComponentBrowserVisibleAtom,
  activeToolbarTabAtom,
  appViewModeAtom,
  isPropertiesPanelVisibleAtom
} from './state/atoms';

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

// FIX: Increase both initial and min width by 32px.
const INITIAL_PANEL_WIDTH = 488; 
const MIN_PANEL_WIDTH = 501;

function App() {
  const canvasComponents = useAtomValue(canvasComponentsAtom);
  const setSelectedComponentId = useSetAtom(selectedCanvasComponentIdAtom);
  const isLeftPanelVisible = useAtomValue(isComponentBrowserVisibleAtom);
  const isRightPanelVisible = useAtomValue(isPropertiesPanelVisibleAtom);
  const activeTabId = useAtomValue(activeToolbarTabAtom);
  const viewMode = useAtomValue(appViewModeAtom);

  const { activeItem, overId, handleDragStart, handleDragOver, handleDragEnd } = useCanvasDnd();

  useEffect(() => {
    if (!isLeftPanelVisible) {
      setSelectedComponentId(null);
    }
  }, [isLeftPanelVisible, setSelectedComponentId]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );
  
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
    if (!isLeftPanelVisible) return null;
    
    if (activeTabId === 'data') {
      return <ComponentBrowser />;
    }
    if (activeTabId === 'general') {
      return <GeneralComponentsBrowser />;
    }
    
    return <PlaceholderPanel title={activeTabId} />;
  }
  
  const renderMainContent = () => {
    switch (viewMode) {
      case 'preview':
        return <FullScreenPlaceholder icon="visibility" title="Preview Mode" message="This is a placeholder for the form preview." />;
      case 'settings':
        return <SettingsPage />;
      case 'editor':
      default:
        return (
          <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
            <MainToolbar />
            <ResizablePanel 
              initialWidth={INITIAL_PANEL_WIDTH} 
              minWidth={MIN_PANEL_WIDTH} 
              position="left"
              isAnimatedVisible={isLeftPanelVisible}
            >
              {renderLeftPanelContent()}
            </ResizablePanel>
            <div style={{ flex: 1, minWidth: 0 }}>
              <EditorCanvas active={activeItem} overId={overId} isDragging={!!activeItem} />
            </div>
            <ResizablePanel 
                initialWidth={300} 
                minWidth={280} 
                position="right"
                isAnimatedVisible={isRightPanelVisible}
            >
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
        <DataBindingModal />
      </DndContext>
    </div>
  )
}

export default App;