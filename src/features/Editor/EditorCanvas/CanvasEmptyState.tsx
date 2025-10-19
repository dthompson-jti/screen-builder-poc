// src/features/Editor/EditorCanvas/CanvasEmptyState.tsx
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { 
  isComponentBrowserVisibleAtom, 
  activeToolbarTabAtom, 
  isPropertiesPanelVisibleAtom,
  canvasInteractionAtom // CORRECTED: Import the base writable atom
} from '../../../data/atoms';
import { rootComponentIdAtom } from '../../../data/historyAtoms';
import styles from './CanvasEmptyState.module.css';

export const CanvasEmptyState = () => {
  const [isLeftPanelOpen, setIsPanelVisible] = useAtom(isComponentBrowserVisibleAtom);
  const setActiveTab = useSetAtom(activeToolbarTabAtom);
  // CORRECTED: Get the setter for the base, writable atom
  const setInteractionState = useSetAtom(canvasInteractionAtom); 
  const rootId = useAtomValue(rootComponentIdAtom);
  const setIsPropertiesPanelVisible = useSetAtom(isPropertiesPanelVisibleAtom);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent canvas from deselecting
    
    // CORRECTED: Use the correct setter to update the interaction state
    setInteractionState({ mode: 'selecting', ids: [rootId] });
    
    // Open the appropriate panel
    if (!isLeftPanelOpen) {
      setActiveTab('data');
      setIsPanelVisible(true);
    } else {
      setIsPropertiesPanelVisible(true);
    }
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