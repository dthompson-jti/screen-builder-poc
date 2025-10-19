// src/features/Editor/MainToolbar.tsx
import { useAtom, useAtomValue } from 'jotai';
import { isToolbarCompactAtom, activeToolbarTabAtom, isComponentBrowserVisibleAtom, ToolbarTabId } from '../../data/atoms';
import { Tooltip } from '../../components/Tooltip';
import styles from './MainToolbar.module.css';

const toolbarGroups: { id: ToolbarTabId; label: string; icon: string }[][] = [
  [
    { id: 'general', label: 'General', icon: 'widgets' },
    { id: 'data', label: 'Data fields', icon: 'database' },
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
  
  const toolbarClassName = `${styles.mainToolbar} ${isCompact ? styles.compact : styles.normal}`;

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
    const buttonClasses = `${styles.toolbarButton} ${isCurrentlyActiveAndOpen ? styles.active : ''}`;
    return (
      <Tooltip content={item.label} side="right" key={item.id}>
        <button 
          className={buttonClasses} 
          aria-label={item.label}
          onClick={() => handleTabClick(item.id)}
        >
          <span className="material-symbols-rounded">{item.icon}</span>
          {!isCompact && (
            <span className={styles.toolbarLabel}>{item.label}</span>
          )}
        </button>
      </Tooltip>
    );
  };

  return (
    <div className={toolbarClassName}>
      {toolbarGroups.map((group, groupIndex) => (
        <div key={groupIndex} className={styles.toolbarGroup}>
          {group.map(renderButton)}
          {!isCompact && groupIndex < toolbarGroups.length - 1 && (
            <div className={styles.toolbarDividerHorizontal} />
          )}
        </div>
      ))}
    </div>
  );
};