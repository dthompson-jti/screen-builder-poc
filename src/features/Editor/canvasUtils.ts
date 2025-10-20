// src/features/Editor/canvasUtils.ts
import { CanvasComponent } from "../../types";

// --- UTILITY ---
export const getComponentName = (component: CanvasComponent): string => {
  if (component.componentType === 'layout') {
    return component.name;
  }
  
  const formComponent = component;
  if (formComponent.properties.controlType === 'plain-text') {
    return formComponent.properties.content?.substring(0, 30) || 'Plain Text';
  }
  return formComponent.properties.label || 'Form Field';
};