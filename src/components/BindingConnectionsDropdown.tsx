// src/components/BindingConnectionsDropdown.tsx
import { useRef } from 'react';
import { useOnClickOutside } from '../data/useOnClickOutside';
import { NodeNavigator } from '../data/navigator.js';
import { connectionsDropdownData, componentTreeData } from '../data/componentBrowserMock';
import { DropdownItem } from '../types';
import styles from './ConnectionsDropdown.module.css';

interface BindingConnectionsDropdownProps {
  navigator: NodeNavigator | null;
  selectedNodeId: string;
  onClose: () => void;
}

export const BindingConnectionsDropdown = ({ navigator, selectedNodeId, onClose }: BindingConnectionsDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const data = connectionsDropdownData[selectedNodeId];

  useOnClickOutside(dropdownRef, onClose);

  const handleItemClick = (id: string) => {
    if (navigator) {
      const targetNode = componentTreeData.find(node => node.id === id);
      if (targetNode) {
        navigator.navigateToId(targetNode.id);
      }
    }
    onClose();
  };

  if (!data || data.entities.length === 0) {
    return (
       <div className={styles.connectionsDropdownContainer} ref={dropdownRef}>
         <div className={styles.placeholderContent}>
            <p>No forward connections.</p>
         </div>
      </div>
    )
  }

  return (
    <div className={styles.connectionsDropdownContainer} ref={dropdownRef}>
      <ul className={styles.dropdownList}>
        {data.entities.map((item: DropdownItem) => (
          <li key={item.id} className={`${styles.dropdownItem} ${styles.navigable}`} onClick={() => handleItemClick(item.id)}>
            <span className={`material-symbols-rounded ${styles.itemIcon}`} style={{ color: item.iconColor }}>
              {item.icon}
            </span>
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};