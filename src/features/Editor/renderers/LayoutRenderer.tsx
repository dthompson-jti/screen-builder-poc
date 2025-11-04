// src/features/Editor/renderers/LayoutRenderer.tsx
import React, { useRef } from 'react';
import { useAtomValue } from 'jotai';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { overDndIdAtom, dropPlaceholderAtom, activeDndIdAtom } from '../../../data/atoms';
import { LayoutComponent } from '../../../types';
import { RendererProps } from './types';
import { CanvasNode } from '../CanvasNode';
import { CanvasEmptyState } from '../CanvasEmptyState';
import { DropPlaceholder } from '../CanvasUI';
import { useEditorInteractions } from '../useEditorInteractions';
import { CanvasSelectionToolbar } from '../CanvasSelectionToolbar';
import styles from '../EditorCanvas.module.css';

// --- Pure View Component ---
const LayoutView = React.memo(({ component, children }: { component: LayoutComponent, children?: React.ReactNode }) => {
  const appearance = component.properties.appearance;
  const spacingMap: { [key: string]: string } = { none: '0px', sm: 'var(--spacing-2)', md: 'var(--spacing-4)', lg: 'var(--spacing-6)', xl: 'var(--spacing-8)' };
  const gapMap = { none: '0px', sm: 'var(--spacing-2)', md: 'var(--spacing-4)', lg: 'var(--spacing-6)' };
  const containerStyle: React.CSSProperties = { padding: spacingMap[appearance?.padding || 'none'], borderRadius: 'var(--spacing-2)' };
  const contentStyle: React.CSSProperties = { display: 'flex', gap: gapMap[component.properties.gap] || gapMap.md };

  const { arrangement, distribution, verticalAlign, columnLayout } = component.properties;
  if (arrangement === 'stack') contentStyle.flexDirection = 'column';
  else if (arrangement === 'row') {
    contentStyle.flexDirection = 'row';
    contentStyle.flexWrap = 'nowrap';
    contentStyle.justifyContent = distribution;
    contentStyle.alignItems = verticalAlign;
  } else if (arrangement === 'wrap') {
    contentStyle.flexDirection = 'row';
    contentStyle.flexWrap = 'wrap';
    contentStyle.alignItems = 'start';
  } else if (arrangement === 'grid') {
    contentStyle.display = 'grid';
    const gridTemplateMap: { [key: string]: string } = { 'auto': 'repeat(auto-fill, minmax(150px, 1fr))', '2-col-50-50': '1fr 1fr', '3-col-33': '1fr 1fr 1fr', '2-col-split-left': '2fr 1fr' };
    contentStyle.gridTemplateColumns = typeof columnLayout === 'number' ? `repeat(${columnLayout}, 1fr)` : gridTemplateMap[columnLayout] || '1fr';
  }
  
  const wrapperStyle: React.CSSProperties = {};
  if (component.contextualLayout?.columnSpan) {
    wrapperStyle.gridColumn = `span ${component.contextualLayout.columnSpan}`;
  }

  return (
    <div style={wrapperStyle}>
      <div style={containerStyle} data-appearance-type={appearance?.type || 'transparent'} data-bordered={appearance?.bordered || false} data-arrangement={arrangement}>
        <div style={contentStyle} className="layout-content-wrapper">{children}</div>
      </div>
    </div>
  );
});

// --- Unified Renderer ---
export const LayoutRenderer = ({ component, mode }: RendererProps<LayoutComponent>) => {
  // FIX: All hooks are now called unconditionally at the top level.
  const { isSelected, isDragging, isOnlySelection, isRoot, sortableProps, selectionProps, dndListeners } = useEditorInteractions(component);
  const overId = useAtomValue(overDndIdAtom);
  const dropPlaceholder = useAtomValue(dropPlaceholderAtom);
  const activeDndId = useAtomValue(activeDndIdAtom);
  const containerContentRef = useRef<HTMLDivElement>(null);
  const { setNodeRef: setDroppableRef } = useDroppable({ id: component.id });
  const wrapperRef = useRef<HTMLDivElement>(null);

  if (mode === 'preview') {
    return (
      <LayoutView component={component}>
        {component.children.map(childId => <CanvasNode key={childId} componentId={childId} />)}
      </LayoutView>
    );
  }

  // The rest of the component logic for 'canvas' mode remains the same.
  const isEmpty = component.children.length === 0;
  const isOverContainer = overId === component.id;
  const isDragActive = !!activeDndId;

  const setMergedRefsForSortable = (node: HTMLDivElement | null) => {
    wrapperRef.current = node;
    sortableProps.ref(node);
  };
  const setMergedRefsForDroppable = (node: HTMLDivElement | null) => {
    containerContentRef.current = node;
    setDroppableRef(node);
  };

  const wrapperClasses = `${styles.sortableItem} ${isDragging ? styles.isDragging : ''}`;
  const selectionClasses = `${styles.selectableWrapper} ${isSelected ? styles.selected : ''}`;
  const containerClasses = [
    styles.formComponentWrapper, styles.layoutContainer,
    isEmpty ? styles.layoutContainerEmpty : '',
    isOverContainer ? styles['is-over-container'] : '',
    isDragActive ? styles['drag-active'] : '',
  ].filter(Boolean).join(' ');

  const parentRect = containerContentRef.current?.getBoundingClientRect();
  const showLinePlaceholder = dropPlaceholder?.parentId === component.id && dropPlaceholder.viewportRect && parentRect;

  return (
    <div className={wrapperClasses} {...sortableProps} data-id={component.id} ref={setMergedRefsForSortable}>
      <div className={selectionClasses} {...selectionProps} {...dndListeners}>
        {isOnlySelection && !isRoot && <CanvasSelectionToolbar componentId={component.id} referenceElement={wrapperRef.current} dndListeners={dndListeners} />}
        <div className={containerClasses} data-has-user-border={component.properties.appearance?.bordered} data-is-root={isRoot}>
          <div ref={setMergedRefsForDroppable} className={styles.layoutContainerContent}>
            <LayoutView component={component}>
              {isEmpty ? (isRoot ? <CanvasEmptyState /> : <span className={styles.emptyText}>Drag components here</span>) : (
                <SortableContext items={component.children} strategy={verticalListSortingStrategy}>
                  {component.children.map(childId => <CanvasNode key={childId} componentId={childId} />)}
                </SortableContext>
              )}
            </LayoutView>
            {showLinePlaceholder && <DropPlaceholder placeholderProps={{ viewportRect: dropPlaceholder.viewportRect!, isGrid: dropPlaceholder.isGrid, parentRect: parentRect }} />}
          </div>
        </div>
      </div>
    </div>
  );
};