// src/views/EditorCanvas.tsx
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Active, UniqueIdentifier, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { canvasComponentsAtom, selectedCanvasComponentIdAtom } from '../data/atoms';
import { FormComponent } from '../types';
import { SelectionToolbar } from '../components/SelectionToolbar';
import styles from './EditorCanvas.module.css';
import { TextInputPreview } from '../components/TextInputPreview';

const SortableFormComponent = ({ component, overId, active }: { component: FormComponent, overId: UniqueIdentifier | null, active: Active | null }) => {
  const [selectedId, setSelectedId] = useAtom(selectedCanvasComponentIdAtom);
  const setCanvasComponents = useSetAtom(canvasComponentsAtom);
  
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: component.id,
  });
  
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition,
    opacity: isDragging ? 0 : 1,
  };
  const isSelected = selectedId === component.id;
  const showIndicator = overId === component.id && active?.id !== component.id;

  const handleDelete = () => {
    setCanvasComponents((prev) => prev.filter(c => c.id !== component.id));
    setSelectedId(null); // Deselect after deleting.
  };
  
  const wrapperClassName = `${styles.formComponentWrapper} ${isSelected ? styles.selected : ''} ${showIndicator ? styles.showDropIndicator : ''}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={wrapperClassName}
      onClick={(e) => { e.stopPropagation(); setSelectedId(component.id); }}
    >
      {isSelected && <SelectionToolbar onDelete={handleDelete} listeners={listeners} />}
      
      <TextInputPreview label={component.name} />
    </div>
  );
};

const BottomDropZone = ({ overId }: { overId: UniqueIdentifier | null }) => {
  const { setNodeRef } = useDroppable({ id: 'bottom-drop-zone' });
  const showIndicator = overId === 'bottom-drop-zone';
  const zoneClassName = `${styles.bottomDropZone} ${showIndicator ? styles.showDropIndicator : ''}`;

  return (
    <div ref={setNodeRef} className={zoneClassName} />
  );
};

interface EditorCanvasProps {
  overId: UniqueIdentifier | null;
  active: Active | null;
  isDragging: boolean;
}

export const EditorCanvas = ({ overId, active, isDragging }: EditorCanvasProps) => {
  const components = useAtomValue(canvasComponentsAtom);
  const [, setSelectedId] = useAtom(selectedCanvasComponentIdAtom);
  const { setNodeRef } = useDroppable({ id: 'canvas-drop-area' });

  const canvasClassName = `${styles.canvasContainer} ${isDragging ? styles.isDragging : ''}`;

  return (
    <div className={canvasClassName} onClick={() => setSelectedId(null)}>
      <div className={styles.formCard}>
        <h2>Form</h2>
        <div ref={setNodeRef} className={styles.canvasDroppableArea}>
          <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {components.map((component) => (
              <SortableFormComponent key={component.id} component={component} overId={overId} active={active} />
            ))}
          </SortableContext>
          <BottomDropZone overId={overId} />
        </div>
      </div>
    </div>
  );
};