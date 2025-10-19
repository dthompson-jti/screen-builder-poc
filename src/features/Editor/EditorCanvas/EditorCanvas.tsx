// src/features/Editor/EditorCanvas/EditorCanvas.tsx
import React, { useRef, useEffect, useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useDroppable, DraggableSyntheticListeners, ClientRect } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  canvasInteractionAtom,
  selectedCanvasComponentIdsAtom,
  overDndIdAtom, 
  dropPlaceholderAtom, 
  activeDndIdAtom, 
  isPropertiesPanelVisibleAtom,
} from '../../../data/atoms';
import { canvasComponentsByIdAtom, commitActionAtom, rootComponentIdAtom, formNameAtom } from '../../../data/historyAtoms';
import { CanvasComponent, FormComponent, LayoutComponent, DndData } from '../../../types';
import { useEditable, EditableProps } from '../../../data/useEditable';
import { useEditorHotkeys } from '../../../data/useEditorHotkeys';
import { SelectionToolbar } from './SelectionToolbar';
import { CanvasEmptyState } from './CanvasEmptyState';
import { TextInputPreview } from '../previews/TextInputPreview';
import DropdownPreview from '../previews/DropdownPreview';
import RadioButtonsPreview from '../previews/RadioButtonsPreview';
import PlainTextPreview from '../previews/PlainTextPreview';
import styles from './EditorCanvas.module.css';

// --- TYPE DEFINITIONS ---
interface SelectionWrapperProps {
  component: CanvasComponent;
  dndListeners?: DraggableSyntheticListeners;
  children: React.ReactNode;
}

// --- UTILITY ---
const getComponentName = (component: CanvasComponent): string => {
  if (component.componentType === 'layout') {
    return component.name;
  }
  const formComponent = component;
  if (formComponent.properties.controlType === 'plain-text') {
    return formComponent.properties.content?.substring(0, 30) || 'Plain Text';
  }
  return formComponent.properties.label;
};

