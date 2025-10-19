// src/views/EditorCanvas.tsx
import React, { useRef, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useDroppable, DraggableSyntheticListeners, ClientRect } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  selectedCanvasComponentIdsAtom, 
  overDndIdAtom, 
  dropPlaceholderAtom, 
  activeDndIdAtom, 
  isPropertiesPanelVisibleAtom,
  activelyEditingComponentIdAtom,
} from '../data/atoms';
import { canvasComponentsByIdAtom, commitActionAtom, rootComponentIdAtom, formNameAtom } from '../data/historyAtoms';
import { CanvasComponent, FormComponent, LayoutComponent, DndData } from '../types';
import { SelectionToolbar } from '../components/SelectionToolbar';
import { CanvasEmptyState } from '../components/CanvasEmptyState';
import { TextInputPreview } from '../components/TextInputPreview';
import DropdownPreview from '../components/DropdownPreview';
import RadioButtonsPreview from '../components/RadioButtonsPreview';
import styles from './EditorCanvas.module.css';

interface ComponentProps {
  component: CanvasComponent;
  dndListeners?: DraggableSyntheticListeners;
}

// Helper to get the display name/label
const getComponentName = (component: CanvasComponent): string => {
    return component.componentType === 'layout' ? component.name : component.properties.label;
}

// --- Floating Toolbar for Multi-Select ---
const FloatingSelectionToolbar = () => {
  const [selectedIds, setSelectedIds] = useAtom(selectedCanvasComponentIdsAtom);
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
    setSelectedIds([]);
  };

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

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
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
    <div ref={setNodeRef} style={sortableStyle} className={className} {...attributes} data-id={component.id}>
      {React.cloneElement(children as React.ReactElement<ComponentProps>, { dndListeners: listeners })}
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
  const [selectedIds, setSelectedIds] = useAtom(selectedCanvasComponentIdsAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const overId = useAtomValue(overDndIdAtom);
  const dropPlaceholder = useAtomValue(dropPlaceholderAtom);
  const activeDndId = useAtomValue(activeDndIdAtom);
  const rootId = useAtomValue(rootComponentIdAtom);

  const isRoot = component.id === rootId;
  const isSelected = selectedIds.includes(component.id);
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
    if (e.shiftKey) {
      setSelectedIds(prev => prev.includes(component.id) ? prev.filter(id => id !== component.id) : [...prev, component.id]);
    } else {
      setSelectedIds([component.id]);
    }
  };

  const handleDelete = () => {
    commitAction({
      action: { type: 'COMPONENT_DELETE', payload: { componentId: component.id } },
      message: `Delete '${component.name}'`
    });
    setSelectedIds([]);
  };
  
  const handleRename = () => {
    // Layout containers can't be renamed inline
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
  if (arrangement === 'stack') {
    contentLayoutStyle.flexDirection = 'column';
  } else if (arrangement === 'row') {
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
    contentLayoutStyle.gridTemplateColumns = typeof columnLayout === 'number'
      ? `repeat(${columnLayout}, 1fr)`
      : gridTemplateMap[columnLayout] || '1fr';
  }

  const parentRect = containerContentRef.current?.getBoundingClientRect();
  const showLinePlaceholder = dropPlaceholder?.parentId === component.id && dropPlaceholder.viewportRect && parentRect;
  
  const renderEmptyState = () => {
    if (isRoot) {
      return <CanvasEmptyState />;
    }
    return <span className={styles.emptyText}>Drag components here</span>;
  };

  return (
    <div className={containerClasses} onClick={handleSelect}>
      {isSelected && selectedIds.length === 1 && !isRoot && <SelectionToolbar onDelete={handleDelete} onRename={handleRename} onNudge={handleNudge} listeners={dndListeners} />}
      <div 
        ref={setMergedRefs} 
        className={styles.layoutContainerContent} 
        style={contentAppearanceStyle}
        data-appearance-type={appearance?.type || 'transparent'}
        data-bordered={appearance?.bordered || false}
        data-arrangement={arrangement}
      >
        <div style={contentLayoutStyle} className="layout-content-wrapper">
          {isEmpty ? (
              renderEmptyState()
          ) : (
            <SortableContext items={component.children} strategy={verticalListSortingStrategy}>
              {component.children.map(childId => (
                <CanvasNode key={childId} componentId={childId} />
              ))}
            </SortableContext>
          )}
        </div>
        {showLinePlaceholder && (
          <DropPlaceholder
            placeholderProps={{
              viewportRect: dropPlaceholder.viewportRect!,
              isGrid: dropPlaceholder.isGrid,
              parentRect: parentRect,
            }}
          />
        )}
      </div>
    </div>
  );
};

