// src/components/PanelHeader.tsx
import React from 'react';
import './panel.css'; // Uses shared panel styles

interface PanelHeaderProps {
  title: string;
  onClose: () => void;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({ title, onClose }) => {
  return (
    <div className="component-browser-header">
      <h4>{title}</h4>
      <button 
        className="btn-tertiary icon-only close-panel-button" 
        title="Close Panel" 
        aria-label="Close Panel"
        onClick={onClose}
      >
        <span className="material-symbols-rounded">close</span>
      </button>
    </div>
  );
};