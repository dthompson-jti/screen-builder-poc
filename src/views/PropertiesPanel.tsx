// src/views/PropertiesPanel.tsx
import { useEffect } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import {
  selectedCanvasComponentIdsAtom,
  dataBindingRequestAtom,
  dataBindingResultAtom,
  isPropertiesPanelVisibleAtom,
} from '../data/atoms';
import { canvasComponentsByIdAtom, commitActionAtom } from '../data/historyAtoms';
import { DataBindingPicker } from '../components/DataBindingPicker';
import { PanelHeader } from '../components/PanelHeader';
import { FormComponent, LayoutComponent } from '../types';
import styles from './PropertiesPanel.module.css';

// --- Panel for Layout Component ---
const LayoutProperties = ({ component }: { component: LayoutComponent }) => {
  const commitAction = useSetAtom(commitActionAtom);

  const handlePropertyChange = (newProperties: Partial<LayoutComponent['properties']>) => {
    commitAction({
      action: {
        type: 'COMPONENT_UPDATE_PROPERTIES',
        payload: { componentId: component.id, newProperties }
      },
      message: `Update layout for '${component.name}'`
    });
  };

  return (
    <div className={styles.propSection}>
      <h4>Layout</h4>
      <div className={styles.propItem}>
        <label>Arrangement</label>
        <select 
          value={component.properties.arrangement} 
          onChange={e => handlePropertyChange({ arrangement: e.target.value as LayoutComponent['properties']['arrangement'] })}
        >
          <option value="stack">Vertical Stack</option>
          <option value="row">Horizontal Row</option>
          <option value="grid">Grid</option>
        </select>
      </div>
    </div>
  );
};

// --- Panel for Form Component ---
const FormItemProperties = ({ component }: { component: FormComponent }) => {
  const setBindingRequest = useSetAtom(dataBindingRequestAtom);

  const handleOpenBindingModal = () => {
    setBindingRequest({
      componentId: component.id,
      currentBinding: component.binding,
    });
  };

  return (
    <>
      <div className={styles.propSection}>
        <h4>Data</h4>
        <div className={styles.propItem}>
          <label>Data binding</label>
          <DataBindingPicker 
            binding={component.binding}
            onOpen={handleOpenBindingModal}
          />
        </div>
      </div>
      <div className={styles.propSection}>
        <h4>Display</h4>
        <div className={styles.propItem}>
          <label>Label</label>
          <input type="text" value={component.name} disabled />
        </div>
      </div>
    </>
  );
};


export const PropertiesPanel = () => {
  const selectedIds = useAtomValue(selectedCanvasComponentIdsAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const [bindingResult, setBindingResult] = useAtom(dataBindingResultAtom);
  const setIsPanelVisible = useSetAtom(isPropertiesPanelVisibleAtom);

  const primarySelectedId = selectedIds.length > 0 ? selectedIds[0] : null;
  const selectedComponent = primarySelectedId ? allComponents[primarySelectedId] : null;

  useEffect(() => {
    if (bindingResult) {
      const componentName = allComponents[bindingResult.componentId]?.name || 'component';
      
      commitAction({
        action: { type: 'COMPONENT_UPDATE_BINDING', payload: bindingResult },
        message: `Update binding for '${componentName}'`
      });

      setBindingResult(null);
    }
  }, [bindingResult, allComponents, setBindingResult, commitAction]);

  const renderPanelContent = () => {
    if (selectedIds.length > 1) {
      return (
        <div className={styles.propertiesPanelPlaceholder}>
          <span className="material-symbols-rounded">select_all</span>
          <p>{selectedIds.length} items selected</p>
        </div>
      );
    }
    if (!selectedComponent) {
      return (
        <div className={styles.propertiesPanelPlaceholder}>
          <span className="material-symbols-rounded">touch_app</span>
          <p>Select a component on the canvas to see its properties.</p>
        </div>
      );
    }

    if (selectedComponent.componentType === 'layout') {
      return <LayoutProperties component={selectedComponent} />;
    }
    if (selectedComponent.componentType === 'field' || selectedComponent.componentType === 'widget') {
      return <FormItemProperties component={selectedComponent} />;
    }
    return null;
  };

  const panelTitle = selectedComponent && selectedIds.length === 1 ? selectedComponent.name : `${selectedIds.length} items selected`;

  return (
    <div className={styles.propertiesPanelContainer}>
      <PanelHeader title={selectedIds.length > 0 ? panelTitle : "Properties"} onClose={() => setIsPanelVisible(false)} />
      
      <div className={styles.panelContent}>
        {renderPanelContent()}
      </div>
    </div>
  );
};