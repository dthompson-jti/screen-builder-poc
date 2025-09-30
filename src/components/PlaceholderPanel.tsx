// src/components/PlaceholderPanel.tsx
import React from 'react';
import { useSetAtom } from 'jotai';
import { isComponentBrowserVisibleAtom } from '../state/atoms';
import { PanelHeader } from './PanelHeader';
import './PlaceholderPanel.css';
import './panel.css';

interface PlaceholderPanelProps {
  title: string;
}

// FIX: Ensure the component is exported as a named export 'export const'
// to match the import statement in App.tsx and the project's convention.
export const PlaceholderPanel: React.FC<PlaceholderPanelProps> = ({ title }) => {
  const setIsPanelVisible = useSetAtom(isComponentBrowserVisibleAtom);

  const handleClosePanel = () => {
    setIsPanelVisible(false);
  }

  return (
    <div className="placeholder-panel-container">
      <PanelHeader title={title} onClose={handleClosePanel} />
      <div className="placeholder-content">
        <span className="material-symbols-rounded">construction</span>
        <p>The **{title}** panel is under construction.</p>
        <p>Check back later!</p>
      </div>
    </div>
  );
};