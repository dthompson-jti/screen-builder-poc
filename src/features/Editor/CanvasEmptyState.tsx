// src/features/Editor/CanvasEmptyState.tsx
import { useSetAtom } from 'jotai';
import { 
  startEditingOnEmptyCanvasAtom,
} from '../../data/atoms';
import styles from './CanvasEmptyState.module.css';

export const CanvasEmptyState = () => {
  const startEditing = useSetAtom(startEditingOnEmptyCanvasAtom);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent canvas from deselecting
    startEditing();
  };

  return (
    <div className={styles.emptyStateContainer} onClick={handleClick}>
      <h3 className={styles.title}>Add screen content</h3>
      <p className={styles.subtitle}>
        Drag and drop content here to create your screen
      </p>
    </div>
  );
};