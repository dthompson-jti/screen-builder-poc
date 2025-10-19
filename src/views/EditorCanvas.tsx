// src/views/EditorCanvas.tsx
import React, { useRef, useEffect, useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useDroppable, DraggableSyntheticListeners, ClientRect } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  canvasInteractionAtom,
  selectedCanvasComponentIdsAtom, // Read-only derived atom
  overDndIdAtom, 
  dropPlaceholderAtom, 
  activeDndIdAtom, 
  isPropertiesPanelVisibleAtom,
} from '../data/atoms';
import { canvasComponentsByIdAtom, commitActionAtom, rootComponentIdAtom, formNameAtom } from '../data/historyAtoms';
import { CanvasComponent, FormComponent, LayoutComponent, DndData } from '../types';
import { useEditable } from '../data/useEditable';
import { SelectionToolbar } from '../components/SelectionToolbar';
import { CanvasEmptyState } from '../components/CanvasEmptyState';
import { TextInputPreview } from '../components/TextInputPreview';
import DropdownPreview from '../components/DropdownPreview';
import RadioButtonsPreview from '../components/RadioButtonsPreview';
import styles from './EditorCanvas.module.css';

// Helper to get the display name/label
const getComponentName = (component: CanvasComponent): string => {
    return component.componentType === 'layout' ? component.name : component.properties.label;
}

// --- Floating Toolbar for Multi-Select ---
const FloatingSelectionToolbar = () => {
  const selectedIds = useAtomValue(selectedCanvasComponentIdsAtom);
  const [interactionState, setInteractionState] = useAtom(canvasInteractionAtom);
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


// --- Recursive Canvas Node ---
const CanvasNode = ({ componentId }: { componentId: string }) => {
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const component = allComponents[componentId];

  if (!component) return null;

  const componentToRender = () => {
    if (component.componentType === 'layout') {
      return <LayoutContainer component={component} />;
    }
    return <FormItem component={component} />;
  };
  
  return (
    <SortableItem component={component}>
      {componentToRender()}
    </SortableItem>
  );
};

// --- Sortable Item Wrapper ---
const SortableItem = ({ component, children }: { component: CanvasComponent, children: React.ReactNode }) => {
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
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
      {React.cloneElement(children as React.ReactElement, { dndListeners: listeners })}
    </div>
  );
};

// --- Drop Placeholder (Line or Block) ---
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


