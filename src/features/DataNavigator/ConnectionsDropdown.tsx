// src/features/DataNavigator/ConnectionsDropdown.tsx
import { useRef, useState } from 'react';
import { componentTreeData, connectionsDropdownData } from '../../data/componentBrowserMock';
import { DropdownItem } from '../../types';
import { useOnClickOutside } from '../../data/useOnClickOutside';
import { NodeNavigator } from '../../data/navigator.js';
import { SearchInput } from '../../components/SearchInput';
import { Tooltip } from '../../components/Tooltip';
import { Button } from '../../components/Button';
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

  useOnClickOutside(dropdownRef, onClose);

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
  
  const hasResults = filteredEntities.length > 0 || filteredCollections.length > 0 || filteredTransientEntities.length > 0;

  const renderListItems = (items: DropdownItem[]) => {
    return items.map((item: DropdownItem) => {
      // Conditionally add the data-disabled property only if the item is not navigable
      const disabledProp = !item.isNavigable ? { 'data-disabled': true } : {};
      
      return (
        <li 
          key={item.id} 
          className="menu-item"
          {...disabledProp}
          onClick={() => handleItemClick(item)}
        >
          <span className={`material-symbols-rounded ${styles.itemIcon}`} style={{ color: item.iconColor }}>
            {item.icon}
          </span>
          <span>{item.name}</span>
        </li>
      );
    });
  };

  return (
    <div className={`${styles.connectionsDropdownContainer} anim-fadeIn`} ref={dropdownRef}>
      <div className={styles.dropdownHeaderRow}>
        <h5>Navigate to...</h5>
        <Tooltip content="Close">
          <Button 
            variant="quaternary"
            size="s"
            iconOnly
            onClick={onClose}
            aria-label="Close connections dropdown"
          >
            <span className="material-symbols-rounded">close</span>
          </Button>
        </Tooltip>
      </div>
      
      <div className={styles.dropdownSearchWrapper}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search Connections"
          variant="integrated"
          autoFocus={true}
        />
      </div>

      {!hasResults && query ? (
        <div className={styles.placeholderContent}>
          <p>No matches found for this search</p>
        </div>
      ) : (
        <ul className={styles.dropdownList}>
          {filteredEntities.length > 0 && <li className={styles.dropdownHeader}>Entities</li>}
          {renderListItems(filteredEntities)}
          
          {filteredCollections.length > 0 && <li className={styles.dropdownHeader}>Collections</li>}
          {renderListItems(filteredCollections)}

          {filteredTransientEntities.length > 0 && <li className={styles.dropdownHeader}>Transient Entity Fields</li>}
          {renderListItems(filteredTransientEntities)}
        </ul>
      )}
    </div>
  );
};