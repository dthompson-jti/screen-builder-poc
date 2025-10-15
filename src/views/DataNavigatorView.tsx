// src/views/DataNavigatorView.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { PrimitiveAtom } from 'jotai/vanilla';
import { NodeNavigator } from '../data/navigator.js';
import { PanelHeader } from '../components/PanelHeader';
import { SearchInput } from '../components/SearchInput';
import { EmptyStateMessage } from '../components/EmptyStateMessage';
import panelStyles from '../components/panel.module.css';
import { isShowBreadcrumbAtom } from '../data/atoms';
import { ComponentNode } from '../types';

// --- TYPES ---
interface BaseComponent { id: string; name: string; }
interface BaseComponentGroup { title: string; components: BaseComponent[]; }
type TNode = ComponentNode;

interface DataNavigatorAtoms {
  selectedNodeIdAtom: PrimitiveAtom<string>;
  searchQueryAtom: PrimitiveAtom<string>;
}

interface DataNavigatorViewProps<TGroup extends BaseComponentGroup> {
  treeData: TNode[];
  componentData: Record<string, TGroup[]>;
  atoms: DataNavigatorAtoms;
  renderComponentItem: (component: TGroup['components'][0]) => React.ReactNode;
  renderConnectionsDropdown?: (navigator: NodeNavigator | null, selectedNodeId: string, onClose: () => void) => React.ReactNode;
  onClosePanel?: () => void;
  isInsideModal?: boolean;
  autoFocusSearch?: boolean;
}

interface NavigateEvent extends Event {
  detail: {
    id: string;
  };
}


