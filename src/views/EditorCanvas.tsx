// src/views/EditorCanvas.tsx
import React from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useDroppable, DraggableSyntheticListeners } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { selectedCanvasComponentIdsAtom, activeDndIdAtom, overDndIdAtom } from '../data/atoms';
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
  const activeId = useAtomValue(activeDndIdAtom);
  const overId = useAtomValue(overDndIdAtom);

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

  const isOver = overId === component.id;
  const isDraggingItem = !!activeId && !String(activeId).startsWith('draggable-');

  // Show drop indicator if we are dragging over this item,
  // but it's not the active item itself.
  const showDropIndicator = isOver && activeId !== component.id;

  // When moving an existing item, prevent it from showing an indicator over itself.
  const finalClassName = `${styles.sortableItem} ${isDragging ? styles.isDragging : ''} ${showDropIndicator && !(isDraggingItem && isOver) ? styles.showDropIndicator : ''}`;


  return (
    <div ref={setNodeRef} style={style} className={finalClassName} {...attributes}>
      {React.cloneElement(children as React.ReactElement<ComponentProps>, { dndListeners: listeners })}
    </div>
  );
};

// --- Layout Container Component ---
const LayoutContainer = ({ component, dndListeners }: { component: LayoutComponent, dndListeners?: DraggableSyntheticListeners }) => {
  const [selectedIds, setSelectedIds] = useAtom(selectedCanvasComponentIdsAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const isSelected = selectedIds.includes(component.id);

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
  
  const containerClasses = `${styles.formComponentWrapper} ${styles.layoutContainer} ${isSelected ? styles.selected : ''} ${component.children.length === 0 ? styles.layoutContainerEmpty : ''}`;

  return (
    <div className={containerClasses} onClick={handleSelect}>
      {isSelected && selectedIds.length === 1 && <SelectionToolbar onDelete={handleDelete} listeners={dndListeners} />}
      <div ref={setNodeRef} className={styles.layoutContainerContent}>
        <SortableContext items={component.children} strategy={verticalListSortingStrategy}>
          {component.children.length > 0 ? (
            component.children.map(childId => (
              <CanvasNode key={childId} componentId={childId} />
            ))
          ) : (
            <span>Drag components here</span>
          )}
        </SortableContext>
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