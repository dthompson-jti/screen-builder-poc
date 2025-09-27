// src/properties-panel/PropertiesPanel.tsx
import { useAtomValue } from 'jotai';
import { canvasComponentsAtom, selectedCanvasComponentIdAtom } from '../editor-canvas/canvasAtoms';
import './PropertiesPanel.css';

export const PropertiesPanel = () => {
  const selectedId = useAtomValue(selectedCanvasComponentIdAtom);
  const allComponents = useAtomValue(canvasComponentsAtom);
  const selectedComponent = allComponents.find(c => c.id === selectedId);

  return (
    <div className="properties-panel-container">
      {selectedComponent ? (
        <>
          <div className="panel-header">
            <h3>{selectedComponent.name}</h3>
            <div className="panel-tabs">
              <button className="tab-button active" disabled>General</button>
              <button className="tab-button" disabled>Advanced</button>
            </div>
          </div>
          <div className="panel-content">
            <div className="prop-section">
              <h4>Data</h4>
              <div className="prop-item">
                <label>Data binding</label>
                <select disabled><option>Enter placeholder text</option></select>
              </div>
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