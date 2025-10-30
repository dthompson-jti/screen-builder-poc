// src/features/Editor/PropertiesPanel/LayoutEditor.tsx
import { useSetAtom } from 'jotai';
import { commitActionAtom } from '../../../data/historyAtoms';
import { LayoutComponent, AppearanceProperties, AppearanceType, CanvasComponent } from '../../../types';
import { registerPropertyEditor, PropertyEditorProps } from './propertyEditorRegistry';
import { Select, SelectItem } from '../../../components/Select';
import { Tooltip } from '../../../components/Tooltip';
import { Accordion, AccordionItem } from '../../../components/Accordion';
import { ContextualLayoutProperties } from './ContextualLayoutEditor';
import styles from './PropertiesPanel.module.css';

const appearanceDefaults: AppearanceProperties = {
  type: 'transparent',
  bordered: false,
  padding: 'md',
};

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

const StyleSwatch = ({ type, bordered, isSelected, onClick, title }: { type: AppearanceType, bordered: boolean, isSelected: boolean, onClick: () => void, title: string }) => (
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
    <AccordionItem value="appearance" trigger="Appearance">
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
    </AccordionItem>
  );
};

const LayoutEditor = ({ component }: PropertyEditorProps<CanvasComponent>) => {
  const commitAction = useSetAtom(commitActionAtom);

  if (component.componentType !== 'layout') {
    return null;
  }

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
    <Accordion defaultValue={['layout', 'appearance', 'contextual-layout']}>
      <AccordionItem value="layout" trigger="Layout">
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
      </AccordionItem>
      <AppearancePropertiesEditor component={component} />
      <ContextualLayoutProperties component={component} />
    </Accordion>
  );
};

registerPropertyEditor('layout', LayoutEditor);

export default LayoutEditor;