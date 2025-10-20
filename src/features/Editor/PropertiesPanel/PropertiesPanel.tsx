// src/features/Editor/PropertiesPanel/PropertiesPanel.tsx
import { useEffect } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import {
  selectedCanvasComponentIdsAtom,
  dataBindingResultAtom,
  isPropertiesPanelVisibleAtom,
} from '../../../data/atoms';
import { canvasComponentsByIdAtom, commitActionAtom, rootComponentIdAtom } from '../../../data/historyAtoms';
import { getPropertyEditor, MultiSelectEditorProps, PropertyEditorProps } from './propertyEditorRegistry';
import { PanelHeader } from '../../../components/PanelHeader';
import { getComponentName } from '../canvasUtils';
import { CanvasComponent, LayoutComponent } from '../../../types';
import styles from './PropertiesPanel.module.css';

// Import all editors to trigger their registration side-effects.
// This is the single point of entry for all property panel UIs.
import './EmptyStatePanel';
import './MultiSelectEditor';
import './LayoutEditor';
import './FormEditor';
import './RootEditor';


export const PropertiesPanel = () => {
  const selectedIds = useAtomValue(selectedCanvasComponentIdsAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const [bindingResult, setBindingResult] = useAtom(dataBindingResultAtom);
  const setIsPanelVisible = useSetAtom(isPropertiesPanelVisibleAtom);
  const rootId = useAtomValue(rootComponentIdAtom);

  const primarySelectedId = selectedIds.length > 0 ? selectedIds[0] : null;

  useEffect(() => {
    if (bindingResult) {
      const componentToBind = allComponents[bindingResult.componentId];
      if (!componentToBind) return;
      
      commitAction({
        action: { type: 'COMPONENT_UPDATE_BINDING', payload: bindingResult },
        message: `Update binding for '${getComponentName(componentToBind)}'`
      });

      setBindingResult(null);
    }
  }, [bindingResult, allComponents, setBindingResult, commitAction]);

  const renderPanelContent = () => {
    if (selectedIds.length > 1) {
      const MultiSelectEditor = getPropertyEditor('multi-select') as React.ComponentType<MultiSelectEditorProps>;
      return MultiSelectEditor ? <MultiSelectEditor count={selectedIds.length} /> : null;
    }

    if (!primarySelectedId) {
        const EmptyStatePanel = getPropertyEditor('empty-state') as React.ComponentType<Record<string, never>>;
        return EmptyStatePanel ? <EmptyStatePanel /> : null;
    }

    const component = allComponents[primarySelectedId];
    if (!component) return null;

    // Use a special editor for the root component
    if (component.id === rootId) {
        // FIX: Replaced 'any' with the specific 'LayoutComponent' type.
        const RootEditor = getPropertyEditor('root') as React.ComponentType<PropertyEditorProps<LayoutComponent>>;
        return RootEditor ? <RootEditor component={component as LayoutComponent} /> : null;
    }

    // FIX: Replaced 'any' with the base 'CanvasComponent' type.
    const Editor = getPropertyEditor(component.componentType) as React.ComponentType<PropertyEditorProps<CanvasComponent>>;
    return Editor ? <Editor component={component} /> : null;
  };

  let panelTitle = "Properties";
  if (selectedIds.length > 1) {
    panelTitle = `${selectedIds.length} items selected`;
  } else if (primarySelectedId) {
    const selectedComponent = allComponents[primarySelectedId];
    if(selectedComponent) {
        panelTitle = getComponentName(selectedComponent);
    }
  }

  return (
    <div className={styles.propertiesPanelContainer}>
      <PanelHeader title={panelTitle} onClose={() => setIsPanelVisible(false)} />
      <div className={styles.panelContent}>
        {renderPanelContent()}
      </div>
    </div>
  );
};