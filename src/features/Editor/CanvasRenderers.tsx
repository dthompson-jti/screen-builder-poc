// src/features/Editor/CanvasRenderers.tsx
import React, { useRef } from 'react';
import { useAtomValue } from 'jotai';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { 
  overDndIdAtom, 
  dropPlaceholderAtom, 
  activeDndIdAtom, 
} from '../../data/atoms';
import { rootComponentIdAtom } from '../../data/historyAtoms';
import { CanvasComponent, FormComponent, LayoutComponent, DndData } from '../../types';
import { EditableProps } from '../../data/useEditable';
import { CanvasNode } from './CanvasNode';
import { CanvasEmptyState } from './CanvasEmptyState';
import { DropPlaceholder } from './CanvasUI';
// REMOVED: import { getComponentName } from './canvasUtils'; 

import { TextInputPreview } from '../Editor/previews/TextInputPreview';
import DropdownPreview from '../Editor/previews/DropdownPreview';
import RadioButtonsPreview from '../Editor/previews/RadioButtonsPreview';
import PlainTextPreview from '../Editor/previews/PlainTextPreview';

import styles from './EditorCanvas.module.css';

// --- RENDERER COMPONENTS (PURE) ---
export const FormItemRenderer = React.memo(({ component, isEditing, editable }: { component: FormComponent, isEditing: boolean, editable?: EditableProps<HTMLInputElement | HTMLTextAreaElement>}) => {
    const { label, controlType, content } = component.properties;
    const commonProps = { label, content, isEditing };

    if (controlType === 'plain-text') {
        return <PlainTextPreview {...commonProps} editableProps={isEditing ? editable as EditableProps<HTMLTextAreaElement> : undefined} />;
    }
    if (controlType === 'dropdown') {
        return <DropdownPreview {...commonProps} editableProps={isEditing ? editable as EditableProps<HTMLInputElement> : undefined} />;
    }
    if (controlType === 'radio-buttons') {
        return <RadioButtonsPreview {...commonProps} editableProps={isEditing ? editable as EditableProps<HTMLInputElement> : undefined} />;
    }
    return <TextInputPreview {...commonProps} editableProps={isEditing ? editable as EditableProps<HTMLInputElement> : undefined} />;
});

export const LayoutRenderer = ({ component }: { component: LayoutComponent }) => {
  const overId = useAtomValue(overDndIdAtom);
  const dropPlaceholder = useAtomValue(dropPlaceholderAtom);
  const activeDndId = useAtomValue(activeDndIdAtom);
  const rootId = useAtomValue(rootComponentIdAtom);
  
  const isRoot = component.id === rootId;
  const isEmpty = component.children.length === 0;
  const isOverContainer = overId === component.id;
  const isDragActive = !!activeDndId;
  const appearance = component.properties.appearance;

  const containerContentRef = useRef<HTMLDivElement>(null);
  const { setNodeRef } = useDroppable({
    id: component.id,
    data: { id: component.id, name: component.name, type: 'layout', childrenCount: component.children.length } satisfies DndData
  });
  const setMergedRefs = (node: HTMLDivElement | null) => {
    containerContentRef.current = node;
    setNodeRef(node);
  };
  
  const containerClasses = [
    styles.formComponentWrapper,
    styles.layoutContainer,
    isEmpty ? styles.layoutContainerEmpty : '',
    isOverContainer ? styles['is-over-container'] : '',
    isDragActive ? styles['drag-active'] : '',
  ].filter(Boolean).join(' ');

  const spacingMap: { [key: string]: string } = { none: '0px', sm: 'var(--spacing-2)', md: 'var(--spacing-4)', lg: 'var(--spacing-6)', xl: 'var(--spacing-8)' };
  const gapMap = { none: '0px', sm: 'var(--spacing-2)', md: 'var(--spacing-4)', lg: 'var(--spacing-6)' };

  const contentAppearanceStyle: React.CSSProperties = { padding: spacingMap[appearance?.padding || 'none'] };
  const contentLayoutStyle: React.CSSProperties = { display: 'flex', gap: gapMap[component.properties.gap] || gapMap.md };

  const { arrangement, distribution, verticalAlign, columnLayout } = component.properties;
  if (arrangement === 'stack') contentLayoutStyle.flexDirection = 'column';
  else if (arrangement === 'row') {
    contentLayoutStyle.flexDirection = 'row';
    contentLayoutStyle.flexWrap = 'nowrap';
    contentLayoutStyle.justifyContent = distribution;
    contentLayoutStyle.alignItems = verticalAlign;
  } else if (arrangement === 'wrap') {
    contentLayoutStyle.flexDirection = 'row';
    contentLayoutStyle.flexWrap = 'wrap';
    contentLayoutStyle.alignItems = 'start';
  } else if (arrangement === 'grid') {
    contentLayoutStyle.display = 'grid';
    const gridTemplateMap: {[key: string]: string} = { 'auto': 'repeat(auto-fill, minmax(150px, 1fr))', '2-col-50-50': '1fr 1fr', '3-col-33': '1fr 1fr 1fr', '2-col-split-left': '2fr 1fr' };
    contentLayoutStyle.gridTemplateColumns = typeof columnLayout === 'number' ? `repeat(${columnLayout}, 1fr)` : gridTemplateMap[columnLayout] || '1fr';
  }

  const parentRect = containerContentRef.current?.getBoundingClientRect();
  const showLinePlaceholder = dropPlaceholder?.parentId === component.id && dropPlaceholder.viewportRect && parentRect;
  
  return (
    <div className={containerClasses} data-has-user-border={appearance?.bordered}>
      <div ref={setMergedRefs} className={styles.layoutContainerContent} style={contentAppearanceStyle} data-appearance-type={appearance?.type || 'transparent'} data-bordered={appearance?.bordered || false} data-arrangement={arrangement}>
        <div style={contentLayoutStyle} className="layout-content-wrapper">
          {isEmpty ? 
            (isRoot ? <CanvasEmptyState /> : <span className={styles.emptyText}>Drag components here</span>) : 
            (
              <SortableContext items={component.children} strategy={verticalListSortingStrategy}>
                {component.children.map(childId => <CanvasNode key={childId} componentId={childId} />)}
              </SortableContext>
            )
          }
        </div>
        {showLinePlaceholder && <DropPlaceholder placeholderProps={{ viewportRect: dropPlaceholder.viewportRect!, isGrid: dropPlaceholder.isGrid, parentRect: parentRect }} />}
      </div>
    </div>
  );
};

export const ComponentRenderer = ({ component, isEditing, editable }: { component: CanvasComponent, isEditing: boolean, editable?: EditableProps<HTMLInputElement | HTMLTextAreaElement> }) => {
  if (component.componentType === 'layout') {
    return <LayoutRenderer component={component} />;
  }
  // FIX: Re-introduce the .formComponentWrapper for FormItems so the selection style can target it.
  return (
    <div className={styles.formComponentWrapper}>
      <FormItemRenderer component={component} isEditing={isEditing} editable={editable} />
    </div>
  );
};