// src/features/Editor/PropertiesPanel/ContextualLayoutEditor.tsx
import { useSetAtom, useAtomValue } from 'jotai';
import { commitActionAtom, canvasComponentsByIdAtom } from '../../../data/historyAtoms';
import { FormComponent, LayoutComponent } from '../../../types';
import { Select, SelectItem } from '../../../components/Select';
import { Tooltip } from '../../../components/Tooltip';
import { Switch } from '../../../components/Switch';
import { AccordionItem } from '../../../components/Accordion';
import { getComponentName } from '../canvasUtils';
import styles from './PropertiesPanel.module.css';

export const ContextualLayoutProperties = ({ component }: { component: FormComponent | LayoutComponent }) => {
  const commitAction = useSetAtom(commitActionAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const parent = allComponents[component.parentId];
  
  if (!parent || parent.componentType !== 'layout') return null;
  
  const isParentGrid = parent.properties.arrangement === 'grid';
  const isParentWrappingRow = parent.properties.arrangement === 'wrap';
  
  const handleSpanChange = (value: string) => {
    const newSpan = parseInt(value, 10);
    commitAction({
      action: { type: 'COMPONENT_UPDATE_CONTEXTUAL_LAYOUT', payload: { componentId: component.id, newLayout: { columnSpan: newSpan } }},
      message: `Update column span for '${getComponentName(component)}'`
    });
  };

  const handleShrinkToggle = () => {
    commitAction({
      action: { type: 'COMPONENT_UPDATE_CONTEXTUAL_LAYOUT', payload: { componentId: component.id, newLayout: { preventShrinking: !component.contextualLayout?.preventShrinking } }},
      message: `Toggle shrink for '${getComponentName(component)}'`
    });
  };

  if (!isParentGrid && !isParentWrappingRow) return null;

  return (
    <AccordionItem value="contextual-layout" trigger="Layout (in Parent)">
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
          <Switch
            id={`prevent-shrinking-${component.id}`}
            checked={!!component.contextualLayout?.preventShrinking}
            onCheckedChange={handleShrinkToggle}
          />
        </div>
      )}
    </AccordionItem>
  );
};