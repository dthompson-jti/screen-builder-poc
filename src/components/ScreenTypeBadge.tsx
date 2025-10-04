// src/components/ScreenTypeBadge.tsx
import { useAtom } from 'jotai';
import { screenTypeAtom, isScreenTypePopoverOpenAtom } from '../data/atoms';
import { screenTypeConfig } from '../data/screenTypeConfig';
import styles from './ScreenTypeBadge.module.css';

export const ScreenTypeBadge = () => {
  const [screenType] = useAtom(screenTypeAtom);
  const [isOpen, setIsOpen] = useAtom(isScreenTypePopoverOpenAtom);

  const { label, tooltip } = screenTypeConfig[screenType];

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <button
      className={styles.badge}
      title={tooltip}
      onClick={handleToggle}
      aria-haspopup="true"
      aria-expanded={isOpen}
    >
      {label}
    </button>
  );
};