// src/components/FormRenderer.tsx
import React from 'react';
import { useAtomValue } from 'jotai';
import { canvasComponentsByIdAtom, rootComponentIdAtom } from '../data/historyAtoms';
import { FormComponent, LayoutComponent } from '../types';
import { TextInputPreview } from '../features/Editor/previews/TextInputPreview';

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
  const appearance = component.properties.appearance;
  
  const spacingMap: { [key: string]: string } = {
    none: '0px', sm: 'var(--spacing-2)', md: 'var(--spacing-4)',
    lg: 'var(--spacing-6)', xl: 'var(--spacing-8)'
  };

  const gapMap = { none: '0px', sm: 'var(--spacing-2)', md: 'var(--spacing-4)', lg: 'var(--spacing-6)' };
  
  const containerStyle: React.CSSProperties = {
    padding: spacingMap[appearance?.padding || 'none'],
    borderRadius: 'var(--spacing-2)',
  };

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    gap: gapMap[component.properties.gap] || gapMap.md,
  };

  const arrangement = component.properties.arrangement;
  if (arrangement === 'stack') {
    contentStyle.flexDirection = 'column';
  } else if (arrangement === 'row') {
    contentStyle.flexDirection = 'row';
    contentStyle.flexWrap = 'nowrap';
    contentStyle.justifyContent = component.properties.distribution;
    contentStyle.alignItems = component.properties.verticalAlign;
  } else if (arrangement === 'wrap') {
    contentStyle.flexDirection = 'row';
    contentStyle.flexWrap = 'wrap';
    contentStyle.alignItems = 'start';
  } else if (arrangement === 'grid') {
    contentStyle.display = 'grid';
    const gridTemplateMap: {[key: string]: string} = {
      'auto': 'repeat(auto-fill, minmax(150px, 1fr))',
      '2-col-50-50': '1fr 1fr',
      '3-col-33': '1fr 1fr 1fr',
      '2-col-split-left': '2fr 1fr',
    };
    const { columnLayout } = component.properties;
    contentStyle.gridTemplateColumns = typeof columnLayout === 'number'
      ? `repeat(${columnLayout}, 1fr)`
      : gridTemplateMap[columnLayout] || '1fr';
  }

  const wrapperStyle: React.CSSProperties = {};
  if (component.contextualLayout?.columnSpan) {
    wrapperStyle.gridColumn = `span ${component.contextualLayout.columnSpan}`;
  }

  return (
    <div style={wrapperStyle}>
      <div 
        style={containerStyle}
        data-appearance-type={appearance?.type || 'transparent'}
        data-bordered={appearance?.bordered || false}
        data-arrangement={arrangement}
      >
        <div style={contentStyle} className="layout-content-wrapper">
          {component.children.map(childId => (
            <RenderNode key={childId} componentId={childId} />
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Form Item Preview ---
const FormComponentPreview = ({ component }: { component: FormComponent }) => {
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const wrapperStyle: React.CSSProperties = {};
  
  if (component.contextualLayout?.columnSpan) {
    wrapperStyle.gridColumn = `span ${component.contextualLayout.columnSpan}`;
  }
  
  const parent = allComponents[component.parentId];
  if (parent && parent.componentType === 'layout' && parent.properties.arrangement === 'wrap') {
    wrapperStyle.flexShrink = component.contextualLayout?.preventShrinking ? 0 : 1;
  }
  
  return (
    <div style={wrapperStyle}>
      <TextInputPreview label={component.properties.label} isEditing={false} />
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