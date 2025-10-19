// src/features/Editor/previews/BrowserItemPreview.tsx
import panelStyles from '../../../components/panel.module.css';

// A simple presentational component for the drag overlay,
// styled to match the items in the ComponentBrowser list.
export const BrowserItemPreview = ({ name, icon }: { name: string, icon: string }) => {
  return (
    <div className={panelStyles.componentListItem} style={{
        backgroundColor: 'var(--surface-bg-primary)',
        boxShadow: 'var(--surface-shadow-lg)',
        pointerEvents: 'none',
        width: '250px', // Fixed width for the preview
      }}
    >
      <span className={`material-symbols-rounded ${panelStyles.componentIcon}`}>{icon}</span>
      <span className={panelStyles.componentName}>{name}</span>
    </div>
  );
};