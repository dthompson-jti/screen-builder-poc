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
import { FormComponent, LayoutComponent, AppearanceProperties } from '../types';
import styles from './PropertiesPanel.module.css';

const appearanceDefaults: AppearanceProperties = {
  backgroundColor: 'transparent',
  padding: 'none',
  border: 'none',
};

// --- NEW: Appearance Section Component ---
const AppearancePropertiesEditor = ({ component }: { component: LayoutComponent }) => {
  const commitAction = useSetAtom(commitActionAtom);
  const appearance = component.properties.appearance || appearanceDefaults;

  const handleAppearanceChange = (newAppearance: Partial<AppearanceProperties>) => {
    commitAction({
      action: {
        type: 'COMPONENT_UPDATE_APPEARANCE',
        payload: { componentId: component.id, newAppearance }
      },
      message: `Update appearance for '${component.name}'`
    });
  };

  return (
    <div className={styles.propSection}>
      <h4>Appearance</h4>
      <div className={styles.propItem}>
        <label>Background</label>
        <select
          value={appearance.backgroundColor}
          onChange={e => handleAppearanceChange({ backgroundColor: e.target.value as AppearanceProperties['backgroundColor'] })}
        >
          <option value="transparent">Transparent</option>
          <option value="surface-bg-primary">Primary</option>
          <option value="surface-bg-secondary">Secondary</option>
          <option value="surface-bg-tertiary">Tertiary</option>
          <option value="surface-bg-info">Info</option>
          <option value="surface-bg-warning">Warning</option>
          <option value="surface-bg-error-primary">Error</option>
        </select>
      </div>
      <div className={styles.propItem}>
        <label>Padding</label>
        <select
          value={appearance.padding}
          onChange={e => handleAppearanceChange({ padding: e.target.value as AppearanceProperties['padding'] })}
        >
          <option value="none">None</option>
          <option value="sm">Small (8px)</option>
          <option value="md">Medium (16px)</option>
          <option value="lg">Large (24px)</option>
          <option value="xl">Extra Large (32px)</option>
        </select>
      </div>
      <div className={styles.propItem}>
        <label>Border</label>
        <select
          value={appearance.border}
          onChange={e => handleAppearanceChange({ border: e.target.value as AppearanceProperties['border'] })}
        >
          <option value="none">None</option>
          <option value="surface-border-secondary">Secondary</option>
          <option value="surface-border-tertiary">Tertiary</option>
        </select>
      </div>
    </div>
  );
};


// --- Contextual Panel for Children of Grids ---
const ContextualLayoutProperties = ({ component }: { component: FormComponent | LayoutComponent }) => {
  const commitAction = useSetAtom(commitActionAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const parent = allComponents[component.parentId];

  if (!parent || parent.componentType !== 'layout' || parent.properties.arrangement !== 'grid') {
    return null;
  }

  const handleSpanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSpan = parseInt(e.target.value, 10);
    commitAction({
      action: {
        type: 'COMPONENT_UPDATE_CONTEXTUAL_LAYOUT',
        payload: { componentId: component.id, newLayout: { columnSpan: newSpan } }
      },
      message: `Update column span for '${component.name}'`
    });
  };

  return (
    <div className={styles.propSection}>
      <h4>Layout (in Grid)</h4>
      <div className={styles.propItem}>
        <label>Column Span</label>
        <select value={component.contextualLayout?.columnSpan || 1} onChange={handleSpanChange}>
          <option value={1}>1 Column</option>
          <option value={2}>2 Columns</option>
          <option value={3}>3 Columns</option>
        </select>
      </div>
    </div>
  );
};


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
  
  const handleToggleChange = (propName: keyof LayoutComponent['properties']) => {
    handlePropertyChange({ [propName]: !component.properties[propName] });
  };

  return (
    <>
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
        {component.properties.arrangement === 'row' && (
          <>
            <div className={styles.propItem}>
              <label>Distribution</label>
              <select 
                value={component.properties.distribution}
                onChange={e => handlePropertyChange({ distribution: e.target.value as LayoutComponent['properties']['distribution'] })}
              >
                <option value="start">Pack to Start</option>
                <option value="center">Pack to Center</option>
                <option value="end">Pack to End</option>
                <option value="space-between">Space Between</option>
              </select>
            </div>
            <div className={styles.propItem}>
              <label>Vertical Align</label>
              <select 
                value={component.properties.verticalAlign}
                onChange={e => handlePropertyChange({ verticalAlign: e.target.value as LayoutComponent['properties']['verticalAlign'] })}
              >
                <option value="start">Start</option>
                <option value="center">Middle</option>
                <option value="end">End</option>
                <option value="stretch">Stretch</option>
              </select>
            </div>
            <div className={styles.propItemToggle}>
              <label>Allow Wrapping</label>
              <button 
                className={`${styles.toggleSwitch} ${component.properties.allowWrapping ? styles.active : ''}`}
                onClick={() => handleToggleChange('allowWrapping')}
              >
                <div className={styles.toggleKnob} />
              </button>
            </div>
          </>
        )}
        {component.properties.arrangement === 'grid' && (
          <div className={styles.propItem}>
            <label>Column Layout</label>
            <select
              value={component.properties.columnLayout}
              onChange={e => handlePropertyChange({ columnLayout: e.target.value as LayoutComponent['properties']['columnLayout'] })}
            >
              <option value="auto">Auto</option>
              <option value="2-col-50-50">2 Columns (50/50)</option>
              <option value="3-col-33">3 Columns (33/33/33)</option>
              <option value="2-col-split-left">2 Columns (66/33)</option>
            </select>
          </div>
        )}
        <div className={styles.propItem}>
          <label>Gap</label>
          <select 
            value={component.properties.gap}
            onChange={e => handlePropertyChange({ gap: e.target.value as LayoutComponent['properties']['gap'] })}
          >
            <option value="none">None</option>
            <option value="sm">Small (8px)</option>
            <option value="md">Medium (16px)</option>
            <option value="lg">Large (24px)</option>
          </select>
        </div>
      </div>
      <AppearancePropertiesEditor component={component} />
      <ContextualLayoutProperties component={component} />
    </>
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
      <ContextualLayoutProperties component={component} />
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