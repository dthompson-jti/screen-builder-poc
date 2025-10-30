// src/features/Editor/previews/BrowserItemPreview.tsx
import panelStyles from '../../../components/panel.module.css';
import styles from './BrowserItemPreview.module.css';

// A simple presentational component for the drag overlay,
// styled to match the items in the ComponentBrowser list.
export const BrowserItemPreview = ({ name, icon }: { name: string, icon: string }) => {
  return (
    <div className={styles.browserItemPreview}>
      <span className={`material-symbols-rounded ${panelStyles.componentIcon}`}>{icon}</span>
      <span className={panelStyles.componentName}>{name}</span>
    </div>
  );
};