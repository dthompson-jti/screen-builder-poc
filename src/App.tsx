// src/App.tsx
import { useAtomValue } from 'jotai';
import { DndContext, DragOverlay, DropAnimation, defaultDropAnimationSideEffects, PointerSensor, useSensor, useSensors, rectIntersection } from '@dnd-kit/core';

// Features
import { AppHeader } from './features/AppHeader/AppHeader';
import { ComponentBrowser } from './features/ComponentBrowser/ComponentBrowser';
import { GeneralComponentsBrowser } from './features/ComponentBrowser/GeneralComponentsBrowser';
import { PlaceholderPanel } from './features/ComponentBrowser/PlaceholderPanel';
import { EditorCanvas } from './features/Editor/EditorCanvas';
import { MainToolbar } from './features/Editor/MainToolbar';
import { PropertiesPanel } from './features/Editor/PropertiesPanel/PropertiesPanel';
import { DndDragOverlay } from './features/Editor/DndDragOverlay';
import { PreviewView } from './features/Preview/PreviewView';
import { SettingsPage } from './features/Settings/SettingsPage';

// Generic Components
import { ResizablePanel } from './components/ResizablePanel';
import { DataBindingModal } from './components/DataBindingModal';
import { ToastContainer } from './components/ToastContainer';

// Data and Hooks
import { useCanvasDnd } from './data/useCanvasDnd';
import { useEditorHotkeys } from './data/useEditorHotkeys';
import { useUrlSync } from './data/useUrlSync';
import {
  isComponentBrowserVisibleAtom,
  activeToolbarTabAtom,
  appViewModeAtom,
  isPropertiesPanelVisibleAtom,
  activeDndIdAtom,
} from './data/atoms';

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
const MAX_PANEL_WIDTH = 600;

function App() {
  const isLeftPanelVisible = useAtomValue(isComponentBrowserVisibleAtom);
  const isRightPanelVisible = useAtomValue(isPropertiesPanelVisibleAtom);
  const activeTabId = useAtomValue(activeToolbarTabAtom);
  const viewMode = useAtomValue(appViewModeAtom);
  const activeDndId = useAtomValue(activeDndIdAtom);
  
  const { activeDndItem, handleDragStart, handleDragOver, handleDragEnd } = useCanvasDnd();
  
  // Centralized hotkey management
  useEditorHotkeys();
  useUrlSync();

  // MODIFIED: Added an activation constraint to the PointerSensor.
  // This delay allows click events (select, edit) to fire before a drag is initiated.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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
        return <PreviewView />;
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
              maxWidth={MAX_PANEL_WIDTH}
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
                maxWidth={MAX_PANEL_WIDTH}
                position="right"
                isAnimatedVisible={isRightPanelVisible}
            >
              <PropertiesPanel />
            </ResizablePanel>
          </div>
        );
    }
  };

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart} 
      onDragOver={handleDragOver} 
      onDragEnd={handleDragEnd} 
      autoScroll={true}
      collisionDetection={rectIntersection}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <AppHeader />
        {renderMainContent()}
        <DataBindingModal />
        <ToastContainer />
      </div>
       <DragOverlay dropAnimation={dropAnimation}>
        {activeDndId ? <DndDragOverlay activeItem={activeDndItem} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;