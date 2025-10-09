// src/types.ts
// NEW FILE: Centralizing core application types as a best practice.

export interface BaseComponent {
  id: string;
  parentId: string;
  name: string;
  componentType: 'layout' | 'field' | 'widget';
  contextualLayout?: {
    columnSpan?: number;
  }
}

export interface LayoutComponent extends BaseComponent {
  componentType: 'layout';
  children: string[];
  properties: {
    arrangement: 'stack' | 'row' | 'grid';
    gap: 'none' | 'sm' | 'md' | 'lg';
    distribution: 'start' | 'center' | 'end' | 'space-between';
    verticalAlign: 'start' | 'center' | 'end' | 'stretch';
    allowWrapping: boolean;
    columnLayout: 'auto' | '2-col-50-50' | '3-col-33' | '2-col-split-left';
  };
}

export interface FormComponent extends BaseComponent {
  componentType: 'widget' | 'field';
  type: string; // e.g., 'text-input', 'dropdown'
  origin?: 'data' | 'general';
  binding: BoundData | null | undefined;
}

export type CanvasComponent = LayoutComponent | FormComponent;

export type NormalizedCanvasComponents = {
  [id: string]: CanvasComponent;
};

export interface BoundData {
  nodeId: string;
  nodeName: string;
  fieldId: string;
  fieldName: string;
  path: string;
}

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
  connections?: number;
}

export interface DndData {
  id: string;
  name: string;
  type: string;
  icon?: string;
  isNew?: boolean;
  origin?: 'data' | 'general';
  childrenCount?: number;
}