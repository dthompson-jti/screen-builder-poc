// src/MainToolbar.tsx
import './MainToolbar.css';

// This is now a static, cosmetic component based on the mockup.
// The active state is hardcoded for the prototype.
export const MainToolbar = () => {
  return (
    <div className="main-toolbar">
      {/* THE FIX: Added aria-label for accessibility */}
      <button className="toolbar-button" title="Layout" disabled aria-label="Layout">
        <span className="material-symbols-outlined">grid_view</span>
      </button>
      {/* THE FIX: Added aria-label for accessibility */}
      <button className="toolbar-button active" title="Data fields" disabled aria-label="Data fields">
        <span className="material-symbols-outlined">database</span>
      </button>
      {/* THE FIX: Added aria-label for accessibility */}
      <button className="toolbar-button" title="General" disabled aria-label="General">
        <span className="material-symbols-outlined">tune</span>
      </button>
      {/* THE FIX: Added aria-label for accessibility */}
      <button className="toolbar-button" title="Templates" disabled aria-label="Templates">
        <span className="material-symbols-outlined">layers</span>
      </button>
      {/* THE FIX: Added aria-label for accessibility */}
      <button className="toolbar-button" title="Conditions" disabled aria-label="Conditions">
        <span className="material-symbols-outlined">account_tree</span>
      </button>
      {/* THE FIX: Added aria-label for accessibility */}
      <button className="toolbar-button" title="Layers" disabled aria-label="Layers">
        <span className="material-symbols-outlined">view_quilt</span>
      </button>
    </div>
  );
};