// src/components/CanvasEmptyState.tsx
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { isComponentBrowserVisibleAtom, activeToolbarTabAtom, selectedCanvasComponentIdsAtom, isPropertiesPanelVisibleAtom } from '../data/atoms';
import { rootComponentIdAtom } from '../data/historyAtoms';
import styles from './CanvasEmptyState.module.css';

// FIX: This component is now purely presentational and does not need to know about drag state.
export const CanvasEmptyState = () => {
  const [isLeftPanelOpen, setIsPanelVisible] = useAtom(isComponentBrowserVisibleAtom);
  const setActiveTab = useSetAtom(activeToolbarTabAtom);
  const setSelectedIds = useSetAtom(selectedCanvasComponentIdsAtom);
  const rootId = useAtomValue(rootComponentIdAtom);
  const setIsPropertiesPanelVisible = useSetAtom(isPropertiesPanelVisibleAtom);


  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent canvas from deselecting
    
    // Select the screen
    setSelectedIds([rootId]);
    
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