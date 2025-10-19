// src/features/Editor/CanvasNode.tsx
import { useEffect, useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { 
  canvasInteractionAtom,
} from '../../data/atoms';
import { canvasComponentsByIdAtom, commitActionAtom } from '../../data/historyAtoms';
import { FormComponent } from '../../types';
import { useEditable } from '../../data/useEditable';
import { SortableWrapper, SelectionWrapper } from './CanvasWrappers';
import { ComponentRenderer } from './CanvasRenderers';
// REMOVED: import { getComponentName } from './canvasUtils'; 

// --- ORCHESTRATOR COMPONENT ---
export const CanvasNode = ({ componentId }: { componentId: string }) => {
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const [interactionState, setInteractionState] = useAtom(canvasInteractionAtom);
  const commitAction = useSetAtom(commitActionAtom);
  
  const component = allComponents[componentId];
  const isEditing = interactionState.mode === 'editing' && interactionState.id === componentId;

  const handleValueCommit = useCallback((newValue: string) => {
    if (!component || component.componentType === 'layout') return;
    const isPlainText = component.properties.controlType === 'plain-text';
    const propertiesToUpdate = isPlainText ? { content: newValue } : { label: newValue };
    const message = isPlainText ? `Update text content` : `Rename to '${newValue}'`;
    
    commitAction({
      action: { type: 'COMPONENT_UPDATE_FORM_PROPERTIES', payload: { componentId: component.id, newProperties: propertiesToUpdate } },
      message
    });
    setInteractionState({ mode: 'selecting', ids: [component.id] });
  }, [commitAction, setInteractionState, component]);

  const handleCancelEdit = useCallback(() => {
    setInteractionState({ mode: 'selecting', ids: [componentId] });
  }, [setInteractionState, componentId]);
  
  const editable = useEditable<HTMLInputElement | HTMLTextAreaElement>(
    (component?.componentType !== 'layout' && component?.properties.controlType === 'plain-text') 
      ? component.properties.content || '' 
      : (component as FormComponent)?.properties.label || '',
    handleValueCommit,
    handleCancelEdit,
    { multiline: component?.componentType !== 'layout' && component.properties.controlType === 'plain-text' }
  );

  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        editable.ref.current?.focus();
        editable.ref.current?.select();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isEditing, editable.ref]);

  if (!component) {
    return null;
  }

  return (
    <SortableWrapper component={component}>
      <SelectionWrapper component={component}>
        <ComponentRenderer component={component} isEditing={isEditing} editable={editable} />
      </SelectionWrapper>
    </SortableWrapper>
  );
};