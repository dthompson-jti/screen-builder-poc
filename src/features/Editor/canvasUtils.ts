// src/features/Editor/canvasUtils.ts
import { CanvasComponent } from "../../types";

// --- UTILITY ---
export const getComponentName = (component: CanvasComponent): string => {
  if (component.componentType === 'layout') {
    return component.name;
  }
  
  // Handle form components
  if (component.properties.controlType === 'plain-text' || component.properties.controlType === 'link') {
    return component.properties.content?.substring(0, 30) || (component.properties.controlType === 'link' ? 'Link' : 'Plain Text');
  }
  return component.properties.label || 'Form Field';
};