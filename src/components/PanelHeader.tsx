// src/components/PanelHeader.tsx
import React from 'react';
import panelStyles from './panel.module.css'; // Uses shared panel styles

interface PanelHeaderProps {
  title: string;
  onClose: () => void;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({ title, onClose }) => {
  return (
    <div className={panelStyles.componentBrowserHeader}>
      <h4>{title}</h4>
      <button 
        className="btn btn-quaternary icon-only" 
        title="Close Panel" 
        aria-label="Close Panel"
        onClick={onClose}
      >
        <span className="material-symbols-rounded">close</span>
      </button>
    </div>
  );
};