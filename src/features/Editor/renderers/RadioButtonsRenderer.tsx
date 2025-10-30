// src/features/Editor/renderers/RadioButtonsRenderer.tsx
import { memo, useRef } from 'react';
import { FormComponent } from '../../../types';
import { RendererProps } from './types';
import { useEditorInteractions } from '../useEditorInteractions';
import { CanvasSelectionToolbar } from '../CanvasSelectionToolbar';
import styles from '../EditorCanvas.module.css';

// --- Pure View Component ---
const RadioButtonsView = memo(({ label, required }: { label: string, required: boolean }) => {
  return (
    <div className={styles.formItemContent}>
      <label className={styles.formItemLabel}>
        {label}
        {required && <span style={{ color: 'var(--surface-fg-error)' }}> *</span>}
      </label>
      <div className={styles.controlPlaceholder}>Radio Group</div>
    </div>
  );
});

// --- Unified Renderer ---
export const RadioButtonsRenderer = ({ component, mode }: RendererProps<FormComponent>) => {
  const { isSelected, isDragging, isOnlySelection, sortableProps, selectionProps, dndListeners } = useEditorInteractions(component);

  // FIX: Create a stable ref to pass to the toolbar.
  const wrapperRef = useRef<HTMLDivElement>(null);
  const setMergedRefs = (node: HTMLDivElement | null) => {
    wrapperRef.current = node;
    sortableProps.ref(node);
  };

  if (mode === 'preview') {
    return <RadioButtonsView {...component.properties} />;
  }

  const wrapperClasses = `${styles.sortableItem} ${isDragging ? styles.isDragging : ''}`;
  const selectionClasses = `${styles.selectableWrapper} ${isSelected ? styles.selected : ''}`;

  return (
    <div className={wrapperClasses} {...sortableProps} data-id={component.id} ref={setMergedRefs}>
      <div className={selectionClasses} {...selectionProps}>
        {isOnlySelection && <CanvasSelectionToolbar componentId={component.id} referenceElement={wrapperRef.current} dndListeners={dndListeners} />}
        <RadioButtonsView {...component.properties} />
      </div>
    </div>
  );
};