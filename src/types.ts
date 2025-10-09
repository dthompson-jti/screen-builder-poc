// src/types.ts

// A generic base for all components on the canvas
export interface BaseComponent {
  id: string;
  parentId: string; // ID of the parent container
  name: string; // User-defined name/label
}

// Specific type for form fields/widgets
export interface FormComponent extends BaseComponent {
  componentType: 'widget' | 'field';
  type: 'text-input' | 'dropdown' | 'checkbox'; // The specific kind of widget/field
  binding?: BoundData | null;
  origin?: 'data' | 'general';
}

// New type for our layout container
export interface LayoutComponent extends BaseComponent {
  componentType: 'layout';
  children: string[]; // An ordered list of child component IDs
  properties: {
    arrangement: 'stack' | 'row' | 'grid';
    // Row-specific
    distribution?: 'start' | 'center' | 'space-between';
    verticalAlign?: 'start' | 'center' | 'end' | 'stretch';
    wrapping?: boolean;
    minItemWidth?: number;
    // Grid-specific
    columns?: '1' | '2' | '3' | 'sidebar-left' | 'sidebar-right';
    // Universal
    gap: 'none' | 'sm' | 'md' | 'lg';
  };
}

// A union type representing any component that can be on the canvas
export type CanvasComponent = FormComponent | LayoutComponent;


// --- UNCHANGED BELOW ---

export interface DraggableComponent {
  id: string;
  name: string;
  type: 'widget' | 'field' | 'layout'; // Added 'layout'
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

export interface DropdownItem {
  id: string;
  name: string;
  isNavigable?: boolean;
  icon: string;
  iconColor: string;
}

export interface ComponentNode {
  id: string;
  name: string;
  connections: number;
}

// Add a new, central interface for all dnd-kit data payloads.
// This provides type safety when reading data back from drag events.
export interface DndData {
  id: string;
  name: string;
  type: 'widget' | 'field' | 'layout' | 'container' | 'container-drop-zone';
  icon?: string;
  isNew?: boolean;
  origin?: 'data' | 'general';
  childrenCount?: number;
  // FIX: Add properties specific to the new bottom drop zone
  parentId?: string;
  index?: number;
  // This property is added by dnd-kit's sortable context
  sortable?: {
    containerId: string;
    index: number;
    items: unknown[];
  };
}