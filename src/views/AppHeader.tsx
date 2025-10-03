// src/views/AppHeader.tsx
import { useAtom } from 'jotai';
import { useLayoutEffect, useRef, useState } from 'react';
import { 
  isMenuOpenAtom, 
  appViewModeAtom, 
  AppViewMode, 
  formNameAtom,
  isSettingsMenuOpenAtom,
  isNameEditorPopoverOpenAtom,
} from '../data/atoms';
import { HeaderMenu } from '../components/HeaderMenu';
import { HeaderActionsMenu } from '../components/HeaderActionsMenu';
import { NameEditorPopover } from '../components/NameEditorPopover.tsx';
import './AppHeader.css';
import '../components/HeaderMenu.css'; 

export const AppHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useAtom(isMenuOpenAtom);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useAtom(isSettingsMenuOpenAtom);
  const [viewMode, setViewMode] = useAtom(appViewModeAtom);
  const [formName] = useAtom(formNameAtom);
  const [isNameEditorOpen, setIsNameEditorOpen] = useAtom(isNameEditorPopoverOpenAtom);

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
    <header className="app-header">
      <div className="app-header-top">
        <div className="app-header-left-group"> 
          <button 
            className="btn btn-tertiary icon-only" 
            title="Toggle Menu" 
            aria-label="Toggle Menu"
            onClick={handleToggleMenu}
          >
            <span className="material-symbols-rounded">menu</span>
          </button>
          {isMenuOpen && <HeaderMenu />}
          <h1 className="app-header-title">Screen Studio</h1>
        </div>
        <div className="app-header-actions">
          <button className="btn btn-tertiary icon-only" disabled title="Help" aria-label="Help">
            <span className="material-symbols-rounded">help</span>
          </button>
          <button className="btn btn-tertiary icon-only" disabled title="Close" aria-label="Close">
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>
      </div>
      <div className="app-header-bottom">
        <div className="sub-header-left">
          <span className="form-type-display">Case Initiation</span>
        </div>
        <div className="vertical-divider" />
        <div className="sub-header-center">
          <div className="form-name-editor">
            <span className="form-name-display">{formName}</span>
            <button 
              className="btn btn-tertiary icon-only" 
              onClick={() => setIsNameEditorOpen(p => !p)}
              aria-label="Edit form name"
            >
              <span className="material-symbols-rounded">edit</span>
            </button>
            {isNameEditorOpen && <NameEditorPopover />}
          </div>
          <div className="tab-group" ref={tabsContainerRef}>
            <button className={`tab-button ${viewMode === 'editor' ? 'active' : ''}`} onClick={() => handleTabClick('editor')}>Edit</button>
            <button className={`tab-button ${viewMode === 'preview' ? 'active' : ''}`} onClick={() => handleTabClick('preview')}>Preview</button>
            <button className={`tab-button ${viewMode === 'settings' ? 'active' : ''}`} onClick={() => handleTabClick('settings')}>Settings</button>
            {/* FIX: Remove the tab-bar-line element. The underline is now standalone. */}
            <div className="tab-underline" style={underlineStyle} />
          </div>
        </div>
        <div className="sub-header-right">
          <button className="btn btn-primary">Save</button>
          <button className="btn btn-secondary icon-only" aria-label="More options" onClick={() => setIsSettingsMenuOpen(p => !p)}>
            <span className="material-symbols-rounded">more_horiz</span>
          </button>
          {isSettingsMenuOpen && <HeaderActionsMenu />}
        </div>
      </div>
    </header>
  );
};