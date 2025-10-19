// src/features/Editor/previews/ContainerPreview.tsx
import { LayoutComponent, NormalizedCanvasComponents, CanvasComponent } from '../../../types';
import styles from './ContainerPreview.module.css'; // CORRECTED PATH

// ... (rest of file is unchanged but included for completeness)
const getComponentName = (component: CanvasComponent): string => {
    if (component.componentType === 'layout') {
        return component.name;
    }
    if (component.properties.controlType === 'plain-text') {
        return component.properties.content?.substring(0, 30) || 'Plain Text';
    }
    return component.properties.label;
}

interface ContainerPreviewProps {
  component: LayoutComponent;
  allComponents: NormalizedCanvasComponents;
}

const ChildPreview = ({ componentId, allComponents }: { componentId: string, allComponents: NormalizedCanvasComponents }) => {
  const component = allComponents[componentId];
  if (!component) return null;
  
  const name = getComponentName(component);

  if (component.componentType === 'layout') {
    return <div className={`${styles.childPlaceholder} ${styles.layout}`}>{name}</div>;
  }
  
  return <div className={styles.childPlaceholder}>{name}</div>;
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