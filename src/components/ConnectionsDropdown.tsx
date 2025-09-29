// src/components/ConnectionsDropdown.tsx
import { useRef, useEffect, useState } from 'react';
import { componentTreeData, connectionsDropdownData } from '../data/componentBrowserMock';
import { DropdownItem } from '../types';
import { useOnClickOutside } from '../useOnClickOutside';
// FIX: Import from the JS file, which will be typed by the adjacent .d.ts file
import { NodeNavigator } from './navigator.js';

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
  const filteredTransients = data.transients.filter(item => item.name.toLowerCase().includes(lowerCaseQuery));

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
        {filteredEntities.map((item: DropdownItem) => (
          <li key={item.id} className={`dropdown-item ${item.isNavigable ? 'navigable' : ''}`} onClick={() => handleItemClick(item)}>
            <span className="material-symbols-rounded item-icon entity">crop_square</span>
            <span>{item.name}</span>
          </li>
        ))}
        {filteredCollections.length > 0 && <li className="dropdown-header">Collections</li>}
        {filteredCollections.map((item: DropdownItem) => (
          <li key={item.id} className={`dropdown-item ${item.isNavigable ? 'navigable' : ''}`} onClick={() => handleItemClick(item)}>
            <span className="material-symbols-rounded item-icon collection">window</span>
            <span>{item.name}</span>
          </li>
        ))}
        {filteredTransients.length > 0 && <li className="dropdown-header">Transients</li>}
        {filteredTransients.map((item: DropdownItem) => (
          <li key={item.id} className={`dropdown-item ${item.isNavigable ? 'navigable' : ''}`} onClick={() => handleItemClick(item)}>
            <span className="material-symbols-rounded item-icon transient">data_object</span>
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};