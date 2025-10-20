// src/features/Editor/PropertiesPanel/MultiSelectEditor.tsx
import { registerPropertyEditor, MultiSelectEditorProps } from './propertyEditorRegistry';
import styles from './PropertiesPanel.module.css';

const MultiSelectEditor = ({ count }: MultiSelectEditorProps) => (
  <div className={styles.propertiesPanelPlaceholder}>
    <span className="material-symbols-rounded">select_all</span>
    <p>{count} items selected</p>
  </div>
);

registerPropertyEditor('multi-select', MultiSelectEditor);
export default MultiSelectEditor;