// src/features/Editor/renderers/LinkRenderer.tsx
import React, { memo, useRef } from 'react';
import { FormComponent } from '../../../types';
import { RendererProps } from './types';
import { useEditorInteractions } from '../useEditorInteractions';
import { CanvasSelectionToolbar } from '../CanvasSelectionToolbar';
import styles from '../EditorCanvas.module.css';

// --- Pure View Component ---
const LinkView = memo(({ content, href }: { content?: string, href?: string }) => {
  return <a href={href}>{content || 'Link Text'}</a>;
});

// --- Unified Renderer ---
export const LinkRenderer = ({ component, mode }: RendererProps<FormComponent>) => {
  const { isSelected, isDragging, isOnlySelection, sortableProps, selectionProps, dndListeners } = useEditorInteractions(component);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const setMergedRefs = (node: HTMLDivElement | null) => {
    wrapperRef.current = node;
    sortableProps.ref(node);
  };

  if (mode === 'preview') {
    return <LinkView {...component.properties} />;
  }

  const wrapperClasses = `${styles.sortableItem} ${isDragging ? styles.isDragging : ''}`;
  const selectionClasses = `${styles.selectableWrapper} ${isSelected ? styles.selected : ''}`;

  return (
    <div className={wrapperClasses} {...sortableProps} data-id={component.id} ref={setMergedRefs}>
      <div className={selectionClasses} {...selectionProps} {...dndListeners}>
        {isOnlySelection && <CanvasSelectionToolbar componentId={component.id} referenceElement={wrapperRef.current} dndListeners={dndListeners} />}
        <div className={styles.formItemContent} onClick={(e: React.MouseEvent) => e.preventDefault()}>
          <LinkView {...component.properties} />
        </div>
      </div>
    </div>
  );
};