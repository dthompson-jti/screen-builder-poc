// src/features/Editor/renderers/PlainTextRenderer.tsx
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
const PlainTextView = memo(({ content, textElement = 'p' }: { content?: string, textElement?: FormComponent['properties']['textElement'] }) => {
  const Tag = textElement || 'p';
  return <Tag style={{ margin: 0, padding: 'var(--spacing-2)' }}>{content || 'Plain Text'}</Tag>;
});

// --- Unified Renderer ---
export const PlainTextRenderer = ({ component, mode }: RendererProps<FormComponent>) => {
  const { isSelected, isEditing, isDragging, isOnlySelection, sortableProps, selectionProps, dndListeners } = useEditorInteractions(component);
  const setInteractionState = useSetAtom(canvasInteractionAtom);
  const commitAction = useSetAtom(commitActionAtom);

  // FIX: Create a stable ref to pass to the toolbar.
  const wrapperRef = useRef<HTMLDivElement>(null);
  const setMergedRefs = (node: HTMLDivElement | null) => {
    wrapperRef.current = node;
    sortableProps.ref(node);
  };

  const handleCommit = (newValue: string) => {
    commitAction({
      action: { type: 'COMPONENT_UPDATE_FORM_PROPERTIES', payload: { componentId: component.id, newProperties: { content: newValue } } },
      message: `Update text content`
    });
    setInteractionState({ mode: 'selecting', ids: [component.id] });
  };
  const handleCancel = () => setInteractionState({ mode: 'selecting', ids: [component.id] });
  const editable = useEditable<HTMLTextAreaElement>(component.properties.content || '', handleCommit, handleCancel, { multiline: true });

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
    return <PlainTextView {...component.properties} />;
  }

  const wrapperClasses = `${styles.sortableItem} ${isDragging ? styles.isDragging : ''}`;
  const selectionClasses = `${styles.selectableWrapper} ${isSelected ? styles.selected : ''}`;

  return (
    <div className={wrapperClasses} {...sortableProps} data-id={component.id} ref={setMergedRefs}>
      <div className={selectionClasses} {...selectionProps}>
        {isOnlySelection && <CanvasSelectionToolbar componentId={component.id} referenceElement={wrapperRef.current} dndListeners={dndListeners} />}
        {isEditing ? (
          <textarea {...editable} className={styles.inlineInput} onClick={(e) => e.stopPropagation()} style={{padding: 'var(--spacing-2)'}} />
        ) : (
          <PlainTextView {...component.properties} />
        )}
      </div>
    </div>
  );
};