// src/components/PropertiesPanel.tsx
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import {
  canvasComponentsAtom,
  selectedCanvasComponentIdAtom,
  dataBindingRequestAtom,
  dataBindingResultAtom,
  isPropertiesPanelVisibleAtom,
} from '../state/atoms';
import { DataBindingPicker } from './DataBindingPicker';
import { StaticBindingDisplay } from './StaticBindingDisplay';
import { FullScreenPlaceholder } from './FullScreenPlaceholder';
import { PanelHeader } from './PanelHeader';
import { FormComponent } from '../types';
import './PropertiesPanel.css';
import './panel.css';

type ActiveTab = 'general' | 'advanced';

// FIX: Update component to correctly render based on component.origin
const PanelContent = React.memo(({ 
  selectedComponent,
  activeTab,
  onOpenBindingModal 
}: { 
  selectedComponent: FormComponent,
  activeTab: ActiveTab,
  onOpenBindingModal: () => void
}) => {
  
  const renderBindingControl = () => {
    // FIX: Check component origin to determine which control to render
    if (selectedComponent.origin === 'general') {
      return (
        <div className="prop-item">
          <label>Data binding</label>
          <DataBindingPicker 
            binding={selectedComponent.binding}
            onOpen={onOpenBindingModal}
          />
        </div>
      );
    }
    // FIX: Check component origin to determine which control to render
    if (selectedComponent.origin === 'data') {
      return (
        <div className="prop-item">
          {/* No label needed per spec, section header serves as label */}
          <StaticBindingDisplay binding={selectedComponent.binding} />
        </div>
      );
    }
    return null;
  };

  if (activeTab === 'general') {
    return (
      <>
        <div className="prop-section">
          <h4>Data</h4>
          {renderBindingControl()}
        </div>
        <div className="prop-section">
          <h4>Display</h4>
          <div className="prop-item">
            <label>Placeholder text</label>
            <input type="text" value="Enter placeholder text" disabled />
          </div>
          <div className="prop-item">
            <label>Label</label>
            <input type="text" value={selectedComponent.name} disabled />
          </div>
          <div className="prop-item">
            <label>Label position</label>
            <select disabled><option>Left</option></select>
          </div>
          <div className="prop-item-toggle">
            <label>Required</label>
            <div className="toggle-switch disabled">
              <div className="toggle-knob"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (activeTab === 'advanced') {
    return (
      <FullScreenPlaceholder 
        icon="construction"
        title="Under Construction"
        message="Advanced settings will be available here soon."
      />
    );
  }

  return null;
});


export const PropertiesPanel = () => {
  const selectedId = useAtomValue(selectedCanvasComponentIdAtom);
  const [allComponents, setAllComponents] = useAtom(canvasComponentsAtom);
  const setBindingRequest = useSetAtom(dataBindingRequestAtom);
  const [bindingResult, setBindingResult] = useAtom(dataBindingResultAtom);
  const setIsPanelVisible = useSetAtom(isPropertiesPanelVisibleAtom);

  const [activeTab, setActiveTab] = useState<ActiveTab>('general');
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState({});

  const selectedComponent = allComponents.find(c => c.id === selectedId);

  useLayoutEffect(() => {
    if (tabsContainerRef.current) {
      const activeTabNode = tabsContainerRef.current.querySelector<HTMLButtonElement>(`.tab-button.active`);
      if (activeTabNode) {
        setUnderlineStyle({
          left: activeTabNode.offsetLeft,
          width: activeTabNode.offsetWidth,
        });
      }
    }
  }, [activeTab, selectedId]);

  useEffect(() => {
    if (bindingResult) {
      setAllComponents(prev => 
        prev.map(c => 
          c.id === bindingResult.componentId 
          ? { ...c, binding: bindingResult.newBinding } 
          : c
        )
      );
      setBindingResult(null);
    }
  }, [bindingResult, setAllComponents, setBindingResult]);

  const handleOpenBindingModal = () => {
    if (selectedComponent) {
      setBindingRequest({
        componentId: selectedComponent.id,
        currentBinding: selectedComponent.binding,
      });
    }
  };

  const panelTitle = selectedComponent ? selectedComponent.name : "No item selected";

  return (
    <div className="properties-panel-container">
      <PanelHeader title={panelTitle} onClose={() => setIsPanelVisible(false)} />

      {selectedComponent ? (
        <>
          <div className="panel-header">
            <div className="panel-tabs" ref={tabsContainerRef}>
              <button 
                className={`tab-button ${activeTab === 'general' ? 'active' : ''}`} 
                onClick={() => setActiveTab('general')}
              >
                General
              </button>
              <button 
                className={`tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
                onClick={() => setActiveTab('advanced')}
              >
                Advanced
              </button>
              <div className="tab-underline" style={underlineStyle} />
            </div>
          </div>
          <div className="panel-content">
            <PanelContent 
              selectedComponent={selectedComponent} 
              activeTab={activeTab}
              onOpenBindingModal={handleOpenBindingModal}
            />
          </div>
        </>
      ) : (
        <div className="properties-panel-placeholder">
          <span className="material-symbols-rounded">touch_app</span>
          <p>Select a component on the canvas to see its properties.</p>
        </div>
      )}
    </div>
  );
};