// src/views/EditorCanvas.tsx
import React, { useRef } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useDroppable, DraggableSyntheticListeners, ClientRect } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  selectedCanvasComponentIdsAtom, 
  overDndIdAtom, 
  dropPlaceholderAtom, 
  activeDndIdAtom, 
  isPropertiesPanelVisibleAtom 
} from '../data/atoms';
import { canvasComponentsByIdAtom, commitActionAtom, rootComponentIdAtom, formNameAtom } from '../data/historyAtoms';
import { CanvasComponent, FormComponent, LayoutComponent, DndData } from '../types';
import { SelectionToolbar } from '../components/SelectionToolbar';
import { CanvasEmptyState } from '../components/CanvasEmptyState';
import { TextInputPreview } from '../components/TextInputPreview';
import styles from './EditorCanvas.module.css';

interface ComponentProps {
  component: CanvasComponent;
  dndListeners?: DraggableSyntheticListeners;
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
        <span className="material-symbols-rounded">fullscreen_exit</span>
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
      name: component.name,
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
const DropPlaceholder = ({ rect, parentRect }: { rect: ClientRect, parentRect: DOMRect }) => {
  const placeholderStyle: React.CSSProperties = {
    top: `${rect.top - parentRect.top - 2}px`,
    left: `${rect.left - parentRect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  };
  return <div className={styles.dropPlaceholder} style={placeholderStyle} />;
};


// --- Layout Container Component ---
const LayoutContainer = ({ component, dndListeners }: { component: LayoutComponent, dndListeners?: DraggableSyntheticListeners }) => {
  const [selectedIds, setSelectedIds] = useAtom(selectedCanvasComponentIdsAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const overId = useAtomValue(overDndIdAtom);
  const dropPlaceholder = useAtomValue(dropPlaceholderAtom);
  const activeDndId = useAtomValue(activeDndIdAtom);
  const rootId = useAtomValue(rootComponentIdAtom);

  const isRoot = component.id === rootId;
  const isSelected = selectedIds.includes(component.id);
  const contentRef = useRef<HTMLDivElement>(null);
  const appearance = component.properties.appearance;

  const { setNodeRef } = useDroppable({
    id: component.id,
    data: { 
      id: component.id,
      name: component.name,
      type: 'container', 
      childrenCount: component.children.length 
    } satisfies DndData
  });

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

  const parentRect = contentRef.current?.getBoundingClientRect();
  const showPlaceholder = dropPlaceholder?.parentId === component.id && dropPlaceholder.rect && parentRect;

  return (
    <div className={containerClasses} onClick={handleSelect}>
      {isSelected && selectedIds.length === 1 && !isRoot && <SelectionToolbar onDelete={handleDelete} listeners={dndListeners} />}
      <div 
        ref={setNodeRef} 
        className={styles.layoutContainerContent} 
        style={contentAppearanceStyle}
        data-appearance-type={appearance?.type || 'transparent'}
        data-bordered={appearance?.bordered || false}
        data-arrangement={arrangement}
      >
        <div ref={contentRef} style={contentLayoutStyle} className="layout-content-wrapper">
          {isEmpty ? (
              isRoot ? <CanvasEmptyState /> : <span className={styles.emptyText}>Drag components here</span>
          ) : (
            <SortableContext items={component.children} strategy={verticalListSortingStrategy}>
              {component.children.map(childId => (
                <CanvasNode key={childId} componentId={childId} />
              ))}
            </SortableContext>
          )}
        </div>
        {showPlaceholder && <DropPlaceholder rect={dropPlaceholder.rect!} parentRect={parentRect} />}
      </div>
    </div>
  );
};

// --- Form Item (e.g., TextInput) ---
const FormItem = ({ component, dndListeners }: { component: FormComponent, dndListeners?: DraggableSyntheticListeners }) => {
  const [selectedIds, setSelectedIds] = useAtom(selectedCanvasComponentIdsAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const isSelected = selectedIds.includes(component.id);

  const handleDelete = () => {
    commitAction({
      action: { type: 'COMPONENT_DELETE', payload: { componentId: component.id } },
      message: `Delete '${component.name}'`
    });
    setSelectedIds([]);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey) {
      setSelectedIds(prev => prev.includes(component.id) ? prev.filter(id => id !== component.id) : [...prev, component.id]);
    } else {
      setSelectedIds([component.id]);
    }
  };
  
  const wrapperClassName = `${styles.formComponentWrapper} ${isSelected ? styles.selected : ''}`;

  return (
    <div className={wrapperClassName} onClick={handleSelect}>
      {isSelected && selectedIds.length === 1 && <SelectionToolbar onDelete={handleDelete} listeners={dndListeners} />}
      <TextInputPreview label={component.name} />
    </div>
  );
};


// --- Main Canvas ---
export const EditorCanvas = () => {
  const rootId = useAtomValue(rootComponentIdAtom);
  const screenName = useAtomValue(formNameAtom);
  const [selectedIds, setSelectedIds] = useAtom(selectedCanvasComponentIdsAtom);
  const setIsPropertiesPanelVisible = useSetAtom(isPropertiesPanelVisibleAtom);

  const handleCanvasClick = () => {
    setSelectedIds([rootId]);
    setIsPropertiesPanelVisible(true);
  };

  return (
    <div className={styles.canvasContainer} onClick={handleCanvasClick}>
      <div className={styles.formCard}>
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