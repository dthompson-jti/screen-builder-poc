// src/components/ScreenToolbar.tsx
// NEW FILE
import { useSetAtom } from 'jotai';
import { isPropertiesPanelVisibleAtom } from '../data/atoms';
import { Tooltip } from './Tooltip';
import { Button } from './Button';
import styles from './ScreenToolbar.module.css';

export const ScreenToolbar = () => {
  const setIsPropertiesPanelVisible = useSetAtom(isPropertiesPanelVisibleAtom);

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPropertiesPanelVisible(true);
  };

  return (
    <div className={styles.screenToolbar}>
      <Tooltip content="Screen Settings">
        <Button 
          variant="secondary"
          size="m"
          iconOnly
          aria-label="Screen settings" 
          onClick={handleSettingsClick}
        >
          <span className="material-symbols-rounded">settings</span>
        </Button>
      </Tooltip>
    </div>
  );
};