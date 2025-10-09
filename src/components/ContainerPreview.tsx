// src/components/ContainerPreview.tsx
// NEW FILE
import { LayoutComponent, NormalizedCanvasComponents } from '../types';
import styles from './ContainerPreview.module.css';

interface ContainerPreviewProps {
  component: LayoutComponent;
  allComponents: NormalizedCanvasComponents;
}

const ChildPreview = ({ componentId, allComponents }: { componentId: string, allComponents: NormalizedCanvasComponents }) => {
  const component = allComponents[componentId];
  if (!component) return null;
  
  if (component.componentType === 'layout') {
    // Render a simplified placeholder for nested containers to avoid excessive recursion
    return <div className={`${styles.childPlaceholder} ${styles.layout}`}>{component.name}</div>;
  }
  
  // For fields/widgets, render a simplified placeholder instead of the full preview
  return <div className={styles.childPlaceholder}>{component.name}</div>;
};

export const ContainerPreview = ({ component, allComponents }: ContainerPreviewProps) => {
  return (
    <div className={styles.containerPreview}>
      {component.children.map(childId => (
        <ChildPreview key={childId} componentId={childId} allComponents={allComponents} />
      ))}
    </div>
  );
};