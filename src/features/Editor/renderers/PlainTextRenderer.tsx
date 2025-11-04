// src/features/Editor/renderers/PlainTextRenderer.tsx
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
const PlainTextView = memo(({ content, textElement = 'p' }: { content?: string, textElement?: FormComponent['properties']['textElement'] }) => {
  const Tag = textElement || 'p';
  if (Tag === 'p') {
    return <p style={{ whiteSpace: 'pre-wrap' }}>{content || 'Plain Text'}</p>;
  }
  return <Tag>{content || 'Plain Text'}</Tag>;
});

// --- Unified Renderer ---
export const PlainTextRenderer = ({ component, mode }: RendererProps<FormComponent>) => {
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
      action: { type: 'COMPONENT_UPDATE_FORM_PROPERTIES', payload: { componentId: component.id, newProperties: { content: newValue } } },
      message: `Update text content`
    });
    setInteractionState({ mode: 'selecting', ids: [component.id] });
  };
  const handleCancel = () => setInteractionState({ mode: 'selecting', ids: [component.id] });
  
  const isHeading = component.properties.textElement?.startsWith('h');
  const { ref, ...editableProps } = useEditable<HTMLInputElement | HTMLTextAreaElement>(
    component.properties.content || '',
    handleCommit,
    handleCancel,
    isEditing,
    { multiline: !isHeading }
  );
  
  if (mode === 'preview') {
    return <PlainTextView {...component.properties} />;
  }

  const wrapperClasses = `${styles.sortableItem} ${isDragging ? styles.isDragging : ''}`;
  const selectionClasses = `${styles.selectableWrapper} ${isSelected ? styles.selected : ''}`;

  const textElement = component.properties.textElement || 'p';
  const inlineInputClasses = `${styles.inlineInput} ${styles[`is-${textElement}`]}`;

  return (
    <div className={wrapperClasses} {...sortableProps} data-id={component.id} ref={setMergedRefs}>
      <div className={selectionClasses} {...selectionProps} {...dndListeners}>
        {isOnlySelection && <CanvasSelectionToolbar componentId={component.id} referenceElement={wrapperRef.current} dndListeners={dndListeners} />}
        <div className={styles.formItemContent}>
          {isEditing ? (
            isHeading ? (
              <input
                {...editableProps}
                ref={ref as React.Ref<HTMLInputElement>}
                className={inlineInputClasses}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <textarea
                {...editableProps}
                ref={ref as React.Ref<HTMLTextAreaElement>}
                className={inlineInputClasses}
                onClick={(e) => e.stopPropagation()}
              />
            )
          ) : (
            <PlainTextView {...component.properties} />
          )}
        </div>
      </div>
    </div>
  );
};