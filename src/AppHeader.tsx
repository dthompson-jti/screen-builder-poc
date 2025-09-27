// src/AppHeader.tsx
import './AppHeader.css';

export const AppHeader = () => {
  return (
    <header className="app-header">
      <div className="app-header-top">
        <h1 className="app-header-title">Screen editor</h1>
        <div className="app-header-actions">
          <button className="icon-button" disabled title="Help" aria-label="Help">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
          <button className="icon-button" disabled title="Close" aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
      <div className="app-header-bottom">
        <div className="sub-header-left">
          <button className="link-button" disabled>
            <span className="material-symbols-outlined">arrow_back_ios</span>
            Back to screens
          </button>
        </div>
        <div className="sub-header-center">
          <div className="vertical-divider" />
          <div className="form-name-editor">
            <span>&lt;Form name&gt;</span>
            <button className="icon-button small" disabled aria-label="Edit form name">
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