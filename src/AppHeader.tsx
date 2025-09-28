// src/AppHeader.tsx
import { useAtom } from 'jotai';
import { isMenuOpenAtom } from './appAtoms'; // FIX: Removed unused isToolbarCompactAtom import
import { HeaderMenu } from './HeaderMenu';
import './AppHeader.css';
import './HeaderMenu.css'; 

export const AppHeader = () => {
  // FIX: Removed unused setIsCompact state setter
  const [isMenuOpen, setIsMenuOpen] = useAtom(isMenuOpenAtom);

  const handleToggleMenu = () => {
      setIsMenuOpen(p => !p);
  };
    
  return (
    <header className="app-header">
      <div className="app-header-top">
        <div style={{display: 'flex', alignItems: 'center', gap: '4px', position: 'relative'}}> 
          {/* Menu Toggle (Tertiary Button) */}
          <button 
            className="btn-tertiary icon-only" 
            title="Toggle Menu" 
            aria-label="Toggle Menu"
            onClick={handleToggleMenu}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          {/* Render Menu Popover */}
          {isMenuOpen && <HeaderMenu />}
          
          <h1 className="app-header-title">Screen Studio</h1>
        </div>
        <div className="app-header-actions">
          {/* Help Icon (Tertiary Button) */}
          <button className="btn-tertiary icon-only" disabled title="Help" aria-label="Help">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
          {/* Close Icon (Tertiary Button) */}
          <button className="btn-tertiary icon-only" disabled title="Close" aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
      <div className="app-header-bottom">
        <div className="sub-header-left">
          {/* Back Link (Tertiary Button) */}
          <button className="btn-tertiary icon-text" disabled>
            <span className="material-symbols-outlined">arrow_back_ios</span>
            Back to screens
          </button>
        </div>
        <div className="sub-header-center">
          <div className="vertical-divider" />
          <div className="form-name-editor">
            <span>&lt;Form name&gt;</span>
            {/* Edit Icon (Tertiary Button) */}
            <button className="btn-tertiary icon-only" disabled aria-label="Edit form name" style={{padding: '4px'}}>
              <span className="material-symbols-outlined">edit</span>
            </button>
          </div>
          <div className="tab-group">
            <button className="tab-button active" disabled>Edit</button>
            <button className="tab-button" disabled>Preview</button>
            <button className="tab-button" disabled>Settings</button>
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