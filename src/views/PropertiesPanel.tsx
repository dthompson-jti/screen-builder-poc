// src/views/PropertiesPanel.tsx
import React, { useEffect } from 'react';
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
import { FormComponent, LayoutComponent, AppearanceProperties, AppearanceType } from '../types';
import styles from './PropertiesPanel.module.css';

const appearanceDefaults: AppearanceProperties = {
  type: 'transparent',
  bordered: false,
  padding: 'md',
};

// --- NEW: Style Preset Definitions ---
const presetOptions: { id: string; label: string; type: AppearanceType; bordered: boolean }[] = [
    { id: 'transparent-noborder', label: 'Transparent', type: 'transparent', bordered: false },
    { id: 'primary-noborder', label: 'Primary', type: 'primary', bordered: false },
    { id: 'primary-bordered', label: 'Primary (Bordered)', type: 'primary', bordered: true },
    { id: 'secondary-bordered', label: 'Secondary (Bordered)', type: 'secondary', bordered: true },
    { id: 'tertiary-bordered', label: 'Tertiary (Bordered)', type: 'tertiary', bordered: true },
    { id: 'info-bordered', label: 'Info', type: 'info', bordered: true },
    { id: 'warning-bordered', label: 'Warning', type: 'warning', bordered: true },
    { id: 'error-bordered', label: 'Error', type: 'error', bordered: true },
];

// --- Style Swatch Component ---
const StyleSwatch = ({ type, bordered, isSelected, onClick, title }: { type: AppearanceType, bordered: boolean, isSelected: boolean, onClick: () => void, title: string }) => {
  return (
    <button 
      className={`${styles.styleSwatch} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
      data-appearance-type={type}
      data-bordered={bordered}
      title={title}
    >
      {isSelected && <span className={`material-symbols-rounded ${styles.checkmark}`}>check</span>}
    </button>
  );
};


// --- Appearance Section Component ---
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
        <label>Style</label>
        <div className={styles.styleSwatchGrid}>
            {presetOptions.map(preset => {
                const isSelected = appearance.type === preset.type && appearance.bordered === preset.bordered;
                return (
                    <StyleSwatch 
                        key={preset.id}
                        type={preset.type}
                        bordered={preset.bordered}
                        isSelected={isSelected}
                        onClick={() => handleAppearanceChange({ type: preset.type, bordered: preset.bordered })}
                        title={preset.label}
                    />
                );
            })}
        </div>
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
    </div>
  );
};


// --- Contextual Panel for Children ---
const ContextualLayoutProperties = ({ component }: { component: FormComponent | LayoutComponent }) => {
  const commitAction = useSetAtom(commitActionAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const parent = allComponents[component.parentId];

  if (!parent || parent.componentType !== 'layout') {
    return null;
  }
  
  const isParentGrid = parent.properties.arrangement === 'grid';
  const isParentWrappingRow = parent.properties.arrangement === 'wrap';
  
  const handleSpanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSpan = parseInt(e.target.value, 10);
    commitAction({
      action: { type: 'COMPONENT_UPDATE_CONTEXTUAL_LAYOUT', payload: { componentId: component.id, newLayout: { columnSpan: newSpan } }},
      message: `Update column span for '${component.name}'`
    });
  };

  const handleShrinkToggle = () => {
    commitAction({
      action: { type: 'COMPONENT_UPDATE_CONTEXTUAL_LAYOUT', payload: { componentId: component.id, newLayout: { preventShrinking: !component.contextualLayout?.preventShrinking } }},
      message: `Toggle shrink for '${component.name}'`
    });
  };

  if (!isParentGrid && !isParentWrappingRow) return null;

  return (
    <div className={styles.propSection}>
      <h4>Layout (in Parent)</h4>
      {isParentGrid && (
        <div className={styles.propItem}>
          <label>Column Span</label>
          <select value={component.contextualLayout?.columnSpan || 1} onChange={handleSpanChange}>
            <option value={1}>1 Column</option>
            <option value={2}>2 Columns</option>
            <option value={3}>3 Columns</option>
          </select>
        </div>
      )}
      {isParentWrappingRow && (
        <div className={styles.propItemToggle}>
          <label>Prevent Shrinking</label>
          <button 
            className={`${styles.toggleSwitch} ${component.contextualLayout?.preventShrinking ? styles.active : ''}`}
            onClick={handleShrinkToggle}
          >
            <div className={styles.toggleKnob} />
          </button>
        </div>
      )}
    </div>
  );
};


// --- Panel for Layout Component ---
const LayoutProperties = ({ component }: { component: LayoutComponent }) => {
  const commitAction = useSetAtom(commitActionAtom);

  const handlePropertyChange = (newProperties: Partial<Omit<LayoutComponent['properties'], 'appearance'>>) => {
    commitAction({
      action: {
        type: 'COMPONENT_UPDATE_PROPERTIES',
        payload: { componentId: component.id, newProperties }
      },
      message: `Update layout for '${component.name}'`
    });
  };

  const arrangement = component.properties.arrangement;
  
  return (
    <>
      <div className={styles.propSection}>
        <h4>Layout</h4>
        <div className={styles.propItem}>
          <label>Arrangement</label>
          <select 
            value={arrangement} 
            onChange={e => handlePropertyChange({ arrangement: e.target.value as LayoutComponent['properties']['arrangement'] })}
          >
            <option value="stack">Vertical Stack</option>
            <option value="row">Horizontal Row</option>
            <option value="wrap">Wrapping Group</option>
            <option value="grid">Grid</option>
          </select>
        </div>
        {arrangement === 'row' && (
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
          </>
        )}
        {arrangement === 'grid' && (
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