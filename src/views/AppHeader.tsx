// src/views/AppHeader.tsx
import { useAtom } from 'jotai';
import { useLayoutEffect, useRef, useState } from 'react';
import {
  isMenuOpenAtom,
  appViewModeAtom,
  AppViewMode,
  isSettingsMenuOpenAtom,
  isNameEditorPopoverOpenAtom,
  isScreenTypePopoverOpenAtom,
} from '../data/atoms';
import { formNameAtom } from '../data/historyAtoms';
import { HeaderMenu } from '../components/HeaderMenu';
import { HeaderActionsMenu } from '../components/HeaderActionsMenu';
import { NameEditorPopover } from '../components/NameEditorPopover';
import { ScreenTypeBadge } from '../components/ScreenTypeBadge';
import { ScreenTypePopover } from '../components/ScreenTypePopover';
import styles from './AppHeader.module.css';

export const AppHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useAtom(isMenuOpenAtom);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useAtom(isSettingsMenuOpenAtom);
  const [viewMode, setViewMode] = useAtom(appViewModeAtom);
  const [formName] = useAtom(formNameAtom);
  const [isNameEditorOpen, setIsNameEditorOpen] = useAtom(isNameEditorPopoverOpenAtom);
  const [isScreenTypePopoverOpen] = useAtom(isScreenTypePopoverOpenAtom);

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState({});

  useLayoutEffect(() => {
    if (tabsContainerRef.current) {
      const activeTabNode = tabsContainerRef.current.querySelector<HTMLButtonElement>(`.tab-button.active`);
      if (activeTabNode) {
        setUnderlineStyle({
          left: activeTabNode.offsetLeft,
          width: activeTabNode.offsetWidth,
        });
      }
    }
  }, [viewMode]);

  const handleToggleMenu = () => {
      setIsMenuOpen(p => !p);
  };

  const handleTabClick = (mode: AppViewMode) => {
    setViewMode(mode);
  };

  return (
    <header className={styles.appHeader}>
      <div className={styles.headerLeft}>
        <button
          className="btn btn-tertiary icon-only"
          title="Toggle Menu"
          aria-label="Toggle Menu"
          onClick={handleToggleMenu}
        >
          <span className="material-symbols-rounded">menu</span>
        </button>
        {isMenuOpen && <HeaderMenu />}
        <h1 className={styles.appHeaderTitle}>Screen Studio</h1>
        <div className={styles.verticalDivider} />
        <div className={styles.screenIdentifier}>
          <ScreenTypeBadge />
          {isScreenTypePopoverOpen && <ScreenTypePopover />}
        </div>
        <div className={styles.formNameEditor}>
          <span className={styles.formNameDisplay}>{formName}</span>
          <button
            className="btn btn-quaternary icon-only"
            onClick={() => setIsNameEditorOpen(p => !p)}
            aria-label="Edit form name"
          >
            <span className="material-symbols-rounded">edit</span>
          </button>
          {isNameEditorOpen && <NameEditorPopover />}
        </div>
      </div>

      <div className={styles.headerCenter}>
        <div className="tab-group" ref={tabsContainerRef}>
          <button className={`tab-button ${viewMode === 'editor' ? 'active' : ''}`} onClick={() => handleTabClick('editor')}>Edit</button>
          <button className={`tab-button ${viewMode === 'preview' ? 'active' : ''}`} onClick={() => handleTabClick('preview')}>Preview</button>
          <button className={`tab-button ${viewMode === 'settings' ? 'active' : ''}`} onClick={() => handleTabClick('settings')}>Settings</button>
          <div className="tab-underline" style={{...underlineStyle, bottom: '-10px' }} />
        </div>
      </div>

      <div className={styles.headerRight}>
        <button className="btn btn-primary">Save</button>
        <button className="btn btn-secondary icon-only" aria-label="More options" onClick={() => setIsSettingsMenuOpen(p => !p)}>
          <span className="material-symbols-rounded">more_horiz</span>
        </button>
        {isSettingsMenuOpen && <HeaderActionsMenu />}
        <button className="btn btn-secondary">Close</button>
      </div>
    </header>
  );
};