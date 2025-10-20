// src/features/Editor/PropertiesPanel/propertyEditorRegistry.ts
import React from 'react';
import { CanvasComponent } from '../../../types';

// The interface for any property editor component
export interface PropertyEditorProps<T extends CanvasComponent> {
  component: T;
}

export interface MultiSelectEditorProps {
    count: number;
}

type EditorComponent = 
    // FIX: Replaced 'any' with the base 'CanvasComponent' type for better type safety.
    | React.ComponentType<PropertyEditorProps<CanvasComponent>>
    | React.ComponentType<MultiSelectEditorProps>
    // FIX: Replaced '{}' with 'Record<string, never>' for components that accept no props.
    | React.ComponentType<Record<string, never>>;


// The registry itself: a simple map of component type to its editor component
const registry: Map<string, EditorComponent> = new Map();

export const registerPropertyEditor = (
  componentType: string,
  editor: EditorComponent,
) => {
  if (registry.has(componentType)) {
    console.warn(`Overwriting property editor for type: ${componentType}`);
  }
  registry.set(componentType, editor);
};

export const getPropertyEditor = (
  componentType: string
): EditorComponent | undefined => {
  return registry.get(componentType);
};