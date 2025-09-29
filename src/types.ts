// src/types.ts

// --- Component & Canvas Types ---
export interface FormComponent {
  id: string;
  type: string;
  name: string;
  origin: 'data' | 'general';
  binding: BoundData | null;
}

// --- Data Binding Types ---
export interface BoundData {
  nodeId: string;
  nodeName: string;
  fieldId: string;
  fieldName: string;
  path: string;
}

// --- Component Browser & Mock Data Types ---
export interface DraggableComponent {
  id: string;
  name: string;
  type: 'field' | 'widget' | 'layout';
  icon: string;
  iconColor?: string;
  // --- REFACTOR: Add optional properties to support data binding context ---
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
  isNavigable?: boolean;
}

export interface ComponentNode {
  id: string;
  name:string;
  connections: number;
}