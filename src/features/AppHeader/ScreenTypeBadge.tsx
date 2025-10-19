// src/features/AppHeader/ScreenTypeBadge.tsx
import { useAtom } from 'jotai';
import { screenTypeAtom, isScreenTypePopoverOpenAtom } from '../../data/atoms';
import { screenTypeConfig } from '../../data/screenTypeConfig';
import { Tooltip } from '../../components/Tooltip';
import styles from './ScreenTypeBadge.module.css';

export const ScreenTypeBadge = () => {
  const [screenType] = useAtom(screenTypeAtom);
  const [isOpen, setIsOpen] = useAtom(isScreenTypePopoverOpenAtom);

  const { label, tooltip } = screenTypeConfig[screenType];

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <Tooltip content={tooltip} side="bottom">
      <button
        className={styles.badge}
        onClick={handleToggle}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {label}
      </button>
    </Tooltip>
  );
};