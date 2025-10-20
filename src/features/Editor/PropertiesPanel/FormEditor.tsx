// src/features/Editor/PropertiesPanel/FormEditor.tsx
import { useSetAtom, useAtomValue } from 'jotai';
import { commitActionAtom, canvasComponentsByIdAtom } from '../../../data/historyAtoms';
import { dataBindingRequestAtom } from '../../../data/atoms';
import { FormComponent, LayoutComponent, CanvasComponent } from '../../../types';
import { registerPropertyEditor, PropertyEditorProps } from './propertyEditorRegistry';
import { DataBindingPicker } from '../../../components/DataBindingPicker';
import { Switch } from '../../../components/Switch';
import { Tooltip } from '../../../components/Tooltip';
import { IconToggleGroup } from '../../../components/IconToggleGroup';
import { Select, SelectItem } from '../../../components/Select';
import { getComponentName } from '../canvasUtils';
import styles from './PropertiesPanel.module.css';

const sanitizeLabelToFieldName = (label: string): string => {
  if (!label) return '';
  return label
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');
};

const ContextualLayoutProperties = ({ component }: { component: FormComponent | LayoutComponent }) => {
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
            <Switch
              id={`prevent-shrinking-${component.id}`}
              checked={!!component.contextualLayout?.preventShrinking}
              onCheckedChange={handleShrinkToggle}
            />
          </div>
        )}
      </div>
    );
};

const displayOptions: { value: FormComponent['properties']['controlType']; label: string; icon: string; }[] = [
    { value: 'text-input', label: 'Text Input', icon: 'text_fields' },
    { value: 'dropdown', label: 'Dropdown', icon: 'arrow_drop_down_circle' },
    { value: 'radio-buttons', label: 'Radio Buttons', icon: 'radio_button_checked' },
];

const textElementOptions: { value: NonNullable<FormComponent['properties']['textElement']>; label: string; icon: string }[] = [
    { value: 'h1', label: 'H1', icon: 'looks_one' },
    { value: 'h2', label: 'H2', icon: 'looks_two' },
    { value: 'h3', label: 'H3', icon: 'looks_3' },
    { value: 'h4', label: 'H4', icon: 'looks_4' },
    { value: 'h5', label: 'H5', icon: 'looks_5' },
    { value: 'h6', label: 'H6', icon: 'looks_6' },
];

const FormEditor = ({ component }: PropertyEditorProps<CanvasComponent>) => {
  const setBindingRequest = useSetAtom(dataBindingRequestAtom);
  const commitAction = useSetAtom(commitActionAtom);

  if (component.componentType !== 'field' && component.componentType !== 'widget') {
    return null;
  }

  const { controlType } = component.properties;

  const handleOpenBindingModal = () => {
    setBindingRequest({
      componentId: component.id,
      currentBinding: component.binding,
    });
  };

  const handlePropertyChange = (newProperties: Partial<FormComponent['properties']>) => {
    commitAction({
      action: {
        type: 'COMPONENT_UPDATE_FORM_PROPERTIES',
        payload: { componentId: component.id, newProperties }
      },
      message: `Update properties for '${getComponentName(component)}'`
    });
  };
  
  const handleLabelChange = (newLabel: string) => {
    const newFieldName = sanitizeLabelToFieldName(newLabel);
    const newPlaceholder = `Enter ${newLabel}`;
    handlePropertyChange({ label: newLabel, fieldName: newFieldName, placeholder: newPlaceholder });
  };

  if (controlType === 'plain-text') {
    const isHeading = component.properties.textElement?.startsWith('h');
    return (
      <>
        <div className={styles.propSection}>
          <h4>Text Settings</h4>
          {isHeading && (
            <div className={styles.propItem}>
              <label>Heading Level</label>
              <IconToggleGroup
                  options={textElementOptions}
                  value={component.properties.textElement || 'p'}
                  onValueChange={value => handlePropertyChange({ textElement: value as FormComponent['properties']['textElement'] })}
              />
            </div>
          )}
          <div className={styles.propItem}>
            <label htmlFor={`content-${component.id}`}>Content</label>
            <textarea
              id={`content-${component.id}`}
              className={styles.propTextarea}
              value={component.properties.content || ''}
              onChange={(e) => handlePropertyChange({ content: e.target.value })}
              rows={6}
            />
          </div>
        </div>
        <ContextualLayoutProperties component={component} />
      </>
    );
  }

  if (controlType === 'link') {
    return (
        <>
            <div className={styles.propSection}>
                <h4>Link Settings</h4>
                <div className={styles.propItem}>
                    <label htmlFor={`content-${component.id}`}>Text</label>
                    <input
                        id={`content-${component.id}`}
                        type="text"
                        value={component.properties.content || ''}
                        onChange={(e) => handlePropertyChange({ content: e.target.value })}
                    />
                </div>
                <div className={styles.propItem}>
                    <label htmlFor={`href-${component.id}`}>URL</label>
                    <input
                        id={`href-${component.id}`}
                        type="text"
                        placeholder="https://example.com"
                        value={component.properties.href || ''}
                        onChange={(e) => handlePropertyChange({ href: e.target.value })}
                    />
                </div>
                <div className={styles.propItem}>
                    <label>Target</label>
                    <Select
                        value={component.properties.target || '_self'}
                        onValueChange={value => handlePropertyChange({ target: value as '_self' | '_blank' })}
                    >
                        <SelectItem value="_self">Open in same tab</SelectItem>
                        <SelectItem value="_blank">Open in new tab</SelectItem>
                    </Select>
                </div>
            </div>
            <ContextualLayoutProperties component={component} />
        </>
    );
  }

  return (
    <>
      <div className={styles.propSection}>
        <h4>Display</h4>
        <div className={styles.propItem}>
          <label htmlFor="display-as-toggle">Display as</label>
          <IconToggleGroup
            id="display-as-toggle"
            options={displayOptions}
            value={controlType}
            onValueChange={value => handlePropertyChange({ controlType: value })}
          />
        </div>
      </div>

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
        <h4>Field Settings</h4>
        <div className={styles.propItem}>
          <label htmlFor={`label-${component.id}`}>Label</label>
          <input
            id={`label-${component.id}`}
            type="text"
            value={component.properties.label}
            onChange={(e) => handleLabelChange(e.target.value)}
          />
        </div>
        {controlType !== 'radio-buttons' && (
          <div className={styles.propItem}>
            <label htmlFor={`placeholder-${component.id}`}>Placeholder</label>
            <input
              id={`placeholder-${component.id}`}
              type="text"
              value={component.properties.placeholder || ''}
              onChange={(e) => handlePropertyChange({ placeholder: e.target.value })}
            />
          </div>
        )}
        <div className={styles.propItem}>
          <label htmlFor={`hint-${component.id}`}>Hint Text</label>
          <input
            id={`hint-${component.id}`}
            type="text"
            value={component.properties.hintText || ''}
            onChange={(e) => handlePropertyChange({ hintText: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.propSection}>
        <h4>Validation</h4>
        <div className={styles.propItemToggle}>
          <label htmlFor={`required-${component.id}`}>Required</label>
          <Switch
            id={`required-${component.id}`}
            checked={component.properties.required}
            onCheckedChange={(checked) => handlePropertyChange({ required: checked })}
          />
        </div>
      </div>

      <ContextualLayoutProperties component={component} />
    </>
  );
};

registerPropertyEditor('widget', FormEditor);
registerPropertyEditor('field', FormEditor);

export default FormEditor;