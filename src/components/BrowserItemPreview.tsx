// src/components/BrowserItemPreview.tsx

// A simple presentational component for the drag overlay,
// styled to match the items in the ComponentBrowser list.
export const BrowserItemPreview = ({ name, icon }: { name: string, icon: string }) => {
  return (
    <div className="component-list-item" style={{
        backgroundColor: 'var(--surface-bg-primary)',
        boxShadow: 'var(--surface-shadow-lg)',
        pointerEvents: 'none',
        width: '250px', // Fixed width for the preview
      }}
    >
      <span className="material-symbols-rounded component-icon">{icon}</span>
      <span className="component-name">{name}</span>
    </div>
  );
};