// src/properties-panel/PropertiesPanel.tsx
import { useEffect } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { canvasComponentsAtom, selectedCanvasComponentIdAtom } from '../editor-canvas/canvasAtoms';
import { dataBindingRequestAtom, dataBindingResultAtom } from './dataBindingAtoms';
import { DataBindingPicker } from './DataBindingPicker';
import { StaticBindingDisplay } from './StaticBindingDisplay';
import './PropertiesPanel.css';

export const PropertiesPanel = () => {
  const selectedId = useAtomValue(selectedCanvasComponentIdAtom);
  const [allComponents, setAllComponents] = useAtom(canvasComponentsAtom);
  const setBindingRequest = useSetAtom(dataBindingRequestAtom);
  const [bindingResult, setBindingResult] = useAtom(dataBindingResultAtom);

  const selectedComponent = allComponents.find(c => c.id === selectedId);

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

  const renderBindingControl = () => {
    if (!selectedComponent) return null;

    // FIX: Conditionally render static or interactive binding control
    if (selectedComponent.origin === 'general') {
      return (
        <div className="prop-item">
          <label>Data binding</label>
          <DataBindingPicker 
            binding={selectedComponent.binding}
            onOpen={handleOpenBindingModal}
          />
        </div>
      );
    }

    if (selectedComponent.origin === 'data') {
      return (
        <div className="prop-item">
          <label>Data binding</label>
          <StaticBindingDisplay binding={selectedComponent.binding} />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="properties-panel-container">
      {selectedComponent ? (
        <>
          <div className="panel-header">
            <h3>{selectedComponent.name}</h3>
            <div className="panel-tabs">
              <button className="tab-button active">General</button>
              <button className="tab-button" disabled>Advanced</button>
            </div>
          </div>
          <div className="panel-content">
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
          </div>
        </>
      ) : (
        <div className="properties-panel-placeholder">
          <span className="material-symbols-outlined">touch_app</span>
          <p>Select a component on the canvas to see its properties.</p>
        </div>
      )}
    </div>
  );
};