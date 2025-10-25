// src/features/AppHeader/AppHeader.tsx
import { useAtom } from 'jotai';
import { useLayoutEffect, useRef, useState } from 'react';
import {
  isMenuOpenAtom,
  appViewModeAtom,
  AppViewMode,
  isScreenTypePopoverOpenAtom,
} from '../../data/atoms';
import { HeaderMenu } from './HeaderMenu';
import { FormNameEditor } from './FormNameEditor';
import { ScreenTypeBadge } from './ScreenTypeBadge';
import { ScreenTypePopover } from './ScreenTypePopover';
import { Tooltip } from '../../components/Tooltip';
import { Button } from '../../components/Button';
import styles from './AppHeader.module.css';

// ... (rest of file is unchanged)
export const AppHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useAtom(isMenuOpenAtom);
  const [viewMode, setViewMode] = useAtom(appViewModeAtom);
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
        <Tooltip content="Toggle Menu">
          <Button
            variant="tertiary"
            size="s"
            iconOnly
            aria-label="Toggle Menu"
            onClick={handleToggleMenu}
          >
            <span className="material-symbols-rounded">menu</span>
          </Button>
        </Tooltip>
        {isMenuOpen && <HeaderMenu />}
        <h1 className={styles.appHeaderTitle}>Screen Studio</h1>
        <div className={styles.verticalDivider} />
        <div className={styles.formIdentifier}>
          <div className={styles.screenIdentifier}>
            <ScreenTypeBadge />
            {isScreenTypePopoverOpen && <ScreenTypePopover />}
          </div>
          <FormNameEditor />
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
        <Button variant="primary" size="m">Save</Button>
        <Button variant="secondary" size="m">Close</Button>
      </div>
    </header>
  );
};