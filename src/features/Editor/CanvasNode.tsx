// src/features/Editor/CanvasNode.tsx
import { useAtomValue } from 'jotai';
import { canvasComponentsByIdAtom } from '../../data/historyAtoms';
import { CanvasComponent } from '../../types';

// Import all the new unified renderers
import { TextInputRenderer } from './renderers/TextInputRenderer';
import { DropdownRenderer } from './renderers/DropdownRenderer';
import { RadioButtonsRenderer } from './renderers/RadioButtonsRenderer';
import { PlainTextRenderer } from './renderers/PlainTextRenderer';
import { LinkRenderer } from './renderers/LinkRenderer';
import { LayoutRenderer } from './renderers/LayoutRenderer';
import { CheckboxRenderer } from './renderers/CheckboxRenderer';

// --- ORCHESTRATOR COMPONENT ---
export const CanvasNode = ({ componentId }: { componentId: string }) => {
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const component = allComponents[componentId];

  if (!component) {
    return null;
  }

  // --- RENDERER ROUTER ---
  const renderComponent = (comp: CanvasComponent) => {
    switch (comp.componentType) {
      case 'layout':
        return <LayoutRenderer component={comp} mode="canvas" />;
      case 'widget':
      case 'field':
        switch (comp.properties.controlType) {
          case 'text-input':
            return <TextInputRenderer component={comp} mode="canvas" />;
          case 'dropdown':
            return <DropdownRenderer component={comp} mode="canvas" />;
          case 'radio-buttons':
            return <RadioButtonsRenderer component={comp} mode="canvas" />;
          case 'plain-text':
            return <PlainTextRenderer component={comp} mode="canvas" />;
          case 'link':
            return <LinkRenderer component={comp} mode="canvas" />;
          // FIX: Add case for the new checkbox control type.
          case 'checkbox':
            return <CheckboxRenderer component={comp} mode="canvas" />;
          default:
            return <div>Unknown control type</div>;
        }
      default:
        return <div>Unknown component type</div>;
    }
  };

  return <>{renderComponent(component)}</>;
};