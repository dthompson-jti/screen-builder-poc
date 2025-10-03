// src/views/PropertiesPanel.tsx
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import {
  selectedCanvasComponentIdAtom,
  dataBindingRequestAtom,
  dataBindingResultAtom,
  isPropertiesPanelVisibleAtom,
} from '../data/atoms';
import { canvasComponentsAtom, commitActionAtom } from '../data/historyAtoms';
import { DataBindingPicker } from '../components/DataBindingPicker';
import { StaticBindingDisplay } from '../components/StaticBindingDisplay';
import { FullScreenPlaceholder } from '../components/FullScreenPlaceholder';
import { PanelHeader } from '../components/PanelHeader';
import { FormComponent } from '../types';
import styles from './PropertiesPanel.module.css';

type ActiveTab = 'general' | 'advanced';

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
    if (selectedComponent.origin === 'general') {
      return (
        <div className={styles.propItem}>
          <label>Data binding</label>
          <DataBindingPicker 
            binding={selectedComponent.binding}
            onOpen={onOpenBindingModal}
          />
        </div>
      );
    }
    if (selectedComponent.origin === 'data') {
      return (
        <div className={styles.propItem}>
          <StaticBindingDisplay binding={selectedComponent.binding} />
        </div>
      );
    }
    return null;
  };

  if (activeTab === 'general') {
    return (
      <>
        <div className={styles.propSection}>
          <h4>Data</h4>
          {renderBindingControl()}
        </div>
        <div className={styles.propSection}>
          <h4>Display</h4>
          <div className={styles.propItem}>
            <label>Placeholder text</label>
            <input type="text" value="Enter placeholder text" disabled />
          </div>
          <div className={styles.propItem}>
            <label>Label</label>
            <input type="text" value={selectedComponent.name} disabled />
          </div>
          <div className={styles.propItem}>
            <label>Label position</label>
            <select disabled><option>Left</option></select>
          </div>
          <div className={styles.propItemToggle}>
            <label>Required</label>
            <div className={`${styles.toggleSwitch} ${styles.disabled}`}>
              <div className={styles.toggleKnob}></div>
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
  const allComponents = useAtomValue(canvasComponentsAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const setBindingRequest = useSetAtom(dataBindingRequestAtom);
  const [bindingResult, setBindingResult] = useAtom(dataBindingResultAtom);
  const setIsPanelVisible = useSetAtom(isPropertiesPanelVisibleAtom);

  const [activeTab, setActiveTab] = useState<ActiveTab>('general');
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState({});

  const selectedComponent = allComponents.find((c: FormComponent) => c.id === selectedId);

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
      const componentName = allComponents.find((c: FormComponent) => c.id === bindingResult.componentId)?.name || 'component';
      
      commitAction({
        action: { type: 'COMPONENT_UPDATE_BINDING', payload: bindingResult },
        message: `Update binding for '${componentName}'`
      });

      setBindingResult(null);
    }
  }, [bindingResult, allComponents, setBindingResult, commitAction]);

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
    <div className={styles.propertiesPanelContainer}>
      <PanelHeader title={panelTitle} onClose={() => setIsPanelVisible(false)} />

      {selectedComponent ? (
        <>
          <div className={`${styles.panelHeader} panel-tabs`} ref={tabsContainerRef}>
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
          <div className={`${styles.panelContent} stealth-scrollbar`}>
            <PanelContent 
              selectedComponent={selectedComponent} 
              activeTab={activeTab}
              onOpenBindingModal={handleOpenBindingModal}
            />
          </div>
        </>
      ) : (
        <div className={styles.propertiesPanelPlaceholder}>
          <span className="material-symbols-rounded">touch_app</span>
          <p>Select a component on the canvas to see its properties.</p>
        </div>
      )}
    </div>
  );
};