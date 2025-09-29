// src/components/PlaceholderPanel.tsx
import React from 'react';
import { useSetAtom } from 'jotai';
import { isComponentBrowserVisibleAtom } from '../state/atoms';
import './PlaceholderPanel.css';
import './navigator.css'; // Import styles for header reuse

interface PlaceholderPanelProps {
  title: string;
}

export const PlaceholderPanel: React.FC<PlaceholderPanelProps> = ({ title }) => {
  const setIsPanelVisible = useSetAtom(isComponentBrowserVisibleAtom);

  const handleClosePanel = () => {
    setIsPanelVisible(false);
  }

  return (
    <div className="placeholder-panel-container">
      {/* FIX: Header structure updated to match the new shorter, secondary-bg version */}
      <div className="component-browser-header">
        <h4>{title}</h4>
        <button 
          className="btn-tertiary icon-only close-panel-button" 
          title="Close Panel" 
          aria-label="Close Panel"
          onClick={handleClosePanel}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="placeholder-content">
        <span className="material-symbols-outlined">construction</span>
        <p>The **{title}** panel is under construction.</p>
        <p>Check back later!</p>
      </div>
    </div>
  );
};