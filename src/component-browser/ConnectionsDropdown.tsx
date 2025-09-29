// src/component-browser/ConnectionsDropdown.tsx
import { useRef, useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
// FIX: Removed unused 'selectedNodeIdAtom' import
import { isConnectionsDropdownVisibleAtom } from './browserAtoms';
import { connectionsDropdownData, componentTreeData, DropdownItem } from './mockComponentTree';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { NodeNavigator } from './navigator';

interface ConnectionsDropdownProps {
  navigator: NodeNavigator | null;
  selectedNodeId: string;
}

export const ConnectionsDropdown = ({ navigator, selectedNodeId }: ConnectionsDropdownProps) => {
  const setIsVisible = useSetAtom(isConnectionsDropdownVisibleAtom);
  const data = connectionsDropdownData[selectedNodeId];
  const [query, setQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useOnClickOutside(dropdownRef, () => setIsVisible(false));

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
      setIsVisible(false);
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
          onClick={() => setIsVisible(false)}
          aria-label="Close connections dropdown"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <div className="dropdown-search">
        <span className="material-symbols-outlined">search</span>
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
            <span className="material-symbols-outlined item-icon entity">crop_square</span>
            <span>{item.name}</span>
          </li>
        ))}
        {filteredCollections.length > 0 && <li className="dropdown-header">Collections</li>}
        {filteredCollections.map((item: DropdownItem) => (
          <li key={item.id} className={`dropdown-item ${item.isNavigable ? 'navigable' : ''}`} onClick={() => handleItemClick(item)}>
            <span className="material-symbols-outlined item-icon collection">window</span>
            <span>{item.name}</span>
          </li>
        ))}
        {filteredTransients.length > 0 && <li className="dropdown-header">Transients</li>}
        {filteredTransients.map((item: DropdownItem) => (
          <li key={item.id} className={`dropdown-item ${item.isNavigable ? 'navigable' : ''}`} onClick={() => handleItemClick(item)}>
            <span className="material-symbols-outlined item-icon transient">data_object</span>
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};