// src/components/AppHeader.tsx
import { useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { 
  isMenuOpenAtom, 
  appViewModeAtom, 
  AppViewMode, 
  formNameAtom,
  isSettingsMenuOpenAtom,
  isEditingFormNameAtom,
} from '../state/atoms';
import { HeaderMenu } from './HeaderMenu';
import { HeaderActionsMenu } from './HeaderActionsMenu';
import './AppHeader.css';
import './HeaderMenu.css'; 

export const AppHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useAtom(isMenuOpenAtom);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useAtom(isSettingsMenuOpenAtom);
  const [viewMode, setViewMode] = useAtom(appViewModeAtom);
  const [formName, setFormName] = useAtom(formNameAtom);
  const [isEditingName, setIsEditingName] = useAtom(isEditingFormNameAtom);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleToggleMenu = () => {
      setIsMenuOpen(p => !p);
  };
    
  const handleTabClick = (mode: AppViewMode) => {
    setViewMode(mode);
  };

  const handleNameInputBlur = () => {
    setIsEditingName(false);
  };

  const handleNameInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setIsEditingName(false);
    }
  };

  return (
    <header className="app-header">
      <div className="app-header-top">
        <div className="app-header-left-group"> 
          <button 
            className="btn-tertiary icon-only" 
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
          <button className="btn-tertiary icon-only" disabled title="Help" aria-label="Help">
            <span className="material-symbols-rounded">help_outline</span>
          </button>
          <button className="btn-tertiary icon-only" disabled title="Close" aria-label="Close">
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
            {isEditingName ? (
              <input
                ref={nameInputRef}
                type="text"
                className="form-name-input"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onBlur={handleNameInputBlur}
                onKeyDown={handleNameInputKeyDown}
              />
            ) : (
              <>
                <span className="form-name-display">{formName}</span>
                <button 
                  className="btn-tertiary icon-only" 
                  onClick={() => setIsEditingName(true)}
                  aria-label="Edit form name"
                >
                  <span className="material-symbols-rounded">edit</span>
                </button>
              </>
            )}
          </div>
          <div className="tab-group">
            <button className={`tab-button ${viewMode === 'editor' ? 'active' : ''}`} onClick={() => handleTabClick('editor')}>Edit</button>
            <button className={`tab-button ${viewMode === 'preview' ? 'active' : ''}`} onClick={() => handleTabClick('preview')}>Preview</button>
            <button className={`tab-button ${viewMode === 'settings' ? 'active' : ''}`} onClick={() => handleTabClick('settings')}>Settings</button>
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