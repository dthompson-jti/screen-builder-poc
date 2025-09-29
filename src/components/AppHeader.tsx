// src/components/AppHeader.tsx
import { useAtom, useSetAtom } from 'jotai';
import { 
  isMenuOpenAtom, 
  appViewModeAtom, 
  AppViewMode, 
  formNameAtom,
  focusIntentAtom,
  isSettingsMenuOpenAtom
} from '../state/atoms';
import { HeaderMenu } from './HeaderMenu';
import { HeaderActionsMenu } from './HeaderActionsMenu';
import './AppHeader.css';
import './HeaderMenu.css'; 

export const AppHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useAtom(isMenuOpenAtom);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useAtom(isSettingsMenuOpenAtom);
  const [viewMode, setViewMode] = useAtom(appViewModeAtom);
  const [formName] = useAtom(formNameAtom);
  const setFocusIntent = useSetAtom(focusIntentAtom);

  const handleToggleMenu = () => {
      setIsMenuOpen(p => !p);
  };
    
  const handleTabClick = (mode: AppViewMode) => {
    setViewMode(mode);
  };

  const handleEditNameClick = () => {
    setViewMode('settings');
    setFocusIntent('form-name-input');
  }

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
          <button className="back-btn">
            <span className="material-symbols-rounded">chevron_left</span>
            {/* FIX: Add specific class to the text span */}
            <span className="btn-text">Back</span>
          </button>
        </div>
        <div className="vertical-divider" />
        <div className="sub-header-center">
          <button className="form-name-editor-btn" onClick={handleEditNameClick}>
            {/* FIX: Add specific class to the text span */}
            <span className="btn-text">{formName}</span>
            <span className="material-symbols-rounded">edit</span>
          </button>
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