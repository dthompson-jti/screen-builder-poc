// src/components/PanelHeader.tsx
import React from 'react';
import { Tooltip } from './Tooltip';
import { Button } from './Button';
import panelStyles from './panel.module.css'; // Uses shared panel styles

interface PanelHeaderProps {
  title: string;
  onClose: () => void;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({ title, onClose }) => {
  return (
    <div className={panelStyles.componentBrowserHeader}>
      <h4>{title}</h4>
      <Tooltip content="Close Panel">
        <Button 
          variant="quaternary"
          size="s"
          iconOnly
          aria-label="Close Panel"
          onClick={onClose}
        >
          <span className="material-symbols-rounded">close</span>
        </Button>
      </Tooltip>
    </div>
  );
};