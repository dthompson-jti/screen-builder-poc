// src/types.ts

export interface DraggableComponent {
  id: string;
  name: string;
  type: 'widget' | 'field';
  icon: string;
  iconColor?: string;
  // Properties for data binding modal
  nodeId?: string;
  nodeName?: string;
  path?: string;
}

export interface ComponentGroup {
  title: string;
  components: DraggableComponent[];
}

export interface BoundData {
  nodeId: string;
  nodeName: string;
  fieldId: string;
  fieldName: string;
  path: string;
}

export interface FormComponent {
  id: string;
  name: string;
  type: 'widget' | 'field';
  binding?: BoundData | null;
  origin?: 'data' | 'general';
}

export interface DropdownItem {
  id: string;
  name: string;
  isNavigable?: boolean;
  // FIX: Add icon and color for dynamic rendering
  icon: string;
  iconColor: string;
}

export interface ComponentNode {
  id: string;
  name: string;
  connections: number;
}