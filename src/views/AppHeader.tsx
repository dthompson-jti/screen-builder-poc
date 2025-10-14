// src/views/AppHeader.tsx
import { useAtom, useAtomValue } from 'jotai';
import { useLayoutEffect, useRef, useState } from 'react';
import {
  isMenuOpenAtom,
  appViewModeAtom,
  AppViewMode,
  isSettingsMenuOpenAtom,
  isNameEditorPopoverOpenAtom,
  isScreenTypePopoverOpenAtom,
} from '../data/atoms';
import { isApiEnabledAtom, isReadOnlyAtom } from '../data/atoms';
import { formNameAtom } from '../data/historyAtoms';
import { HeaderMenu } from '../components/HeaderMenu';
import { HeaderActionsMenu } from '../components/HeaderActionsMenu';
import { NameEditorPopover } from '../components/NameEditorPopover';
import { ScreenTypeBadge } from '../components/ScreenTypeBadge';
import { ScreenTypePopover } from '../components/ScreenTypePopover';
import { StatusBadge } from '../components/StatusBadge';
import { Tooltip } from '../components/Tooltip';
import styles from './AppHeader.module.css';

export const AppHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useAtom(isMenuOpenAtom);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useAtom(isSettingsMenuOpenAtom);
  const [viewMode, setViewMode] = useAtom(appViewModeAtom);
  const [formName] = useAtom(formNameAtom);
  const [isNameEditorOpen, setIsNameEditorOpen] = useAtom(isNameEditorPopoverOpenAtom);
  const [isScreenTypePopoverOpen] = useAtom(isScreenTypePopoverOpenAtom);
  const isApiEnabled = useAtomValue(isApiEnabledAtom);
  const isReadOnly = useAtomValue(isReadOnlyAtom);

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
        <Tooltip content="Toggle Menu">
          <button
            className="btn btn-tertiary icon-only"
            aria-label="Toggle Menu"
            onClick={handleToggleMenu}
          >
            <span className="material-symbols-rounded">menu</span>
          </button>
        </Tooltip>
        {isMenuOpen && <HeaderMenu />}
        <h1 className={styles.appHeaderTitle}>Screen Studio</h1>
        <div className={styles.verticalDivider} />
        <div className={styles.formIdentifier}>
          <div className={styles.screenIdentifier}>
            <ScreenTypeBadge />
            {isScreenTypePopoverOpen && <ScreenTypePopover />}
            <div className={styles.verticalDivider} />
          </div>
          <div className={styles.formNameEditor}>
            <span className={styles.formNameDisplay}>{formName}</span>
            <Tooltip content="Edit form name">
              <button
                className="btn btn-quaternary icon-only"
                onClick={() => setIsNameEditorOpen(p => !p)}
                aria-label="Edit form name"
              >
                <span className="material-symbols-rounded">edit</span>
              </button>
            </Tooltip>
            {isNameEditorOpen && <NameEditorPopover />}
          </div>
          {isReadOnly && (
            <StatusBadge 
              icon="edit_off" 
              tooltip="This screen is read-only" 
              variant="info" 
            />
          )}
          {isApiEnabled && (
            <StatusBadge 
              icon="api" 
              tooltip="This screen is API enabled" 
              variant="info" 
            />
          )}
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
        <Tooltip content="More options">
          <button className="btn btn-secondary icon-only" aria-label="More options" onClick={() => setIsSettingsMenuOpen(p => !p)}>
            <span className="material-symbols-rounded">more_horiz</span>
          </button>
        </Tooltip>
        {isSettingsMenuOpen && <HeaderActionsMenu />}
        <button className="btn btn-secondary">Close</button>
      </div>
    </header>
  );
};