// --- Layout Container Component ---
const LayoutContainer = ({ component, dndListeners }: { component: LayoutComponent, dndListeners?: DraggableSyntheticListeners }) => {
  const [interactionState, setInteractionState] = useAtom(canvasInteractionAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const overId = useAtomValue(overDndIdAtom);
  const dropPlaceholder = useAtomValue(dropPlaceholderAtom);
  const activeDndId = useAtomValue(activeDndIdAtom);
  const rootId = useAtomValue(rootComponentIdAtom);

  const isRoot = component.id === rootId;
  const isSelected = (interactionState.mode === 'selecting' && interactionState.ids.includes(component.id)) ||
                     (interactionState.mode === 'editing' && interactionState.id === component.id);
  const appearance = component.properties.appearance;

  const containerContentRef = useRef<HTMLDivElement>(null);
  const { setNodeRef } = useDroppable({
    id: component.id,
    data: { 
      id: component.id,
      name: component.name,
      type: 'layout', 
      childrenCount: component.children.length 
    } satisfies DndData
  });
  const setMergedRefs = (node: HTMLDivElement | null) => {
    containerContentRef.current = node;
    setNodeRef(node);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRoot) return;
    
    if (e.shiftKey && interactionState.mode === 'selecting') {
      const newIds = interactionState.ids.includes(component.id)
        ? interactionState.ids.filter(id => id !== component.id)
        : [...interactionState.ids, component.id];
      setInteractionState(newIds.length > 0 ? { mode: 'selecting', ids: newIds } : { mode: 'idle' });
    } else {
      setInteractionState({ mode: 'selecting', ids: [component.id] });
    }
  };

  const handleDelete = () => {
    commitAction({
      action: { type: 'COMPONENT_DELETE', payload: { componentId: component.id } },
      message: `Delete '${component.name}'`
    });
    setInteractionState({ mode: 'idle' });
  };
  
  const handleRename = () => {}; // Layouts can't be renamed inline

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
  
  const isOverContainer = overId === component.id;
  const isEmpty = component.children.length === 0;
  const isDragActive = !!activeDndId;
  
  const containerClasses = [
    styles.formComponentWrapper,
    styles.layoutContainer,
    isSelected ? styles.selected : '',
    isEmpty ? styles.layoutContainerEmpty : '',
    isOverContainer ? styles['is-over-container'] : '',
    isDragActive ? styles['drag-active'] : '',
  ].filter(Boolean).join(' ');

  const spacingMap: { [key: string]: string } = {
    none: '0px', sm: 'var(--spacing-2)', md: 'var(--spacing-4)',
    lg: 'var(--spacing-6)', xl: 'var(--spacing-8)'
  };
  
  const contentAppearanceStyle: React.CSSProperties = {
    padding: spacingMap[appearance?.padding || 'none'],
  };

  const gapMap = { none: '0px', sm: 'var(--spacing-2)', md: 'var(--spacing-4)', lg: 'var(--spacing-6)' };
  const contentLayoutStyle: React.CSSProperties = {
    display: 'flex',
    gap: gapMap[component.properties.gap] || gapMap.md,
  };

  const arrangement = component.properties.arrangement;
  if (arrangement === 'stack') contentLayoutStyle.flexDirection = 'column';
  else if (arrangement === 'row') {
    contentLayoutStyle.flexDirection = 'row';
    contentLayoutStyle.flexWrap = 'nowrap';
    contentLayoutStyle.justifyContent = component.properties.distribution;
    contentLayoutStyle.alignItems = component.properties.verticalAlign;
  } else if (arrangement === 'wrap') {
    contentLayoutStyle.flexDirection = 'row';
    contentLayoutStyle.flexWrap = 'wrap';
    contentLayoutStyle.alignItems = 'start';
  } else if (arrangement === 'grid') {
    contentLayoutStyle.display = 'grid';
    const gridTemplateMap: {[key: string]: string} = {
      'auto': 'repeat(auto-fill, minmax(150px, 1fr))',
      '2-col-50-50': '1fr 1fr',
      '3-col-33': '1fr 1fr 1fr',
      '2-col-split-left': '2fr 1fr',
    };
    const { columnLayout } = component.properties;
    contentLayoutStyle.gridTemplateColumns = typeof columnLayout === 'number' ? `repeat(${columnLayout}, 1fr)` : gridTemplateMap[columnLayout] || '1fr';
  }

  const parentRect = containerContentRef.current?.getBoundingClientRect();
  const showLinePlaceholder = dropPlaceholder?.parentId === component.id && dropPlaceholder.viewportRect && parentRect;
  
  const renderEmptyState = () => isRoot ? <CanvasEmptyState /> : <span className={styles.emptyText}>Drag components here</span>;

  const showToolbar = interactionState.mode === 'selecting' && interactionState.ids.length === 1 && interactionState.ids[0] === component.id && !isRoot;

  return (
    <div className={containerClasses} onClick={handleSelect}>
      {showToolbar && <SelectionToolbar onDelete={handleDelete} onRename={handleRename} onNudge={handleNudge} listeners={dndListeners} />}
      <div ref={setMergedRefs} className={styles.layoutContainerContent} style={contentAppearanceStyle} data-appearance-type={appearance?.type || 'transparent'} data-bordered={appearance?.bordered || false} data-arrangement={arrangement}>
        <div style={contentLayoutStyle} className="layout-content-wrapper">
          {isEmpty ? ( renderEmptyState() ) : (
            <SortableContext items={component.children} strategy={verticalListSortingStrategy}>
              {component.children.map(childId => <CanvasNode key={childId} componentId={childId} />)}
            </SortableContext>
          )}
        </div>
        {showLinePlaceholder && <DropPlaceholder placeholderProps={{ viewportRect: dropPlaceholder.viewportRect!, isGrid: dropPlaceholder.isGrid, parentRect: parentRect }} />}
      </div>
    </div>
  );
};

