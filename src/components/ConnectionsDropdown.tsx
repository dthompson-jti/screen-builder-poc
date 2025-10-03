// src/components/ConnectionsDropdown.tsx
import { useRef, useEffect, useState } from 'react';
import { componentTreeData, connectionsDropdownData } from '../data/componentBrowserMock';
import { DropdownItem } from '../types';
import { useOnClickOutside } from '../data/useOnClickOutside';
import { NodeNavigator } from '../data/navigator.js';
import styles from './ConnectionsDropdown.module.css';

interface ConnectionsDropdownProps {
  navigator: NodeNavigator | null;
  selectedNodeId: string;
  onClose: () => void;
}

export const ConnectionsDropdown = ({ navigator, selectedNodeId, onClose }: ConnectionsDropdownProps) => {
  const data = connectionsDropdownData[selectedNodeId];
  const [query, setQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useOnClickOutside(dropdownRef, onClose);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleItemClick = (item: DropdownItem) => {
    if (item.isNavigable && navigator) {
      const targetNode = componentTreeData.find(node => node.id === item.id);
      if (targetNode) {
        navigator.navigateToId(targetNode.id);
      }
      onClose();
    }
  };

  if (!data) return null;
  
  const lowerCaseQuery = query.toLowerCase();
  const filteredEntities = data.entities.filter(item => item.name.toLowerCase().includes(lowerCaseQuery));
  const filteredCollections = data.collections.filter(item => item.name.toLowerCase().includes(lowerCaseQuery));
  const filteredTransientEntities = data.transientEntityFields.filter(item => item.name.toLowerCase().includes(lowerCaseQuery));

  const renderListItems = (items: DropdownItem[]) => {
    return items.map((item: DropdownItem) => (
      <li key={item.id} className={`${styles.dropdownItem} ${item.isNavigable ? styles.navigable : ''}`} onClick={() => handleItemClick(item)}>
        <span className={`material-symbols-rounded ${styles.itemIcon}`} style={{ color: item.iconColor }}>
          {item.icon}
        </span>
        <span>{item.name}</span>
      </li>
    ));
  };

  return (
    <div className={styles.connectionsDropdownContainer} ref={dropdownRef}>
      <div className={styles.dropdownHeaderRow}>
        <h5>Navigate to...</h5>
        <button 
          className="btn-tertiary icon-only" 
          onClick={onClose}
          aria-label="Close connections dropdown"
        >
          <span className="material-symbols-rounded">close</span>
        </button>
      </div>
      
      <div className={styles.dropdownSearch}>
        <span className="material-symbols-rounded">search</span>
        <input 
          ref={searchInputRef}
          type="text" 
          placeholder="Search Connections" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <ul className={styles.dropdownList}>
        {filteredEntities.length > 0 && <li className={styles.dropdownHeader}>Entities</li>}
        {renderListItems(filteredEntities)}
        
        {filteredCollections.length > 0 && <li className={styles.dropdownHeader}>Collections</li>}
        {renderListItems(filteredCollections)}

        {filteredTransientEntities.length > 0 && <li className={styles.dropdownHeader}>Transient Entity Fields</li>}
        {renderListItems(filteredTransientEntities)}
      </ul>
    </div>
  );
};