// src/features/Editor/DndDragOverlay.tsx
import { useAtomValue } from 'jotai';
import { Active } from '@dnd-kit/core';
import { canvasComponentsByIdAtom } from '../../data/historyAtoms';
import { DndData, CanvasComponent } from '../../types';

// Import all the new unified renderers
import { TextInputRenderer } from './renderers/TextInputRenderer';
import { DropdownRenderer } from './renderers/DropdownRenderer';
import { RadioButtonsRenderer } from './renderers/RadioButtonsRenderer';
import { PlainTextRenderer } from './renderers/PlainTextRenderer';
import { LinkRenderer } from './renderers/LinkRenderer';
import { CheckboxRenderer } from './renderers/CheckboxRenderer';
// FIX: Removed unused import of LayoutRenderer.
// import { LayoutRenderer } from './renderers/LayoutRenderer';

// --- REPLACEMENTS FOR DELETED PREVIEW COMPONENTS ---
const BrowserItemPreview = ({ name, icon }: { name: string; icon: string }) => (
    <div style={{
        padding: '8px 12px',
        backgroundColor: 'var(--surface-bg-primary)',
        border: '1px solid var(--surface-border-secondary)',
        borderRadius: '6px',
        boxShadow: 'var(--surface-shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-3)',
        color: 'var(--surface-fg-primary)',
        fontFamily: 'var(--font-family-sans)',
        fontSize: '0.9em',
        userSelect: 'none',
    }}>
        <span className="material-symbols-rounded" style={{ color: 'var(--surface-fg-secondary)' }}>{icon}</span>
        <span>{name}</span>
    </div>
);

const ContainerPreview = ({ component }: { component: CanvasComponent }) => (
    <div style={{
        padding: 'var(--spacing-4)',
        backgroundColor: 'var(--surface-bg-primary)',
        border: '1px dashed var(--surface-border-tertiary)',
        borderRadius: '6px',
        minWidth: '200px',
        minHeight: '60px'
    }}>
        <p style={{ margin: 0, fontSize: '0.9em', color: 'var(--surface-fg-secondary)' }}>{component.componentType === 'layout' ? component.name : ''}</p>
    </div>
);

interface DndDragOverlayProps {
  activeItem: Active | null;
}

export const DndDragOverlay = ({ activeItem }: DndDragOverlayProps) => {
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  
  if (!activeItem) return null;

  const activeData = activeItem.data.current as DndData;
  const { isNew, name, icon } = activeData || {};

  if (isNew) {
    return <BrowserItemPreview name={name ?? ''} icon={icon ?? ''} />;
  }
  
  const componentId = activeItem.id;
  if (typeof componentId !== 'string') return null;

  const activeComponent = allComponents[componentId];
  if (!activeComponent) return null;
  
  const renderComponent = (comp: CanvasComponent) => {
    switch (comp.componentType) {
      case 'layout':
        return <ContainerPreview component={comp} />;
      case 'widget':
      case 'field':
        switch (comp.properties.controlType) {
          case 'text-input':
            return <TextInputRenderer component={comp} mode="preview" />;
          case 'dropdown':
            return <DropdownRenderer component={comp} mode="preview" />;
          case 'radio-buttons':
            return <RadioButtonsRenderer component={comp} mode="preview" />;
          case 'plain-text':
            return <PlainTextRenderer component={comp} mode="preview" />;
          case 'link':
            return <LinkRenderer component={comp} mode="preview" />;
          // FIX: Add case for the new checkbox control type.
          case 'checkbox':
            return <CheckboxRenderer component={comp} mode="preview" />;
          default:
            return null;
        }
      default:
        return null;
    }
  };

  return (
    <div style={{ pointerEvents: 'none', opacity: 0.85 }}>
      {renderComponent(activeComponent)}
    </div>
  );
};