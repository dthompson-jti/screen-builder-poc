// src/components/BindingConnectionsDropdown.tsx
import { useRef } from 'react';
import { useOnClickOutside } from '../useOnClickOutside';
import { NodeNavigator } from './navigator.js';
// REFACTOR: Use the single source of truth for data.
import { connectionsDropdownData, componentTreeData } from '../data/componentBrowserMock';
import { DropdownItem } from '../types';

interface BindingConnectionsDropdownProps {
  navigator: NodeNavigator | null;
  selectedNodeId: string;
  onClose: () => void;
}

export const BindingConnectionsDropdown = ({ navigator, selectedNodeId, onClose }: BindingConnectionsDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  // REFACTOR: Use the consolidated connections data.
  const data = connectionsDropdownData[selectedNodeId];

  useOnClickOutside(dropdownRef, onClose);

  const handleItemClick = (id: string) => {
    if (navigator) {
      // REFACTOR: Use the consolidated tree data.
      const targetNode = componentTreeData.find(node => node.id === id);
      if (targetNode) {
        navigator.navigateToId(targetNode.id);
      }
    }
    onClose();
  };

  if (!data || data.entities.length === 0) {
    return (
       <div className="connections-dropdown-container" ref={dropdownRef}>
         <div className="placeholder-content" style={{padding: 'var(--spacing-4)', height: 'auto'}}>
            <p>No forward connections.</p>
         </div>
      </div>
    )
  }

  return (
    <div className="connections-dropdown-container" ref={dropdownRef}>
      <ul className="dropdown-list">
        {data.entities.map((item: DropdownItem) => (
          <li key={item.id} className="dropdown-item navigable" onClick={() => handleItemClick(item.id)}>
            <span className="material-symbols-rounded item-icon entity">crop_square</span>
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};