// --- Form Item (e.g., TextInput) ---
const FormItem = ({ component, dndListeners }: { component: FormComponent, dndListeners?: DraggableSyntheticListeners }) => {
  const [selectedIds, setSelectedIds] = useAtom(selectedCanvasComponentIdsAtom);
  const [activelyEditingId, setActivelyEditingId] = useAtom(activelyEditingComponentIdAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const commitAction = useSetAtom(commitActionAtom);

  const isSelected = selectedIds.includes(component.id);
  const isEditing = activelyEditingId === component.id;

  const handleDelete = () => {
    commitAction({
      action: { type: 'COMPONENT_DELETE', payload: { componentId: component.id } },
      message: `Delete '${component.properties.label}'`
    });
    setSelectedIds([]);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    // ALT+CLICK is a discrete action: it deselects others and immediately enters edit mode.
    if (e.altKey) {
      setSelectedIds([component.id]); // Set selection to only this component
      setActivelyEditingId(component.id);
      return;
    }
    // Standard SHIFT+CLICK for multi-select
    if (e.shiftKey) {
      setSelectedIds(prev => prev.includes(component.id) ? prev.filter(id => id !== component.id) : [...prev, component.id]);
    } else {
      // Standard single click
      setSelectedIds([component.id]);
    }
  };
  
  const handleRename = () => {
      setActivelyEditingId(component.id);
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
  
  // FIX: isEditing takes precedence over isSelected to prevent the flicker/shift.
  const wrapperClassName = `${styles.formComponentWrapper} ${isEditing ? styles.isEditing : (isSelected ? styles.selected : '')}`;

  const renderPreview = () => {
    const { label, controlType } = component.properties;
    
    switch (controlType) {
      case 'dropdown':
        return <DropdownPreview 
          label={label}
          isEditing={isEditing}
          componentId={component.id}
        />;
      case 'radio-buttons':
        return <RadioButtonsPreview 
          label={label}
          isEditing={isEditing}
          componentId={component.id}
        />;
      case 'text-input':
      default:
        return <TextInputPreview 
          label={label}
          isEditing={isEditing}
          componentId={component.id}
        />;
    }
  };

  return (
    <div className={wrapperClassName} onClick={handleSelect}>
      {isSelected && selectedIds.length === 1 && !isEditing && <SelectionToolbar onDelete={handleDelete} onRename={handleRename} onNudge={handleNudge} listeners={dndListeners} />}
      {renderPreview()}
    </div>
  );
};


// --- Main Canvas ---
export const EditorCanvas = () => {
  const rootId = useAtomValue(rootComponentIdAtom);
  const screenName = useAtomValue(formNameAtom);
  const [selectedIds, setSelectedIds] = useAtom(selectedCanvasComponentIdsAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const [activelyEditingId, setActivelyEditingId] = useAtom(activelyEditingComponentIdAtom);
  const setIsPropertiesPanelVisible = useSetAtom(isPropertiesPanelVisibleAtom);

  // Comprehensive keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isTypingInInput = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';
      if (isTypingInInput || activelyEditingId) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      // --- Deleting ---
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedIds.length > 0) {
        event.preventDefault();
        commitAction({
          action: { type: 'COMPONENTS_DELETE_BULK', payload: { componentIds: selectedIds } },
          message: `Delete ${selectedIds.length} component(s)`
        });
        setSelectedIds([]);
        return;
      }
      
      // --- Editing ---
      if (event.key === 'Enter' && selectedIds.length === 1) {
        event.preventDefault();
        setActivelyEditingId(selectedIds[0]);
        return;
      }

      // --- Grouping / Ungrouping ---
      if (isCtrlOrCmd && event.key.toLowerCase() === 'g') {
        event.preventDefault();
        
        if (event.shiftKey) { // Ungroup
          if (selectedIds.length !== 1) return;
          const selected = allComponents[selectedIds[0]];
          if (selected?.componentType === 'layout' && selected.children.length > 0) {
            commitAction({
              action: { type: 'COMPONENT_UNWRAP', payload: { componentId: selected.id } },
              message: `Unwrap container`
            });
          }
        } else { // Group
          if (selectedIds.length === 0) return;
          const firstSelected = allComponents[selectedIds[0]];
          if (!firstSelected) return;
          commitAction({
            action: { type: 'COMPONENTS_WRAP', payload: { componentIds: selectedIds, parentId: firstSelected.parentId } },
            message: `Wrap ${selectedIds.length} component(s)`
          });
        }
        return;
      }

      // --- Nudging and Container Jumping ---
      if (event.key.startsWith('Arrow') && selectedIds.length === 1) { // Only nudge single items for now
        event.preventDefault();
        const component = allComponents[selectedIds[0]];
        if (!component) return;
        const parent = allComponents[component.parentId];
        if (!parent || parent.componentType !== 'layout') return;

        if (event.shiftKey) { // Container Jumping
          const grandparent = allComponents[parent.parentId];
          if (!grandparent || grandparent.componentType !== 'layout') return;
          
          const parentIndex = grandparent.children.indexOf(parent.id);
          const moveDirection = (event.key === 'ArrowUp' || event.key === 'ArrowLeft') ? -1 : 1;
          const targetParentIndex = parentIndex + moveDirection;

          if (targetParentIndex >= 0 && targetParentIndex < grandparent.children.length) {
            const newParentId = grandparent.children[targetParentIndex];
            const newParent = allComponents[newParentId];
            if (newParent && newParent.componentType === 'layout') {
              commitAction({
                action: { type: 'COMPONENT_MOVE', payload: { componentId: component.id, oldParentId: parent.id, newParentId, newIndex: 0 } },
                message: `Move component to new container`
              });
            }
          }
        } else { // Nudging
          const oldIndex = parent.children.indexOf(component.id);
          const moveDirection = (event.key === 'ArrowUp' || event.key === 'ArrowLeft') ? -1 : 1;
          const newIndex = oldIndex + moveDirection;
          if (newIndex >= 0 && newIndex < parent.children.length) {
            commitAction({
              action: { type: 'COMPONENT_REORDER', payload: { componentId: component.id, parentId: parent.id, oldIndex, newIndex } },
              message: `Reorder component`
            });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, activelyEditingId, setActivelyEditingId, allComponents, commitAction, setSelectedIds]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds([rootId]);
    setIsPropertiesPanelVisible(true);
  };

  const handleContainerClick = () => {
    setSelectedIds([]);
  }

  return (
    <div className={styles.canvasContainer} onClick={handleContainerClick}>
      <div className={styles.formCard} onClick={handleCanvasClick}>
        <div className={styles.formCardHeader}>
          <h2>{screenName}</h2>
        </div>
        <div className={styles.canvasDroppableArea}>
          {rootId && <CanvasNode componentId={rootId} />}
        </div>
      </div>
      {selectedIds.length > 1 && <FloatingSelectionToolbar />}
    </div>
  );
};