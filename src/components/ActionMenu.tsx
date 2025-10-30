// src/components/ActionMenu.tsx
import React from 'react';

export interface ActionMenuItem {
  id: string;
  icon: string;
  label: string;
  hotkey?: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  hidden?: boolean;
}

interface ActionMenuProps {
  items: (ActionMenuItem | 'separator')[];
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ items }) => {
  return (
    <>
      {items.map((item, index) => {
        if (item === 'separator') {
          return (
            <div
              key={`separator-${index}`}
              style={{
                height: '1px',
                backgroundColor: 'var(--surface-border-secondary)',
                margin: 'var(--spacing-1) 0',
              }}
            />
          );
        }

        if (item.hidden) {
          return null;
        }

        return (
          <button
            key={item.id}
            className={`menu-item ${item.destructive ? 'destructive' : ''}`}
            onClick={item.onClick}
            disabled={item.disabled}
          >
            <span className="checkmark-container">
              <span className="material-symbols-rounded">{item.icon}</span>
            </span>
            <span>{item.label}</span>
            {item.hotkey && <span className="hotkey">{item.hotkey}</span>}
          </button>
        );
      })}
    </>
  );
};