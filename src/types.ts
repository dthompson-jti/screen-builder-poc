// src/types.ts
// NEW FILE: Centralized type definitions for the application.

// --- Base & Data Binding ---
export interface BoundData {
  nodeId: string;
  nodeName: string;
  fieldId: string;
  fieldName: string;
  path: string;
}

// --- Canvas Components ---
export type AppearanceType = 'transparent' | 'primary' | 'secondary' | 'tertiary' | 'info' | 'warning' | 'error';

export interface AppearanceProperties {
  type: AppearanceType;
  bordered: boolean;
  padding: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

interface BaseComponent {
  id: string;
  parentId: string;
  contextualLayout?: {
    columnSpan?: number;
    preventShrinking?: boolean;
  };
}

export interface LayoutComponent extends BaseComponent {
  componentType: 'layout';
  name: string; // Name/Label for layouts remains at the top level
  children: string[];
  properties: {
    arrangement: 'stack' | 'row' | 'wrap' | 'grid';
    gap: 'none' | 'sm' | 'md' | 'lg';
    distribution: 'start' | 'center' | 'end' | 'space-between';
    verticalAlign: 'start' | 'center' | 'end' | 'stretch';
    columnLayout: 'auto' | '2-col-50-50' | '3-col-33' | '2-col-split-left' | number;
    appearance: AppearanceProperties;
  };
}

export interface FormComponent extends BaseComponent {
  componentType: 'widget' | 'field';
  origin?: 'data' | 'general';
  binding: BoundData | null;
  // NEW: Nested properties object for form-specific attributes
  properties: {
    label: string;
    fieldName: string;
    required: boolean;
    controlType: 'text-input' | 'dropdown' | 'radio-buttons';
  };
}

export type CanvasComponent = LayoutComponent | FormComponent;

export type NormalizedCanvasComponents = {
  [id: string]: CanvasComponent;
};

// --- Component Browser & Navigator ---
export interface DraggableComponent {
  id: string;
  name: string;
  type: 'widget' | 'field' | 'layout';
  icon: string;
  iconColor?: string;
  nodeId?: string;
  nodeName?: string;
  path?: string;
}

export interface ComponentGroup {
  title: string;
  components: DraggableComponent[];
}

export interface DropdownItem {
  id: string;
  name: string;
  isNavigable: boolean;
  icon: string;
  iconColor: string;
}

export interface ComponentNode {
  id: string;
  name: string;
  connections: number;
}

// --- Drag and Drop ---
export interface DndData {
  id: string;
  name: string;
  type: 'layout' | 'widget' | 'field';
  icon?: string;
  isNew?: boolean;
  origin?: 'data' | 'general';
  childrenCount?: number;
  // FIX: Add the optional 'data' property to carry binding info.
  // This resolves the TypeScript errors.
  data?: {
    nodeId: string;
    nodeName: string;
    path: string;
  };
}