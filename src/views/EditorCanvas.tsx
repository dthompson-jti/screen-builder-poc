// src/views/EditorCanvas.tsx
import React, { useRef, useLayoutEffect, useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useDroppable, DraggableSyntheticListeners } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { selectedCanvasComponentIdsAtom, overDndIdAtom, dropIndicatorAtom } from '../data/atoms';
import { canvasComponentsByIdAtom, commitActionAtom, rootComponentIdAtom } from '../data/historyAtoms';
import { CanvasComponent, FormComponent, LayoutComponent, DndData } from '../types';
import { SelectionToolbar } from '../components/SelectionToolbar';
import { TextInputPreview } from '../components/TextInputPreview';
import styles from './EditorCanvas.module.css';

interface ComponentProps {
  component: CanvasComponent;
  dndListeners?: DraggableSyntheticListeners;
}

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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: component.id,
    data: { 
      id: component.id,
      name: component.name,
      type: component.componentType,
      childrenCount: component.componentType === 'layout' ? component.children.length : undefined,
    } satisfies DndData
  });
  
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition,
  };

  const className = `${styles.sortableItem} ${isDragging ? styles.isDragging : ''}`;

  return (
    <div ref={setNodeRef} style={style} className={className} {...attributes}>
      {React.cloneElement(children as React.ReactElement<ComponentProps>, { dndListeners: listeners })}
    </div>
  );
};

// --- New Drop Indicator Line ---
const DropIndicator = ({ top }: { top: number }) => {
  return <div className={styles.dropIndicator} style={{ top: `${top}px` }} />;
};

// --- Layout Container Component ---
const LayoutContainer = ({ component, dndListeners }: { component: LayoutComponent, dndListeners?: DraggableSyntheticListeners }) => {
  const [selectedIds, setSelectedIds] = useAtom(selectedCanvasComponentIdsAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const overId = useAtomValue(overDndIdAtom);
  const dropIndicator = useAtomValue(dropIndicatorAtom);
  const isSelected = selectedIds.includes(component.id);
  const contentRef = useRef<HTMLDivElement>(null);
  const [indicatorTop, setIndicatorTop] = useState<number | null>(null);

  const { setNodeRef } = useDroppable({
    id: component.id,
    data: { 
      id: component.id,
      name: component.name,
      type: 'container', 
      childrenCount: component.children.length 
    } satisfies DndData
  });

  // Calculate the vertical position for the drop indicator line
  useLayoutEffect(() => {
    if (dropIndicator?.parentId === component.id && contentRef.current) {
      const children = Array.from(contentRef.current.children).filter(
        (el) => el.classList.contains(styles.sortableItem)
      ) as HTMLElement[];
      
      if (dropIndicator.index === 0) {
        setIndicatorTop(-2); // Position at the very top
      } else if (dropIndicator.index > 0 && children[dropIndicator.index - 1]) {
        const prevChild = children[dropIndicator.index - 1];
        setIndicatorTop(prevChild.offsetTop + prevChild.offsetHeight - 2);
      } else {
        // Default to the bottom if index is out of bounds or list is empty
        const lastChild = children[children.length - 1];
        setIndicatorTop(lastChild ? lastChild.offsetTop + lastChild.offsetHeight + 4 : -2);
      }
    } else {
      setIndicatorTop(null);
    }
  }, [dropIndicator, component.id]);


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
  const containerClasses = `${styles.formComponentWrapper} ${styles.layoutContainer} ${isSelected ? styles.selected : ''} ${component.children.length === 0 ? styles.layoutContainerEmpty : ''} ${isOverContainer ? styles['is-over-container'] : ''}`;

  return (
    <div className={containerClasses} onClick={handleSelect}>
      {isSelected && selectedIds.length === 1 && <SelectionToolbar onDelete={handleDelete} listeners={dndListeners} />}
      <div ref={setNodeRef} className={styles.layoutContainerContent}>
        <div ref={contentRef}>
          <SortableContext items={component.children} strategy={verticalListSortingStrategy}>
            {component.children.map(childId => (
              <CanvasNode key={childId} componentId={childId} />
            ))}
          </SortableContext>
        </div>
        {indicatorTop !== null && <DropIndicator top={indicatorTop} />}
        {component.children.length === 0 && !dropIndicator && <span>Drag components here</span>}
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
  const setSelectedIds = useSetAtom(selectedCanvasComponentIdsAtom);

  return (
    <div className={styles.canvasContainer} onClick={() => setSelectedIds([])}>
      <div className={styles.formCard}>
        <h2>Form</h2>
        <div className={styles.canvasDroppableArea}>
          {rootId && <CanvasNode componentId={rootId} />}
        </div>
      </div>
    </div>
  );
};