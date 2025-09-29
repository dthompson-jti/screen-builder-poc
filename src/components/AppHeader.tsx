// src/components/AppHeader.tsx
import { useAtom } from 'jotai';
import { isMenuOpenAtom, appViewModeAtom, AppViewMode } from '../state/atoms';
import { HeaderMenu } from './HeaderMenu';
import './AppHeader.css';
import './HeaderMenu.css'; 

export const AppHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useAtom(isMenuOpenAtom);
  const [viewMode, setViewMode] = useAtom(appViewModeAtom);

  const handleToggleMenu = () => {
      setIsMenuOpen(p => !p);
  };
    
  const handleTabClick = (mode: AppViewMode) => {
    setViewMode(mode);
  };

  return (
    <header className="app-header">
      <div className="app-header-top">
        {/* FIX: Removed inline style for margin. Parent padding now controls the 20px edge margin. */}
        <div className="app-header-left-group"> 
          <button 
            className="btn-tertiary icon-only" 
            title="Toggle Menu" 
            aria-label="Toggle Menu"
            onClick={handleToggleMenu}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          {isMenuOpen && <HeaderMenu />}
          <h1 className="app-header-title">Screen Studio</h1>
        </div>
        <div className="app-header-actions">
          <button className="btn-tertiary icon-only" disabled title="Help" aria-label="Help">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
          <button className="btn-tertiary icon-only" disabled title="Close" aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
      <div className="app-header-bottom">
        <div className="sub-header-left">
          <button className="btn-tertiary icon-text" disabled>
            <span className="material-symbols-outlined">arrow_back_ios</span>
            Back to screens
          </button>
        </div>
        <div className="sub-header-center">
          <div className="vertical-divider" />
          <div className="form-name-editor">
            <span>&lt;Form name&gt;</span>
            <button className="btn-tertiary icon-only" disabled aria-label="Edit form name" style={{padding: '4px'}}>
              <span className="material-symbols-outlined">edit</span>
            </button>
          </div>
          <div className="tab-group">
            <button className={`tab-button ${viewMode === 'editor' ? 'active' : ''}`} onClick={() => handleTabClick('editor')}>Edit</button>
            <button className={`tab-button ${viewMode === 'preview' ? 'active' : ''}`} onClick={() => handleTabClick('preview')}>Preview</button>
            <button className={`tab-button ${viewMode === 'settings' ? 'active' : ''}`} onClick={() => handleTabClick('settings')}>Settings</button>
          </div>
        </div>
        <div className="sub-header-right">
          <button className="btn btn-primary" disabled>Save</button>
          <button className="btn btn-secondary icon-only" disabled aria-label="More options">
            <span className="material-symbols-outlined">more_horiz</span>
          </button>
        </div>
      </div>
    </header>
  );
};