export const DataNavigatorView = <TGroup extends BaseComponentGroup>({
  treeData,
  componentData,
  atoms,
  renderComponentItem,
  renderConnectionsDropdown,
  onClosePanel,
  isInsideModal = false,
  autoFocusSearch = false,
}: DataNavigatorViewProps<TGroup>) => {
  const [selectedNodeId, setSelectedNodeId] = useAtom(atoms.selectedNodeIdAtom);
  const [query, setQuery] = useAtom(atoms.searchQueryAtom);
  const isShowBreadcrumb = useAtomValue(isShowBreadcrumbAtom);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const componentGroups = componentData[selectedNodeId] || [];
  const filteredGroups = !query ? componentGroups : componentGroups.map(group => ({
    ...group,
    components: group.components.filter(c => c.name.toLowerCase().includes(query.toLowerCase().trim()))
  })).filter(group => group.components.length > 0);
  
  const mountRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<NodeNavigator | null>(null);

  useEffect(() => {
    const currentMountRef = mountRef.current;
    if (currentMountRef && !instanceRef.current) {
        const navigator = new NodeNavigator(currentMountRef);
        instanceRef.current = navigator;
        navigator.init(selectedNodeId, treeData);
        
        const handleNavigate = (event: NavigateEvent) => {
          setIsDropdownVisible(false);
          setSelectedNodeId(event.detail.id);
        };

        const handleToggleDropdown = () => {
          if (renderConnectionsDropdown) {
            setIsDropdownVisible(v => !v);
          }
        };
        
        currentMountRef.addEventListener('navigate', handleNavigate as EventListener);
        currentMountRef.addEventListener('toggleConnectionsDropdown', handleToggleDropdown);
        
        // FIX: Add a cleanup function to remove event listeners.
        // This prevents memory leaks and unintended behavior if the component re-renders.
        return () => {
          currentMountRef.removeEventListener('navigate', handleNavigate as EventListener);
          currentMountRef.removeEventListener('toggleConnectionsDropdown', handleToggleDropdown);
        }
    }
  // FIX: Satisfy the exhaustive-deps rule by including all dependencies.
  // The cleanup function ensures this effect is safe to re-run.
  }, [treeData, renderConnectionsDropdown, selectedNodeId, setSelectedNodeId]);

  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.setConnectedNodeActive(isDropdownVisible);
    }
  }, [isDropdownVisible]);

  const handleCloseDropdown = () => {
    setIsDropdownVisible(false);
    if (instanceRef.current) {
      instanceRef.current.setConnectedNodeActive(false);
    }
  };

  const handleBreadcrumbClick = (nodeId: string) => {
    if (instanceRef.current) {
      instanceRef.current.navigateToId(nodeId);
    }
  };

  const currentNodeIndex = treeData.findIndex(node => node.id === selectedNodeId);
  const breadcrumbPath = currentNodeIndex !== -1 ? treeData.slice(0, currentNodeIndex + 1) : [];
  
  const selectedNode = treeData.find(node => node.id === selectedNodeId);
  const searchPlaceholder = `Search ${selectedNode ? selectedNode.name : 'items'}`;

  const breadcrumbVariants: Variants = {
    hidden: { opacity: 0, x: 10 },
    visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.05, type: 'tween', ease: 'easeInOut', duration: 0.3 }}),
    exit: { opacity: 0, x: 10, transition: { type: 'tween', ease: 'easeInOut', duration: 0.3 }},
  };

  const containerClasses = `${panelStyles.componentBrowserContainer} ${isInsideModal ? panelStyles.insideModal : ''}`;

  return (
    <div className={containerClasses}>
      <div className={panelStyles.panelHeaderSection}>
        {onClosePanel && (
          <PanelHeader title="Data navigator" onClose={onClosePanel} />
        )}

        {isShowBreadcrumb && (
          <div className={panelStyles.breadcrumbWrapper}>
            <div className={panelStyles.breadcrumb}>
              <AnimatePresence>
                {breadcrumbPath.map((node, index) => (
                  <motion.div key={node.id} custom={index} variants={breadcrumbVariants} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', alignItems: 'center' }}>
                    <button className={index === breadcrumbPath.length - 1 ? panelStyles.active : ''} onClick={() => handleBreadcrumbClick(node.id)} disabled={index === breadcrumbPath.length - 1}>
                      {node.name}
                    </button>
                    {index < breadcrumbPath.length - 1 && <span className="material-symbols-rounded">chevron_right</span>}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        <div className="node-navigator">
          <div className="navigator-container">
            <div id="navigator-grid" ref={mountRef}>
                <div id="nodes-viewport">
                  <div id="nodes-track">
                    <div className="nav-arrow-gap" id="arrow-gap-1"><div className="nav-arrow left"></div><div className="nav-arrow right"></div></div>
                    <div className="nav-arrow-gap" id="arrow-gap-2"><div className="nav-arrow left"></div><div className="nav-arrow right"></div></div>
                  </div>
                  {isDropdownVisible && renderConnectionsDropdown && renderConnectionsDropdown(instanceRef.current, selectedNodeId, handleCloseDropdown)}
                </div>
                <div className="static-label last-node-label">Last node</div>
                <div className="static-label selected-node-label">Selected node</div>
                <div className="static-label connected-node-label">
                  {selectedNode ? `${selectedNode.connections} Related nodes` : 'Related nodes'}
                </div>
            </div>
          </div>
        </div>
        
        <div className={panelStyles.searchContainer}>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={searchPlaceholder}
            variant="standalone"
            autoFocus={autoFocusSearch}
          />
        </div>
      </div>

      <div className={`${panelStyles.componentListContainer} scrollbar-stealth`}>
        {query && filteredGroups.length === 0 ? (
          <div className="scrollbar-stealth-content">
            <EmptyStateMessage query={query} />
          </div>
        ) : (
          <ul className={`${panelStyles.componentList} scrollbar-stealth-content`}>
            {filteredGroups.map((group) => (
              <li key={group.title}>
                <h5 className={panelStyles.listGroupTitle}>{group.title}</h5>
                <ul>
                  {group.components.map((component) => (
                    <React.Fragment key={component.id}>
                      {renderComponentItem(component)}
                    </React.Fragment>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};