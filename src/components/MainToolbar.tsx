// src/components/MainToolbar.tsx
import { useAtom, useAtomValue } from 'jotai';
import { isToolbarCompactAtom, activeToolbarTabAtom, isComponentBrowserVisibleAtom, ToolbarTabId } from '../state/atoms';
import './MainToolbar.css';

// FIX: Define groups for better divider placement
const toolbarGroups: { id: ToolbarTabId; label: string; icon: string }[][] = [
  [
    { id: 'layout', label: 'Layout', icon: 'auto_awesome_mosaic' },
    { id: 'data', label: 'Data fields', icon: 'database' },
    { id: 'general', label: 'General', icon: 'borg' },
  ],
  [
    { id: 'templates', label: 'Templates', icon: 'mobile_layout' },
  ],
  [
    { id: 'conditions', label: 'Conditions', icon: 'arrow_split' },
  ],
  [
    { id: 'layers', label: 'Layers', icon: 'layers' },
  ],
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

  const renderButton = (item: { id: ToolbarTabId; label: string; icon: string }) => {
    const isActive = item.id === activeTabId;
    const isCurrentlyActiveAndOpen = isActive && isPanelVisible;
    return (
      <button 
        key={item.id}
        className={`toolbar-button ${isCurrentlyActiveAndOpen ? 'active' : ''}`} 
        title={item.label} 
        aria-label={item.label}
        onClick={() => handleTabClick(item.id)}
      >
        <span className="material-symbols-rounded">{item.icon}</span>
        {!isCompact && (
          <span className="toolbar-label">{item.label}</span>
        )}
      </button>
    );
  };

  return (
    <div className={toolbarClassName}>
      {/* FIX: Render by group to correctly place dividers */}
      {toolbarGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="toolbar-group">
          {group.map(renderButton)}
          {!isCompact && groupIndex < toolbarGroups.length - 1 && (
            <div className="toolbar-divider-horizontal" />
          )}
        </div>
      ))}
    </div>
  );
};