// --- Form Item (e.g., TextInput) ---
const FormItem = ({ component, dndListeners }: { component: FormComponent, dndListeners?: DraggableSyntheticListeners }) => {
  const [interactionState, setInteractionState] = useAtom(canvasInteractionAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const commitAction = useSetAtom(commitActionAtom);

  const isSelected = (interactionState.mode === 'selecting' && interactionState.ids.includes(component.id));
  const isEditing = interactionState.mode === 'editing' && interactionState.id === component.id;

  const handleLabelCommit = useCallback((newLabel: string) => {
    commitAction({
      action: { type: 'COMPONENT_UPDATE_FORM_PROPERTIES', payload: { componentId: component.id, newProperties: { label: newLabel } } },
      message: `Rename to '${newLabel}'`
    });
    setInteractionState({ mode: 'selecting', ids: [component.id] });
  }, [commitAction, setInteractionState, component.id]);

  const handleCancelEdit = useCallback(() => {
    setInteractionState({ mode: 'selecting', ids: [component.id] });
  }, [setInteractionState, component.id]);

  const editable = useEditable(
    component.properties.label,
    handleLabelCommit,
    handleCancelEdit
  );

  // NEW EFFECT FOR FOCUS MANAGEMENT
  useEffect(() => {
    if (isEditing) {
      // Use a timeout to ensure the input is in the DOM and ready for focus.
      // This is a common pattern to handle focus after a conditional render.
      const timer = setTimeout(() => {
        editable.ref.current?.focus();
        editable.ref.current?.select();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isEditing, editable.ref]);

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (e.altKey) {
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
      message: `Delete '${component.properties.label}'`
    });
    setInteractionState({ mode: 'idle' });
  };
  
  const handleRename = () => setInteractionState({ mode: 'editing', id: component.id });

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

  const wrapperClassName = `${styles.formComponentWrapper} ${isSelected ? styles.selected : ''}`;
  
  const renderPreview = () => {
    const { label, controlType } = component.properties;
    const commonProps = {
      label,
      isEditing,
      editableProps: isEditing ? {
        ref: editable.ref,
        value: editable.value,
        onChange: editable.onChange,
        onKeyDown: editable.onKeyDown,
        onBlur: editable.onBlur
      } : undefined
    };

    switch (controlType) {
      case 'dropdown': return <DropdownPreview {...commonProps} />;
      case 'radio-buttons': return <RadioButtonsPreview {...commonProps} />;
      default: return <TextInputPreview {...commonProps} />;
    }
  };

  const showToolbar = isSelected && !isEditing && interactionState.mode === 'selecting' && interactionState.ids.length === 1;

  return (
    <div className={wrapperClassName} onClick={handleSelect}>
      {showToolbar && <SelectionToolbar onDelete={handleDelete} onRename={handleRename} onNudge={handleNudge} listeners={dndListeners} />}
      {renderPreview()}
    </div>
  );
};


// --- Main Canvas ---
export const EditorCanvas = () => {
  const rootId = useAtomValue(rootComponentIdAtom);
  const screenName = useAtomValue(formNameAtom);
  const [interactionState, setInteractionState] = useAtom(canvasInteractionAtom);
  const selectedIds = useAtomValue(selectedCanvasComponentIdsAtom); // Use derived atom for reading
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const setIsPropertiesPanelVisible = useSetAtom(isPropertiesPanelVisibleAtom);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isTyping = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';
      if (isTyping || interactionState.mode === 'editing') return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedIds.length > 0) {
        event.preventDefault();
        commitAction({ action: { type: 'COMPONENTS_DELETE_BULK', payload: { componentIds: selectedIds } }, message: `Delete ${selectedIds.length} component(s)` });
        setInteractionState({ mode: 'idle' });
        return;
      }
      
      if (event.key === 'Enter' && selectedIds.length === 1) {
        event.preventDefault();
        const component = allComponents[selectedIds[0]];
        if (component && component.componentType !== 'layout') {
          setInteractionState({ mode: 'editing', id: selectedIds[0] });
        }
        return;
      }

      if (isCtrlOrCmd && event.key.toLowerCase() === 'g') {
        event.preventDefault();
        if (event.shiftKey) {
          if (selectedIds.length !== 1) return;
          const selected = allComponents[selectedIds[0]];
          if (selected?.componentType === 'layout' && selected.children.length > 0) {
            commitAction({ action: { type: 'COMPONENT_UNWRAP', payload: { componentId: selected.id } }, message: `Unwrap container` });
          }
        } else {
          if (selectedIds.length === 0) return;
          const firstSelected = allComponents[selectedIds[0]];
          if (!firstSelected) return;
          commitAction({ action: { type: 'COMPONENTS_WRAP', payload: { componentIds: selectedIds, parentId: firstSelected.parentId } }, message: `Wrap ${selectedIds.length} component(s)` });
        }
        return;
      }

      if (event.key.startsWith('Arrow') && selectedIds.length === 1) {
        event.preventDefault();
        const component = allComponents[selectedIds[0]];
        if (!component) return;
        const parent = allComponents[component.parentId];
        if (!parent || parent.componentType !== 'layout') return;

        if (event.shiftKey) {
          const grandparent = allComponents[parent.parentId];
          if (!grandparent || grandparent.componentType !== 'layout') return;
          const parentIndex = grandparent.children.indexOf(parent.id);
          const moveDirection = (event.key === 'ArrowUp' || event.key === 'ArrowLeft') ? -1 : 1;
          const targetParentIndex = parentIndex + moveDirection;
          if (targetParentIndex >= 0 && targetParentIndex < grandparent.children.length) {
            const newParentId = grandparent.children[targetParentIndex];
            const newParent = allComponents[newParentId];
            if (newParent && newParent.componentType === 'layout') {
              commitAction({ action: { type: 'COMPONENT_MOVE', payload: { componentId: component.id, oldParentId: parent.id, newParentId, newIndex: 0 } }, message: `Move component to new container` });
            }
          }
        } else {
          const oldIndex = parent.children.indexOf(component.id);
          const moveDirection = (event.key === 'ArrowUp' || event.key === 'ArrowLeft') ? -1 : 1;
          const newIndex = oldIndex + moveDirection;
          if (newIndex >= 0 && newIndex < parent.children.length) {
            commitAction({ action: { type: 'COMPONENT_REORDER', payload: { componentId: component.id, parentId: parent.id, oldIndex, newIndex } }, message: `Reorder component` });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [interactionState, selectedIds, allComponents, commitAction, setInteractionState]);

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