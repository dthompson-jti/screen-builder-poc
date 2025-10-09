// src/components/FormRenderer.tsx
import React from 'react';
import { useAtomValue } from 'jotai';
import { canvasComponentsByIdAtom, rootComponentIdAtom } from '../data/historyAtoms';
import { CanvasComponent, FormComponent, LayoutComponent } from '../types';
import { TextInputPreview } from './TextInputPreview';
import styles from './FormRenderer.module.css';

// --- Utility to get appearance styles ---
const useAppearanceStyles = (component: LayoutComponent): React.CSSProperties => {
  const appearance = component.properties.appearance;
  if (!appearance) return {};

  const spacingMap: { [key: string]: string } = {
    none: '0px', sm: 'var(--spacing-2)', md: 'var(--spacing-4)',
    lg: 'var(--spacing-6)', xl: 'var(--spacing-8)'
  };
  
  const borderMap: { [key: string]: string } = {
    none: 'none',
    'surface-border-secondary': '1px solid var(--surface-border-secondary)',
    'surface-border-tertiary': '1px solid var(--surface-border-tertiary)',
  };

  return {
    backgroundColor: appearance.backgroundColor === 'transparent' ? 'transparent' : `var(--${appearance.backgroundColor})`,
    padding: spacingMap[appearance.padding] || '0px',
    border: borderMap[appearance.border] || 'none',
  };
};

// --- Recursive Render Node ---
const RenderNode = ({ componentId }: { componentId: string }) => {
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const component = allComponents[componentId];

  if (!component) return null;

  if (component.componentType === 'layout') {
    return <LayoutComponentPreview component={component} />;
  }
  return <FormComponentPreview component={component} />;
};

// --- Layout Component Preview ---
const LayoutComponentPreview = ({ component }: { component: LayoutComponent }) => {
  const appearanceStyles = useAppearanceStyles(component);
  
  const gapMap = { none: '0px', sm: 'var(--spacing-2)', md: 'var(--spacing-4)', lg: 'var(--spacing-6)' };
  const contentStyle: React.CSSProperties = {
    display: 'flex',
    gap: gapMap[component.properties.gap] || gapMap.md,
  };

  if (component.properties.arrangement === 'stack') {
    contentStyle.flexDirection = 'column';
  } else if (component.properties.arrangement === 'row') {
    contentStyle.flexDirection = 'row';
    contentStyle.flexWrap = component.properties.allowWrapping ? 'wrap' : 'nowrap';
    contentStyle.justifyContent = component.properties.distribution;
    contentStyle.alignItems = component.properties.verticalAlign;
  } else if (component.properties.arrangement === 'grid') {
    contentStyle.display = 'grid';
    const gridTemplateMap = {
      'auto': 'repeat(auto-fill, minmax(150px, 1fr))',
      '2-col-50-50': '1fr 1fr',
      '3-col-33': '1fr 1fr 1fr',
      '2-col-split-left': '2fr 1fr',
    };
    contentStyle.gridTemplateColumns = gridTemplateMap[component.properties.columnLayout] || '1fr';
  }

  const wrapperStyle: React.CSSProperties = {
    ...appearanceStyles,
    borderRadius: 'var(--spacing-2)', // Add a default radius for visual appeal
  };
  if (component.contextualLayout?.columnSpan) {
    wrapperStyle.gridColumn = `span ${component.contextualLayout.columnSpan}`;
  }

  return (
    <div style={wrapperStyle}>
      <div style={contentStyle}>
        {component.children.map(childId => (
          <RenderNode key={childId} componentId={childId} />
        ))}
      </div>
    </div>
  );
};

// --- Form Item Preview ---
const FormComponentPreview = ({ component }: { component: FormComponent }) => {
  const wrapperStyle: React.CSSProperties = {};
  if (component.contextualLayout?.columnSpan) {
    wrapperStyle.gridColumn = `span ${component.contextualLayout.columnSpan}`;
  }
  
  return (
    <div style={wrapperStyle}>
      <TextInputPreview label={component.name} />
    </div>
  );
};

// --- Main Form Renderer ---
export const FormRenderer = () => {
  const rootId = useAtomValue(rootComponentIdAtom);

  if (!rootId) {
    return <div>Loading form...</div>;
  }

  return <RenderNode componentId={rootId} />;
};