// --- RENDERER COMPONENTS (PURE) ---
const FormItemRenderer = React.memo(({ component, isEditing, editable }: { component: FormComponent, isEditing: boolean, editable?: EditableProps<HTMLInputElement | HTMLTextAreaElement>}) => {
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

const LayoutRenderer = ({ component }: { component: LayoutComponent }) => {
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

const ComponentRenderer = ({ component, isEditing, editable }: { component: CanvasComponent, isEditing: boolean, editable?: EditableProps<HTMLInputElement | HTMLTextAreaElement> }) => {
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


// --- INTERACTION WRAPPERS ---
const SelectionWrapper = ({ component, dndListeners, children }: SelectionWrapperProps) => {
  const [interactionState, setInteractionState] = useAtom(canvasInteractionAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const rootId = useAtomValue(rootComponentIdAtom);
  
  const isRoot = component.id === rootId;
  const isSelected = (interactionState.mode === 'selecting' && interactionState.ids.includes(component.id));
  const isEditing = interactionState.mode === 'editing' && interactionState.id === component.id;
  const showToolbar = isSelected && !isEditing && interactionState.mode === 'selecting' && interactionState.ids.length === 1 && !isRoot;

  const isPlainText = component.componentType !== 'layout' && component.properties.controlType === 'plain-text';

  // --- Handlers ---
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRoot) return;

    if ((e.altKey && component.componentType !== 'layout') || (e.detail === 2 && isPlainText)) {
      setInteractionState({ mode: 'editing', id: component.id });
      return;
    }
    
    if (e.shiftKey) {
      const currentIds = interactionState.mode === 'selecting' ? interactionState.ids : [];
      const newIds = currentIds.includes(component.id)
        ? currentIds.filter(id => id !== component.id)
        : [...currentIds, component.id];
      setInteractionState(newIds.length > 0 ? { mode: 'selecting', ids: newIds } : { mode: 'idle' });
    } else {
      setInteractionState({ mode: 'selecting', ids: [component.id] });
    }
  };

  const handleDelete = () => {
    commitAction({
      action: { type: 'COMPONENT_DELETE', payload: { componentId: component.id } },
      message: `Delete '${getComponentName(component)}'`
    });
    setInteractionState({ mode: 'idle' });
  };
  
  const handleRename = () => {
    if (component.componentType !== 'layout') {
      setInteractionState({ mode: 'editing', id: component.id });
    }
  };

  const handleNudge = (direction: 'up' | 'down') => {
      const parent = allComponents[component.parentId];
      if (!parent || parent.componentType !== 'layout') return;
      const oldIndex = parent.children.indexOf(component.id);
      const newIndex = direction === 'up' ? oldIndex - 1 : oldIndex + 1;
      if (newIndex >= 0 && newIndex < parent.children.length) {
          commitAction({
              action: { type: 'COMPONENT_REORDER', payload: { componentId: component.id, parentId: parent.id, oldIndex, newIndex } },
              message: `Reorder component`
          });
      }
  };

  const className = isSelected && !isRoot ? styles.selected : '';

  return (
    <div className={className} onClick={handleSelect}>
      {showToolbar && <SelectionToolbar onDelete={handleDelete} onRename={handleRename} onNudge={handleNudge} listeners={dndListeners} />}
      {children}
    </div>
  );
};

const SortableWrapper = ({ component, children }: { component: CanvasComponent, children: React.ReactNode }) => {
  const rootId = useAtomValue(rootComponentIdAtom);
  const isRoot = component.id === rootId;
  const isEmptyContainer = component.componentType === 'layout' && component.children.length === 0;
  const isDisabled = isEmptyContainer || isRoot;

  const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: component.id,
    data: { 
      id: component.id,
      name: getComponentName(component),
      type: component.componentType,
      childrenCount: component.componentType === 'layout' ? component.children.length : undefined,
    } satisfies DndData,
    disabled: isDisabled,
  });
  
  const sortableStyle: React.CSSProperties = { 
    transform: CSS.Transform.toString(transform), 
    transition,
  };
  
  if (component.contextualLayout?.columnSpan) {
    sortableStyle.gridColumn = `span ${component.contextualLayout.columnSpan}`;
  }

  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const parent = allComponents[component.parentId];
  if (parent && parent.componentType === 'layout' && parent.properties.arrangement === 'wrap') {
    sortableStyle.flexShrink = component.contextualLayout?.preventShrinking ? 0 : 1;
  }
  
  if (isDisabled) {
    sortableStyle.transform = 'none';
  }
  
  const className = `${styles.sortableItem} ${isDragging ? styles.isDragging : ''}`;

  return (
    <div ref={setNodeRef} style={sortableStyle} className={className} data-id={component.id}>
      {React.cloneElement(children as React.ReactElement<Partial<SelectionWrapperProps>>, { dndListeners: listeners })}
    </div>
  );
};


// --- ORCHESTRATOR COMPONENT ---
const CanvasNode = ({ componentId }: { componentId: string }) => {
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const [interactionState, setInteractionState] = useAtom(canvasInteractionAtom);
  const commitAction = useSetAtom(commitActionAtom);
  
  const component = allComponents[componentId];
  const isEditing = interactionState.mode === 'editing' && interactionState.id === componentId;

  const handleValueCommit = useCallback((newValue: string) => {
    if (!component || component.componentType === 'layout') return;
    const isPlainText = component.properties.controlType === 'plain-text';
    const propertiesToUpdate = isPlainText ? { content: newValue } : { label: newValue };
    const message = isPlainText ? `Update text content` : `Rename to '${newValue}'`;
    
    commitAction({
      action: { type: 'COMPONENT_UPDATE_FORM_PROPERTIES', payload: { componentId: component.id, newProperties: propertiesToUpdate } },
      message
    });
    setInteractionState({ mode: 'selecting', ids: [component.id] });
  }, [commitAction, setInteractionState, component]);

  const handleCancelEdit = useCallback(() => {
    setInteractionState({ mode: 'selecting', ids: [componentId] });
  }, [setInteractionState, componentId]);
  
  const editable = useEditable<HTMLInputElement | HTMLTextAreaElement>(
    (component?.componentType !== 'layout' && component?.properties.controlType === 'plain-text') 
      ? component.properties.content || '' 
      : (component as FormComponent)?.properties.label || '',
    handleValueCommit,
    handleCancelEdit,
    { multiline: component?.componentType !== 'layout' && component.properties.controlType === 'plain-text' }
  );

  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        editable.ref.current?.focus();
        editable.ref.current?.select();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isEditing, editable.ref]);

  if (!component) {
    return null;
  }

  return (
    <SortableWrapper component={component}>
      <SelectionWrapper component={component}>
        <ComponentRenderer component={component} isEditing={isEditing} editable={editable} />
      </SelectionWrapper>
    </SortableWrapper>
  );
};


