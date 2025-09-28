// src/component-browser/ComponentBrowser.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { useDraggable } from '@dnd-kit/core';
import { selectedNodeIdAtom, isConnectionsDropdownVisibleAtom, componentSearchQueryAtom, filteredComponentGroupsAtom } from './browserAtoms';
import { componentTreeData, DraggableComponent, ComponentGroup, connectionsDropdownData, DropdownItem } from './mockComponentTree';
import { NodeNavigator } from './navigator.js';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { isComponentBrowserVisibleAtom, isShowBreadcrumbAtom } from '../appAtoms'; // Import app state
import './navigator.css';

const DraggableListItem = ({ component }: { component: DraggableComponent }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draggable-${component.id}`,
    data: { type: component.type, name: component.name, icon: component.icon, id: component.id, isNew: true },
  });
  const iconStyle = component.iconColor ? { color: component.iconColor } : {};
  return (
    <li ref={setNodeRef} style={{ opacity: isDragging ? 0.4 : 1 }} {...listeners} {...attributes} className="component-list-item">
      <span className="material-symbols-outlined component-icon" style={iconStyle}>{component.icon}</span>
      <span className="component-name">{component.name}</span>
    </li>
  );
};

const ConnectionsDropdown = ({ navigator, selectedNodeId }: { navigator: NodeNavigator | null, selectedNodeId: string }) => {
  const setIsVisible = useSetAtom(isConnectionsDropdownVisibleAtom);
  const data = connectionsDropdownData[selectedNodeId];
  const [query, setQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null); // Ref for autofocus

  useOnClickOutside(dropdownRef, () => setIsVisible(false));

  useEffect(() => {
    // FIX: Autofocus search input when dropdown opens
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleItemClick = (item: DropdownItem) => {
    if (item.isNavigable && navigator) {
      navigator.navigate('forward');
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
      {/* FIX: Title row with close button */}
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
          ref={searchInputRef} // Attach ref here
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

export const ComponentBrowser = () => {
  const [selectedNodeId, setSelectedNodeId] = useAtom(selectedNodeIdAtom);
  const [query, setQuery] = useAtom(componentSearchQueryAtom);
  const componentGroups = useAtomValue(filteredComponentGroupsAtom);
  const [isDropdownVisible, setIsDropdownVisible] = useAtom(isConnectionsDropdownVisibleAtom);
  const isShowBreadcrumb = useAtomValue(isShowBreadcrumbAtom);
  
  const setIsPanelVisible = useSetAtom(isComponentBrowserVisibleAtom);
  
  const mountRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<NodeNavigator | null>(null);

  useEffect(() => {
    if (mountRef.current && !instanceRef.current) {
        const initialNodeId = selectedNodeId;
        instanceRef.current = new NodeNavigator(mountRef.current);
        instanceRef.current.init(initialNodeId, componentTreeData);
        
        const handleNavigate = (event: any) => {
          const { id } = event.detail;
          setIsDropdownVisible(false);
          setSelectedNodeId(id);
        };
        
        const handleToggleDropdown = () => {
          setIsDropdownVisible(v => !v);
        };
        
        mountRef.current.addEventListener('navigate', handleNavigate);
        mountRef.current.addEventListener('toggleConnectionsDropdown', handleToggleDropdown);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.setConnectedNodeActive(isDropdownVisible);
    }
  }, [isDropdownVisible]);

  const handleBreadcrumbClick = (nodeId: string) => {
    if (instanceRef.current) {
      instanceRef.current.navigateToId(nodeId);
    }
  };

  const handleClosePanel = () => {
    setIsPanelVisible(false);
  }

  const currentNodeIndex = componentTreeData.findIndex(node => node.id === selectedNodeId);
  const breadcrumbPath = currentNodeIndex !== -1 ? componentTreeData.slice(0, currentNodeIndex + 1) : [];
  
  const selectedNode = componentTreeData.find(node => node.id === selectedNodeId);
  const searchPlaceholder = `Search ${selectedNode ? selectedNode.name : 'components'}`;

  return (
    <div className="component-browser-container">
      <div className="component-browser-header">
        {/* FIX: Use fg-secondary for the title */}
        <h4 style={{ color: 'var(--surface-fg-secondary)' }}>Data navigator</h4>
        <button 
          className="btn-tertiary icon-only close-panel-button" 
          title="Close Panel" 
          aria-label="Close Panel"
          onClick={handleClosePanel}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Breadcrumb moved into its own wrapper, conditionally rendered */}
      {isShowBreadcrumb && (
        <div className="breadcrumb-wrapper">
          <div className="breadcrumb">
            {breadcrumbPath.map((node, index) => (
              <React.Fragment key={node.id}>
                <button 
                  className={index === breadcrumbPath.length - 1 ? 'active' : ''}
                  onClick={() => handleBreadcrumbClick(node.id)}
                  disabled={index === breadcrumbPath.length - 1}
                >
                  {node.name}
                </button>
                {index < breadcrumbPath.length - 1 && <span className="material-symbols-outlined">chevron_right</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <div className="navigator-container">
        <div id="navigator-grid" ref={mountRef}>
            <div id="nodes-viewport">
              <div id="nodes-track">
                <div className="nav-arrow-gap" id="arrow-gap-1"><div className="nav-arrow left"></div><div className="nav-arrow right"></div></div>
                <div className="nav-arrow-gap" id="arrow-gap-2"><div className="nav-arrow left"></div><div className="nav-arrow right"></div></div>
              </div>
              {isDropdownVisible && <ConnectionsDropdown navigator={instanceRef.current} selectedNodeId={selectedNodeId} />}
            </div>
            <div className="static-label last-node-label">Last node</div>
            <div className="static-label selected-node-label">Selected node</div>
            <div className="static-label connected-node-label">Connected nodes</div>
        </div>
      </div>

      <div className="search-bar-container">
        <span className="material-symbols-outlined">search</span>
        <input 
          type="text" 
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="component-list-container">
        <ul className="component-list">
          {componentGroups.map((group: ComponentGroup) => (
            <li key={group.title}>
              <h5 className="list-group-title">{group.title}</h5>
              <ul>
                {group.components.map((component: DraggableComponent) => (
                  <DraggableListItem key={component.id} component={component} />
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};