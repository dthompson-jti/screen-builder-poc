// src/types.ts

/**
 * Represents a component that has been placed on the editor canvas.
 * It has a unique instance ID.
 */
export interface FormComponent {
  id: string;      // Unique instance ID, e.g., "first-name-1678886400000"
  type: string;    // The original component type, e.g., "first-name"
  name: string;    // The display name, e.g., "First Name"
}