// --- UI ARTIFACTS ---
const DropPlaceholder = ({ placeholderProps }: { placeholderProps: { viewportRect: ClientRect; isGrid: boolean; parentRect: DOMRect | undefined; } }) => {
  const { viewportRect, isGrid, parentRect } = placeholderProps;
  if (!parentRect) return null;

  const placeholderStyle: React.CSSProperties = {
    top: `${viewportRect.top - parentRect.top}px`,
    left: `${viewportRect.left - parentRect.left}px`,
    width: `${viewportRect.width}px`,
  };
  
  if (isGrid) {
    placeholderStyle.height = `${viewportRect.height}px`;
  }
  
  const className = `${styles.dropPlaceholder} ${isGrid ? styles.isGrid : ''}`;
  return <div className={className} style={placeholderStyle} />;
};

const FloatingSelectionToolbar = () => {
  const selectedIds = useAtomValue(selectedCanvasComponentIdsAtom);
  const interactionState = useAtomValue(canvasInteractionAtom);
  const setInteractionState = useSetAtom(canvasInteractionAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);

  const handleWrap = () => {
    if (selectedIds.length === 0) return;
    const firstSelected = allComponents[selectedIds[0]];
    if (!firstSelected) return;
    commitAction({
      action: { type: 'COMPONENTS_WRAP', payload: { componentIds: selectedIds, parentId: firstSelected.parentId } },
      message: `Wrap ${selectedIds.length} component(s)`
    });
  };

  const handleDelete = () => {
    commitAction({
      action: { type: 'COMPONENTS_DELETE_BULK', payload: { componentIds: selectedIds } },
      message: `Delete ${selectedIds.length} components`
    });
    setInteractionState({ mode: 'idle' });
  };

  if (interactionState.mode !== 'selecting' || interactionState.ids.length <= 1) {
    return null;
  }

  return (
    <div className={styles.floatingSelectionToolbar}>
      <span className={styles.floatingToolbarText}>{selectedIds.length} selected</span>
      <div className={styles.floatingToolbarDivider} />
      <button className="btn btn-tertiary on-solid" onClick={handleWrap} aria-label="Wrap in container">
        <span className="material-symbols-rounded">pageless</span>
      </button>
      <button className="btn btn-tertiary on-solid" onClick={handleDelete} aria-label="Delete selected components">
        <span className="material-symbols-rounded">delete</span>
      </button>
    </div>
  );
};


// --- MAIN COMPONENT ---
export const EditorCanvas = () => {
  const rootId = useAtomValue(rootComponentIdAtom);
  const screenName = useAtomValue(formNameAtom);
  const setInteractionState = useSetAtom(canvasInteractionAtom);
  const setIsPropertiesPanelVisible = useSetAtom(isPropertiesPanelVisibleAtom);
  
  useEditorHotkeys();

  const handleCanvasClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInteractionState({ mode: 'selecting', ids: [rootId] });
    setIsPropertiesPanelVisible(true);
  };

  const handleContainerClick = () => setInteractionState({ mode: 'idle' });

  return (
    <div className={styles.canvasContainer} onClick={handleContainerClick}>
      <div className={styles.formCard} onClick={handleCanvasClick}>
        <div className={styles.formCardHeader}><h2>{screenName}</h2></div>
        <div className={styles.canvasDroppableArea}>
          {rootId && <CanvasNode componentId={rootId} />}
        </div>
      </div>
      <FloatingSelectionToolbar />
    </div>
  );
};