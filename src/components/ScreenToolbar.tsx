// src/components/ScreenToolbar.tsx
// NEW FILE
import { useSetAtom } from 'jotai';
import { isPropertiesPanelVisibleAtom } from '../data/atoms';
import styles from './ScreenToolbar.module.css';

export const ScreenToolbar = () => {
  const setIsPropertiesPanelVisible = useSetAtom(isPropertiesPanelVisibleAtom);

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPropertiesPanelVisible(true);
  };

  return (
    <div className={styles.screenToolbar}>
      <button 
        className="btn btn-secondary icon-only" 
        title="Screen Settings" 
        aria-label="Screen settings" 
        onClick={handleSettingsClick}
      >
        <span className="material-symbols-rounded">settings</span>
      </button>
    </div>
  );
};