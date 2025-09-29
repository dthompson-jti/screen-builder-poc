// src/components/MainToolbar.tsx
import { useAtom, useAtomValue } from 'jotai';
import { isToolbarCompactAtom, activeToolbarTabAtom, isComponentBrowserVisibleAtom, ToolbarTabId } from '../state/atoms';
import './MainToolbar.css';

const toolbarItems: { id: ToolbarTabId; label: string; icon: string }[] = [
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

  const handleTabClick = (id: ToolbarTabId) => {
    if (id === activeTabId) {
      setIsPanelVisible(prev => !prev);
    } else {
      setActiveTabId(id);
      setIsPanelVisible(true);
    }
  };

  return (
    <div className={toolbarClassName}>
      {toolbarItems.map((item, index) => {
        const isActive = item.id === activeTabId;
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
            
            {!isCompact && (index === 0 || index === 3 || index === 4) && <div className="toolbar-divider-horizontal" />}
          </div>
        );
      })}
    </div>
  );
};