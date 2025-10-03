// src/components/ConnectionsDropdown.tsx
import { useRef, useEffect, useState } from 'react';
import { componentTreeData, connectionsDropdownData } from '../data/componentBrowserMock';
import { DropdownItem } from '../types';
import { useOnClickOutside } from '../data/useOnClickOutside';
import { NodeNavigator } from '../data/navigator.js';

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

  // Helper to render a list of items
  const renderListItems = (items: DropdownItem[]) => {
    return items.map((item: DropdownItem) => (
      <li key={item.id} className={`dropdown-item ${item.isNavigable ? 'navigable' : ''}`} onClick={() => handleItemClick(item)}>
        {/* FIX: Render icon and color dynamically from the data object */}
        <span className="material-symbols-rounded item-icon" style={{ color: item.iconColor }}>
          {item.icon}
        </span>
        <span>{item.name}</span>
      </li>
    ));
  };

  return (
    <div className="connections-dropdown-container" ref={dropdownRef}>
      <div className="dropdown-header-row">
        <h5>Navigate to...</h5>
        <button 
          className="btn-tertiary icon-only" 
          onClick={onClose}
          aria-label="Close connections dropdown"
        >
          <span className="material-symbols-rounded">close</span>
        </button>
      </div>
      
      <div className="dropdown-search">
        <span className="material-symbols-rounded">search</span>
        <input 
          ref={searchInputRef}
          type="text" 
          placeholder="Search Connections" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <ul className="dropdown-list">
        {filteredEntities.length > 0 && <li className="dropdown-header">Entities</li>}
        {renderListItems(filteredEntities)}
        
        {filteredCollections.length > 0 && <li className="dropdown-header">Collections</li>}
        {renderListItems(filteredCollections)}

        {filteredTransientEntities.length > 0 && <li className="dropdown-header">Transient Entity Fields</li>}
        {renderListItems(filteredTransientEntities)}
      </ul>
    </div>
  );
};