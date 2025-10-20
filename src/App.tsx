// src/App.tsx
import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { DndContext, DragOverlay, DropAnimation, defaultDropAnimationSideEffects, PointerSensor, useSensor, useSensors, rectIntersection } from '@dnd-kit/core';

// Features
import { AppHeader } from './features/AppHeader/AppHeader';
import { ComponentBrowser } from './features/ComponentBrowser/ComponentBrowser';
import { GeneralComponentsBrowser } from './features/ComponentBrowser/GeneralComponentsBrowser';
import { PlaceholderPanel } from './features/ComponentBrowser/PlaceholderPanel';
import { EditorCanvas } from './features/Editor/EditorCanvas';
import { MainToolbar } from './features/Editor/MainToolbar';
import { PropertiesPanel } from './features/Editor/PropertiesPanel/PropertiesPanel';
import { BrowserItemPreview } from './features/Editor/previews/BrowserItemPreview';
import { ContainerPreview } from './features/Editor/previews/ContainerPreview';
import PlainTextPreview from './features/Editor/previews/PlainTextPreview';
import { TextInputPreview } from './features/Editor/previews/TextInputPreview';
import DropdownPreview from './features/Editor/previews/DropdownPreview';
import RadioButtonsPreview from './features/Editor/previews/RadioButtonsPreview';
import LinkPreview from './features/Editor/previews/LinkPreview';
import { PreviewView } from './features/Preview/PreviewView';
import { SettingsPage } from './features/Settings/SettingsPage';

// Generic Components
import { ResizablePanel } from './components/ResizablePanel';
import { DataBindingModal } from './components/DataBindingModal';
import { ToastContainer } from './components/ToastContainer';
import { CanvasContextMenu } from './features/Editor/CanvasContextMenu';

// Data and Hooks
import { useCanvasDnd } from './data/useCanvasDnd';
import { useUndoRedo } from './data/useUndoRedo';
import { useUrlSync } from './data/useUrlSync';
import {
  canvasInteractionAtom,
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

const ContextMenuRenderer = () => {
  return <CanvasContextMenu />;
};

function App() {
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const setInteractionState = useSetAtom(canvasInteractionAtom);
  const isLeftPanelVisible = useAtomValue(isComponentBrowserVisibleAtom);
  const isRightPanelVisible = useAtomValue(isPropertiesPanelVisibleAtom);
  const activeTabId = useAtomValue(activeToolbarTabAtom);
  const viewMode = useAtomValue(appViewModeAtom);
  const activeDndId = useAtomValue(activeDndIdAtom);
  
  const { activeDndItem, handleDragStart, handleDragOver, handleDragEnd } = useCanvasDnd();
  const { undo, redo } = useUndoRedo();
  useUrlSync();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isTyping = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
      if (isTyping) return;

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
      setInteractionState({ mode: 'idle' });
    }
  }, [isLeftPanelVisible, setInteractionState]);

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
    const { isNew, name, icon } = activeData || {};

    if (isNew) {
      return <BrowserItemPreview name={name ?? ''} icon={icon ?? ''} />;
    }
    
    const componentId = activeDndItem.id;
    if (typeof componentId !== 'string') return null;

    const activeComponent = allComponents[componentId];
    if (!activeComponent) return null;
    
    if (activeComponent.componentType === 'layout') {
      return <ContainerPreview component={activeComponent} allComponents={allComponents} />;
    }
    
    if (activeComponent.componentType === 'widget' || activeComponent.componentType === 'field') {
      const formComponent = activeComponent;
      const commonProps = {
          label: formComponent.properties.label,
          content: formComponent.properties.content,
          required: formComponent.properties.required,
          hintText: formComponent.properties.hintText,
          placeholder: formComponent.properties.placeholder,
          isEditing: false,
      };
      
      let previewElement;
      switch (formComponent.properties.controlType) {
          case 'plain-text':
              previewElement = <PlainTextPreview {...commonProps} textElement={formComponent.properties.textElement} />;
              break;
          case 'dropdown':
              previewElement = <DropdownPreview {...commonProps} />;
              break;
          case 'radio-buttons':
              previewElement = <RadioButtonsPreview {...commonProps} />;
              break;
          case 'link':
              previewElement = <LinkPreview {...commonProps} />;
              break;
          case 'text-input':
          default:
              previewElement = <TextInputPreview {...commonProps} />;
              break;
      }
      return <div style={{ pointerEvents: 'none', opacity: 0.85 }}>{previewElement}</div>;
    }
    
    return null;
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
        <ContextMenuRenderer />
      </div>
       <DragOverlay dropAnimation={dropAnimation}>
        {activeDndId ? renderDragOverlay() : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;