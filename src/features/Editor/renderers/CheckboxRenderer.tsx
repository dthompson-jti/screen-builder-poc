// src/features/Editor/renderers/CheckboxRenderer.tsx
import { memo, useEffect, useRef } from 'react';
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
const CheckboxView = memo(({ label, required }: { label: string, required: boolean }) => {
  return (
    <div className={styles.formItemContent}>
      <div className={styles.checkboxExample}>
        <div className={styles.checkboxSquare} />
        <label className={styles.formItemLabel} style={{ marginBottom: 0 }}>
          {label}
          {required && <span style={{ color: 'var(--surface-fg-error)' }}> *</span>}
        </label>
      </div>
    </div>
  );
});

// --- Unified Renderer ---
export const CheckboxRenderer = ({ component, mode }: RendererProps<FormComponent>) => {
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
  const editable = useEditable<HTMLInputElement>(component.properties.label, handleCommit, handleCancel);

  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        editable.ref.current?.focus();
        editable.ref.current?.select();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isEditing, editable.ref]);

  if (mode === 'preview') {
    return <CheckboxView {...component.properties} />;
  }

  const wrapperClasses = `${styles.sortableItem} ${isDragging ? styles.isDragging : ''}`;
  const selectionClasses = `${styles.selectableWrapper} ${isSelected ? styles.selected : ''}`;

  return (
    <div className={wrapperClasses} {...sortableProps} data-id={component.id} ref={setMergedRefs}>
      <div className={selectionClasses} {...selectionProps}>
        {isOnlySelection && <CanvasSelectionToolbar componentId={component.id} referenceElement={wrapperRef.current} dndListeners={dndListeners} />}
        {isEditing ? (
          <div className={styles.formItemContent}>
             <div className={styles.checkboxExample}>
                <div className={styles.checkboxSquare} />
                <input {...editable} className={styles.inlineInput} onClick={(e) => e.stopPropagation()} />
            </div>
          </div>
        ) : (
          <CheckboxView {...component.properties} />
        )}
      </div>
    </div>
  );
};