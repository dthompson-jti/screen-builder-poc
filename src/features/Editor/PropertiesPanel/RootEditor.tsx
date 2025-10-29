// src/features/Editor/PropertiesPanel/RootEditor.tsx
import { useSetAtom } from 'jotai';
import { commitActionAtom } from '../../../data/historyAtoms';
import { LayoutComponent, CanvasComponent } from '../../../types';
import { registerPropertyEditor, PropertyEditorProps } from './propertyEditorRegistry';
import { Select, SelectItem } from '../../../components/Select';
import { Accordion, AccordionItem } from '../../../components/Accordion';
import styles from './PropertiesPanel.module.css';

const RootEditor = ({ component }: PropertyEditorProps<CanvasComponent>) => {
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
    <Accordion defaultValue={['layout']}>
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
    </Accordion>
  );
};

registerPropertyEditor('root', RootEditor);

export default RootEditor;