// src/features/ComponentBrowser/PlaceholderPanel.tsx
import React from 'react';
import { useSetAtom } from 'jotai';
import { isComponentBrowserVisibleAtom } from '../../data/atoms';
import { PanelHeader } from '../../components/PanelHeader';
import styles from './PlaceholderPanel.module.css';

interface PlaceholderPanelProps {
  title: string;
}

export const PlaceholderPanel: React.FC<PlaceholderPanelProps> = ({ title }) => {
  const setIsPanelVisible = useSetAtom(isComponentBrowserVisibleAtom);

  const handleClosePanel = () => {
    setIsPanelVisible(false);
  }

  return (
    <div className={styles.placeholderPanelContainer}>
      <PanelHeader title={title} onClose={handleClosePanel} />
      <div className={styles.placeholderContent}>
        <span className={`material-symbols-rounded ${styles.placeholderIcon}`}>construction</span>
        <p>The {title} panel is under construction.</p>
        <p>Check back later!</p>
      </div>
    </div>
  );
};