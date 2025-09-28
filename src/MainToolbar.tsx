// src/MainToolbar.tsx
import { useAtom, useAtomValue } from 'jotai';
import { isToolbarCompactAtom, activeToolbarTabAtom, isComponentBrowserVisibleAtom } from './appAtoms';
import './MainToolbar.css';

const toolbarItems = [
  { id: 'layout', label: 'Layout', icon: 'auto_awesome_mosaic' },
  { id: 'data', label: 'Data fields', icon: 'database' },
  { id: 'general', label: 'General', icon: 'borg' },
  
  // Divider group 1
  { id: 'templates', label: 'Templates', icon: 'mobile_layout' },
  
  // Divider group 2
  { id: 'conditions', label: 'Conditions', icon: 'arrow_split' },
  
  // Divider group 3
  { id: 'layers', label: 'Layers', icon: 'layers' },
];

export const MainToolbar = () => {
  const isCompact = useAtomValue(isToolbarCompactAtom);
  const [activeTabId, setActiveTabId] = useAtom(activeToolbarTabAtom);
  const [isPanelVisible, setIsPanelVisible] = useAtom(isComponentBrowserVisibleAtom);
  
  const toolbarClassName = isCompact ? 'main-toolbar compact' : 'main-toolbar normal';

  const handleTabClick = (id: string) => {
    if (id === activeTabId) {
      // If clicking the current active tab, toggle visibility
      setIsPanelVisible(prev => !prev);
    } else {
      // If clicking a new tab, make it active and ensure panel is open
      setActiveTabId(id);
      setIsPanelVisible(true);
    }
  };

  return (
    <div className={toolbarClassName}>
      {toolbarItems.map((item, index) => {
        const isActive = item.id === activeTabId;
        // Panel is open AND the toolbar item is the active tab.
        const isCurrentlyActiveAndOpen = isActive && isPanelVisible;

        return (
          <div key={item.id} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button 
              className={`toolbar-button ${isCurrentlyActiveAndOpen ? 'active' : ''}`} 
              title={item.label} 
              aria-label={item.label}
              onClick={() => handleTabClick(item.id)}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {!isCompact && (
                <span className="toolbar-label">{item.label}</span>
              )}
            </button>
            
            {/* Dividers appear only in Normal mode, after specific indices (Layout, Templates, Conditions) */}
            {!isCompact && (index === 0 || index === 3 || index === 4) && <div className="toolbar-divider-horizontal" />}
          </div>
        );
      })}
    </div>
  );
};