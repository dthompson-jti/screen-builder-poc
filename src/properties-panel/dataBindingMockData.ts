// src/properties-panel/dataBindingMockData.ts
import { ComponentGroup, DraggableComponent, DropdownItem } from "../component-browser/mockComponentTree";

// A simplified, separate data source for the data binding modal.

// --- DATA STRUCTURES ---

export interface BindingField extends DraggableComponent {
  path: string;
}

export interface BindingComponentGroup extends ComponentGroup {
  components: BindingField[];
}

export interface BindingNode {
  id: string;
  name: string;
  connections: number;
}

// --- MOCK DATA ---

const arrestFields: BindingField[] = [
  { id: 'arrest-id', name: 'Id (PK)', type: 'field', icon: 'key', path: 'Arrest > Id (PK)' },
  { id: 'arrest-date', name: 'Arrest Date', type: 'field', icon: 'calendar_today', path: 'Arrest > Arrest Date' },
  { id: 'arrest-type', name: 'Arrest Type', type: 'field', icon: 'category', path: 'Arrest > Arrest Type' },
  { id: 'booking-num', name: 'Booking Number', type: 'field', icon: 'pin', path: 'Arrest > Booking Number' },
];

const caseFields: BindingField[] = [
  { id: 'case-id', name: 'Case Id (PK)', type: 'field', icon: 'key', path: 'Case > Case Id (PK)' },
  { id: 'case-type', name: 'Case Type', type: 'field', icon: 'category', path: 'Case > Case Type' },
  { id: 'case-status', name: 'Case Status', type: 'field', icon: 'label', path: 'Case > Case Status' },
];

export const bindingComponentGroups: Record<string, BindingComponentGroup[]> = {
  'arrest': [{ title: 'Arrest Fields', components: arrestFields }],
  'case': [{ title: 'Case Fields', components: caseFields }],
};

export const bindingTreeData: BindingNode[] = [
  { id: 'case', name: 'Case', connections: 1 },
  { id: 'arrest', name: 'Arrest', connections: 0 },
];

// FIX: Add connection data for the binding modal's navigator
export const bindingConnectionsData: Record<string, { entities: DropdownItem[] }> = {
    'case': {
        entities: [{ id: 'arrest', name: 'Arrest', isNavigable: true }]
    },
    'arrest': {
        entities: []
    }
};