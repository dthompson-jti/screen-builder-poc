// src/features/Editor/renderers/RadioButtonsRenderer.tsx
import { memo, useRef } from 'react';
import { useSetAtom } from 'jotai';
import { canvasInteractionAtom } from '../../../data/atoms';
import { commitActionAtom } from '../../../data/historyAtoms';
import { useEditable } from '../../../data/useEditable';
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
        {required && <span className="required-indicator">*</span>}
      </label>
      <div className={styles.radioGroupExample}>
        <div className={styles.radioOptionExample}>
          <div className={styles.radioCircle} />
          <span>Option 1</span>
        </div>
        <div className={styles.radioOptionExample}>
          <div className={styles.radioCircle} />
          <span>Option 2</span>
        </div>
      </div>
    </div>
  );
});

// --- Unified Renderer ---
export const RadioButtonsRenderer = ({ component, mode }: RendererProps<FormComponent>) => {
  const { isSelected, isEditing, isDragging, isOnlySelection, sortableProps, selectionProps, dndListeners } = useEditorInteractions(component);
  const setInteractionState = useSetAtom(canvasInteractionAtom);
  const commitAction = useSetAtom(commitActionAtom);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const setMergedRefs = (node: HTMLDivElement | null) => {
    wrapperRef.current = node;
    sortableProps.ref(node);
  };

  const handleCommit = (newValue: string) => {
    commitAction({
      action: { type: 'COMPONENT_UPDATE_FORM_PROPERTIES', payload: { componentId: component.id, newProperties: { label: newValue } } },
      message: `Rename to '${newValue}'`
    });
    setInteractionState({ mode: 'selecting', ids: [component.id] });
  };
  const handleCancel = () => setInteractionState({ mode: 'selecting', ids: [component.id] });
  const { ref, ...editableProps } = useEditable<HTMLInputElement>(component.properties.label, handleCommit, handleCancel, isEditing);

  if (mode === 'preview') {
    return <RadioButtonsView {...component.properties} />;
  }

  const wrapperClasses = `${styles.sortableItem} ${isDragging ? styles.isDragging : ''}`;
  const selectionClasses = `${styles.selectableWrapper} ${isSelected ? styles.selected : ''}`;

  return (
    <div className={wrapperClasses} {...sortableProps} data-id={component.id} ref={setMergedRefs}>
      <div className={selectionClasses} {...selectionProps} {...dndListeners}>
        {isOnlySelection && <CanvasSelectionToolbar componentId={component.id} referenceElement={wrapperRef.current} dndListeners={dndListeners} />}
        {isEditing ? (
          <div className={styles.formItemContent}>
            <input {...editableProps} ref={ref} className={`${styles.inlineInput} ${styles.inlineInputForLabel}`} onClick={(e) => e.stopPropagation()} />
            <div className={styles.radioGroupExample}>
              <div className={styles.radioOptionExample}>
                <div className={styles.radioCircle} />
                <span>Option 1</span>
              </div>
              <div className={styles.radioOptionExample}>
                <div className={styles.radioCircle} />
                <span>Option 2</span>
              </div>
            </div>
          </div>
        ) : (
          <RadioButtonsView {...component.properties} />
        )}
      </div>
    </div>
  );
};