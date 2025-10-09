// src/App.tsx
// This is the main application component.
// NOTE: This file is at the root of /src, so imports from sibling directories
// like /state or /components will start with './'.

import React, { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { DndContext, DragOverlay, DropAnimation, defaultDropAnimationSideEffects, PointerSensor, useSensor, useSensors, rectIntersection, Active } from '@dnd-kit/core';
import { AppHeader } from './views/AppHeader';
import { ComponentBrowser } from './views/ComponentBrowser';
import { GeneralComponentsBrowser } from './views/GeneralComponentsBrowser';
import { ResizablePanel } from './components/ResizablePanel';
import { EditorCanvas } from './views/EditorCanvas';
import { TextInputPreview } from './components/TextInputPreview';
import { PropertiesPanel } from './views/PropertiesPanel';
import { MainToolbar } from './views/MainToolbar';
import { BrowserItemPreview } from './components/BrowserItemPreview';
import { ContainerPreview } from './components/ContainerPreview';
import { PlaceholderPanel } from './components/PlaceholderPanel';
import { FullScreenPlaceholder } from './components/FullScreenPlaceholder';
import { DataBindingModal } from './components/DataBindingModal';
import { SettingsPage } from './views/SettingsPage';
import { ToastContainer } from './components/ToastContainer';
import { useCanvasDnd } from './data/useCanvasDnd';
import { useUndoRedo } from './data/useUndoRedo';
import {
  selectedCanvasComponentIdsAtom,
  isComponentBrowserVisibleAtom,
  activeToolbarTabAtom,
  appViewModeAtom,
  isPropertiesPanelVisibleAtom,
  activeDndIdAtom,
} from './data/atoms';
import { canvasComponentsByIdAtom } from './data/historyAtoms';
import { DndData } from './types';

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

const INITIAL_PANEL_WIDTH = 320;
const MIN_PANEL_WIDTH = 280;

function App() {
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const setSelectedComponentIds = useSetAtom(selectedCanvasComponentIdsAtom);
  const isLeftPanelVisible = useAtomValue(isComponentBrowserVisibleAtom);
  const isRightPanelVisible = useAtomValue(isPropertiesPanelVisibleAtom);
  const activeTabId = useAtomValue(activeToolbarTabAtom);
  const viewMode = useAtomValue(appViewModeAtom);
  const activeDndId = useAtomValue(activeDndIdAtom);
  const [activeDndItem, setActiveDndItem] = React.useState<Active | null>(null);

  const { handleDragStart, handleDragOver, handleDragEnd } = useCanvasDnd();
  const { undo, redo } = useUndoRedo();

  // Global keyboard listener for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isUndo = (isMac ? event.metaKey : event.ctrlKey) && event.key === 'z' && !event.shiftKey;
      const isRedo = (isMac ? event.metaKey && event.shiftKey : event.ctrlKey) && (event.key === 'y' || (isMac && event.key === 'z'));

      if (isUndo) {
        event.preventDefault();
        undo();
      } else if (isRedo) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo]);

  useEffect(() => {
    if (!isLeftPanelVisible) {
      setSelectedComponentIds([]);
    }
  }, [isLeftPanelVisible, setSelectedComponentIds]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );

  const renderDragOverlay = () => {
    if (!activeDndItem) return null;

    const activeData = activeDndItem.data.current as DndData;

    const isNew = activeData?.isNew;
    const name = activeData?.name;
    const icon = activeData?.icon;

    if (isNew) {
      return <BrowserItemPreview name={name ?? ''} icon={icon ?? ''} />;
    } else {
      const activeComponent = allComponents[activeDndItem.id as string];
      if (!activeComponent) return null;
      
      if (activeComponent.componentType === 'layout') {
        return <ContainerPreview component={activeComponent} allComponents={allComponents} />;
      }
      
      return <div style={{ pointerEvents: 'none' }}><TextInputPreview label={activeComponent.name} /></div>;
    }
  };

  const renderLeftPanelContent = () => {
    if (!isLeftPanelVisible) return null;

    if (activeTabId === 'data') {
      return <ComponentBrowser />;
    }
    if (activeTabId === 'general' || activeTabId === 'layout') {
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
              <EditorCanvas />
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
              {activeDndId ? renderDragOverlay() : null}
            </DragOverlay>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <DndContext 
        sensors={sensors} 
        onDragStart={(e) => {
          setActiveDndItem(e.active);
          handleDragStart(e);
        }} 
        onDragOver={handleDragOver} 
        onDragEnd={(e) => {
          handleDragEnd(e);
          setActiveDndItem(null);
        }} 
        autoScroll={true}
        collisionDetection={rectIntersection}
      >
        <AppHeader />
        {renderMainContent()}
        <DataBindingModal />
        <ToastContainer />
      </DndContext>
    </div>
  )
}

export default App;