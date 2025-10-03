// src/views/MainToolbar.tsx
import { useAtom, useAtomValue } from 'jotai';
import { isToolbarCompactAtom, activeToolbarTabAtom, isComponentBrowserVisibleAtom, ToolbarTabId } from '../data/atoms';
import './MainToolbar.css';

const toolbarGroups: { id: ToolbarTabId; label: string; icon: string }[][] = [
  [
    { id: 'layout', label: 'Layout', icon: 'auto_awesome_mosaic' },
    { id: 'data', label: 'Data fields', icon: 'database' },
    { id: 'general', label: 'General', icon: 'widgets' },
  ],
  [
    { id: 'templates', label: 'Templates', icon: 'file_present' },
  ],
  [
    { id: 'conditions', label: 'Conditions', icon: 'account_tree' },
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