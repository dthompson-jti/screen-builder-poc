// src/types.ts

/**
 * Represents the information for a selected data binding.
 */
export interface BoundData {
  nodeId: string;
  nodeName: string;
  fieldId: string;
  fieldName: string;
  path: string; // e.g., "Arrest > Arrest Date"
}

/**
 * Represents a component that has been placed on the editor canvas.
 * It has a unique instance ID.
 */
export interface FormComponent {
  id: string;      // Unique instance ID, e.g., "first-name-1678886400000"
  type: string;    // The original component type, e.g., "first-name"
  name: string;    // The display name, e.g., "First Name"
  // FIX: Differentiate between components from the 'data' tab vs 'general' tab
  origin: 'data' | 'general';
  binding?: BoundData | null;
}