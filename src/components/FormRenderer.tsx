// src/components/FormRenderer.tsx
// REMOVED: Unused 'React' import due to new JSX transform.
import { useAtomValue } from 'jotai';
import { canvasComponentsByIdAtom, rootComponentIdAtom } from '../data/historyAtoms';
import { CanvasComponent } from '../types';

// Import all the new unified renderers
import { TextInputRenderer } from '../features/Editor/renderers/TextInputRenderer';
import { DropdownRenderer } from '../features/Editor/renderers/DropdownRenderer';
import { RadioButtonsRenderer } from '../features/Editor/renderers/RadioButtonsRenderer';
import { PlainTextRenderer } from '../features/Editor/renderers/PlainTextRenderer';
import { LinkRenderer } from '../features/Editor/renderers/LinkRenderer';
import { LayoutRenderer } from '../features/Editor/renderers/LayoutRenderer';

// --- Recursive Render Node ---
const RenderNode = ({ componentId }: { componentId: string }) => {
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const component = allComponents[componentId];

  if (!component) return null;

  // --- RENDERER ROUTER ---
  const renderComponent = (comp: CanvasComponent) => {
    switch (comp.componentType) {
      case 'layout':
        return <LayoutRenderer component={comp} mode="preview" />;
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
          default:
            return <div>Unknown control type</div>;
        }
      default:
        return <div>Unknown component type</div>;
    }
  };

  return <>{renderComponent(component)}</>;
};

// --- Main Form Renderer ---
export const FormRenderer = () => {
  const rootId = useAtomValue(rootComponentIdAtom);

  if (!rootId) {
    return <div>Loading form...</div>;
  }

  return <RenderNode componentId={rootId} />;
};