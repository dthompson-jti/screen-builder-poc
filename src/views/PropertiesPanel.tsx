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
import { Select, SelectItem } from '../components/Select';
import { Tooltip } from '../components/Tooltip';
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
    <Tooltip content={title}>
      <button 
        className={`${styles.styleSwatch} ${isSelected ? styles.selected : ''}`}
        onClick={onClick}
        data-appearance-type={type}
        data-bordered={bordered}
        aria-label={title}
      >
        {isSelected && <span className={`material-symbols-rounded ${styles.checkmark}`}>check</span>}
      </button>
    </Tooltip>
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
        <Select
          value={appearance.padding}
          onValueChange={value => handleAppearanceChange({ padding: value as AppearanceProperties['padding'] })}
        >
          <SelectItem value="none">None</SelectItem>
          <SelectItem value="sm">Small (8px)</SelectItem>
          <SelectItem value="md">Medium (16px)</SelectItem>
          <SelectItem value="lg">Large (24px)</SelectItem>
          <SelectItem value="xl">Extra Large (32px)</SelectItem>
        </Select>
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
  
  const handleSpanChange = (value: string) => {
    const newSpan = parseInt(value, 10);
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
          <Select
            value={(component.contextualLayout?.columnSpan || 1).toString()}
            onValueChange={handleSpanChange}
          >
            <SelectItem value="1">1 Column</SelectItem>
            <SelectItem value="2">2 Columns</SelectItem>
            <SelectItem value="3">3 Columns</SelectItem>
          </Select>
        </div>
      )}
      {isParentWrappingRow && (
        <div className={styles.propItemToggle}>
          <Tooltip content="When enabled, this item will maintain its width and not shrink when the container wraps." side="left">
            <label htmlFor={`prevent-shrinking-${component.id}`}>Prevent Shrinking</label>
          </Tooltip>
          <input
            type="checkbox"
            id={`prevent-shrinking-${component.id}`}
            className="form-switch"
            checked={!!component.contextualLayout?.preventShrinking}
            onChange={handleShrinkToggle}
          />
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
          <Select 
            value={arrangement} 
            onValueChange={value => handlePropertyChange({ arrangement: value as LayoutComponent['properties']['arrangement'] })}
          >
            <SelectItem value="stack">Vertical Stack</SelectItem>
            <SelectItem value="row">Horizontal Row</SelectItem>
            <SelectItem value="wrap">Wrapping Group</SelectItem>
            <SelectItem value="grid">Grid</SelectItem>
          </Select>
        </div>
        {arrangement === 'row' && (
          <>
            <div className={styles.propItem}>
              <label>Distribution</label>
              <Select 
                value={component.properties.distribution}
                onValueChange={value => handlePropertyChange({ distribution: value as LayoutComponent['properties']['distribution'] })}
              >
                <SelectItem value="start">Pack to Start</SelectItem>
                <SelectItem value="center">Pack to Center</SelectItem>
                <SelectItem value="end">Pack to End</SelectItem>
                <SelectItem value="space-between">Space Between</SelectItem>
              </Select>
            </div>
            <div className={styles.propItem}>
              <label>Vertical Align</label>
              <Select 
                value={component.properties.verticalAlign}
                onValueChange={value => handlePropertyChange({ verticalAlign: value as LayoutComponent['properties']['verticalAlign'] })}
              >
                <SelectItem value="start">Start</SelectItem>
                <SelectItem value="center">Middle</SelectItem>
                <SelectItem value="end">End</SelectItem>
                <SelectItem value="stretch">Stretch</SelectItem>
              </Select>
            </div>
          </>
        )}
        {arrangement === 'grid' && (
          <div className={styles.propItem}>
            <label>Column Layout</label>
            <Select
              value={component.properties.columnLayout.toString()}
              onValueChange={value => handlePropertyChange({ columnLayout: value as LayoutComponent['properties']['columnLayout'] })}
            >
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="2-col-50-50">2 Columns (50/50)</SelectItem>
              <SelectItem value="3-col-33">3 Columns (33/33/33)</SelectItem>
              <SelectItem value="2-col-split-left">2 Columns (66/33)</SelectItem>
            </Select>
          </div>
        )}
        <div className={styles.propItem}>
          <label>Gap</label>
          <Select 
            value={component.properties.gap}
            onValueChange={value => handlePropertyChange({ gap: value as LayoutComponent['properties']['gap'] })}
          >
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="sm">Small (8px)</SelectItem>
            <SelectItem value="md">Medium (16px)</SelectItem>
            <SelectItem value="lg">Large (24px)</SelectItem>
          </Select>
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