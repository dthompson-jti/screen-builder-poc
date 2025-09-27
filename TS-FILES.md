# Project TypeScript (.ts) File Inventory

This file provides a complete list and the full source code of all non-component TypeScript (`.ts`) files in the project.

**Purpose:** This document is a manifest created to streamline AI-assisted development. It allows for easy referencing and providing context of specific logic files in future prompts, ensuring the AI has a consistent and accurate understanding of the project's data structures and state management.

---

### `src/types.ts`

This file contains shared TypeScript interfaces used across the application.

```typescript
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
```

---

### `src/appAtoms.ts`

This file contains Jotai atoms for global application state.

```typescript
// src/appAtoms.ts
import { atom } from 'jotai';

/**
 * An atom to control the visibility of the component browser ("Add Panel").
 */
export const isComponentBrowserVisibleAtom = atom(true);
```

---

### `src/component-browser/browserAtoms.ts`

This file contains Jotai atoms specific to the state of the component browser panel.

```typescript
// src/component-browser/browserAtoms.ts
import { atom } from 'jotai';
// FIX: Correctly import componentListData from the newly stable mock data file
import { componentListData, ComponentGroup } from './mockComponentTree';

/**
 * The ID of the node currently at the center of the navigator view.
 * This is the application's single source of truth for navigation context.
 */
export const selectedNodeIdAtom = atom<string>('arrest');

/**
 * A derived atom that provides the list of draggable components
 * based on the currently selected node ID.
 */
export const availableComponentGroupsAtom = atom<ComponentGroup[]>((get) => {
  const selectedId = get(selectedNodeIdAtom);
  if (!selectedId) {
    return [];
  }
  return componentListData[selectedId] || [];
});

/**
 * An atom to control the visibility of the "Connected nodes" dropdown.
 */
export const isConnectionsDropdownVisibleAtom = atom(false);
```

---

### `src/component-browser/mockComponentTree.ts`

This file contains the static data structures that power the component browser and navigator.

```typescript
// src/component-browser/mockComponentTree.ts

// --- HIERARCHY & INTERFACES ---

export const componentTreeData = [
  { id: 'case', name: 'Case', connections: 18 },
  { id: 'subcase', name: 'Subcase', connections: 5 },
  { id: 'arrest', name: 'Arrest', connections: 96 },
  { id: 'victim', name: 'Victim', connections: 4 },
  { id: 'arrest-charges', name: 'Arrest Charges', connections: 15 },
  { id: 'officer', name: 'Officer', connections: 8 },
];

export interface DraggableComponent {
  id: string; name: string; type: 'field' | 'widget' | 'layout'; icon: string; iconColor?: string;
}
export interface ComponentGroup { title: string; components: DraggableComponent[]; }
export interface DropdownItem { id: string; name: string; isNavigable?: boolean; }
interface DropdownCategory { entities: DropdownItem[]; collections: DropdownItem[]; transients: DropdownItem[]; }

// --- DATA HELPERS ---

const createId = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

// Helper to create a DraggableComponent
const createComponent = (name: string, type: 'field' | 'widget', icon: string, iconColor?: string): DraggableComponent => ({
  id: createId(name), name, type, icon, iconColor
});

// --- FULL DATA FOR "ARREST" NODE ---

const arrestData = {
  plainFields: ['Id (PK)', 'Access Level', 'Arrest Date', 'Arrest Time', 'Arrest Type', 'Arresting Agency File Number', 'Booking Number', 'Create User Real Name', 'Create Username', 'Date Created', 'Exchange Id', 'Last Update User Real Name', 'Last Update Username', 'Last Updated', 'Location', 'Memo', 'Roa Access Level', 'Source Case Number', 'Status Date', 'Update Reason'].map(name => createComponent(name, 'field', 'database')),
  entityFields: ['Arrest Charges', 'Arresting Agency', 'Associated Party', 'Booking Agency', 'Officer'].map(name => createComponent(name, 'field', 'database')),
  widgets: ['AddCaseSpecialStatusWidget', 'AddJudgeNoteIcon', 'AddNoteIcon', 'AddPartySpecialStatusWidget', 'AddToRelatedCases', 'CaseDisp', 'CaseEMailIcon', 'CaseLabelWidget', 'ClipboardWidget', 'CustomSearchWidget', 'DateCalculator', 'DaysOfWeekWidget', 'DocAddWidget', 'DocumentCrossReferenceWidget', 'DuplicateHighlighterWidget', 'EntityPagingWidget', 'ExternalSystemSearchWidget', 'FeePayment', 'GeneralFee', 'GenerateDocument', 'GenericDownload', 'GenericLookup', 'LookupItemCategoryWidget', 'ModalWidget', 'NoteIcon', 'ObjectAssociationWidget', 'OpenPersonViewWidget', 'PagePrintIcon', 'PanelTotalWidget', 'PartyCrossReferenceWidget', 'PortalKioskPrintRequest', 'QuestionnaireResponseWidget', 'QuickScheduleEvent', 'RelateCasesByPartyWidget', 'RelatedPeerCasesWidget', 'ReservedToScheduledWidget', 'SSRSWidget', 'ScheduleEvent', 'StaticTextWidget', 'TotalWidget', 'UpdateRecordsOnRelatedCases', 'UserNameSearchWidget', 'VacateFutureEventsWidget', 'WorkflowTasks', 'sendEmailWidget', 'sendSmsWidget'].map(name => createComponent(name, 'widget', 'widgets', 'var(--surface-fg-warning-primary)')),
  transientPlainFields: ['Access Context Mock', 'Access Level Label', 'Access Level Value', 'Audit Values', 'Case Category', 'Case Id', 'Case Status', 'Case Type', 'Created And Last Updated Label', 'Created And Last Updated User And Date Label', 'Created Name', 'Cross Referenced', 'Current Values', 'Description', 'Entity And Id', 'Entity Display Name', 'Entity Id And Title', 'Entity Name', 'Entity Name And Id', 'Entity Short Name', 'Entity Short Name And Id', 'Entity Underscore Id', 'Id And Entity Name', 'Id And Title', 'Inaccessible', 'Last Modified Or Created', 'Last Modified Or Created Date', 'Last Modified Or Created Username', 'Last Updated Name', 'Number Of Parents', 'Person Id', 'Plain Field Values', 'Plain Fields Only', 'RBCInaccessible', 'Related Peer Ids', 'Revision Objects', 'Roa Changes', 'Title', 'Title With Non Case Parent Titles', 'Update Reason Label', 'Xrefs'].map(name => createComponent(name, 'field', 'database', 'var(--surface-fg-tertiary)')),
  transientEntityFields: ['Access Context', 'Case', 'Closed Work Queues', 'Consolidation Peers', 'Cross Referenced Case Assignments', 'Cross Referenced Documents', 'Cross Referenced Parties', 'Cross Referenced Scheduled Events', 'Current Version', 'Entity', 'Left Cross Referenced Documents', 'Left Cross Referenced Parties', 'Left Cross Referenced Scheduled Events', 'Open Work Queues', 'Parent', 'Previous Version', 'Previous Versions', 'Previous Versions No Tx', 'Related Case Notes', 'Related Judge Notes', 'Related Peer Case Numbers', 'Related Peers', 'Related Roa Messages', 'Related Time Standards', 'Revision Bean Results', 'Right Cross Referenced Documents', 'Right Cross Referenced Parties', 'Right Cross Referenced Scheduled Events', 'Sub Case', 'Sub Case Or Case', 'Work Queues', 'Workflow Tasks'].map(name => createComponent(name, 'field', 'database', 'var(--surface-fg-tertiary)'))
};

// --- SIMPLIFIED DATA FOR OTHER NODES ---

const createSampleData = (name: string, entities: string[], collections: string[]) => ({
  plainFields: [`${name} ID (PK)`, `${name} Date`, `${name} Status`].map(n => createComponent(n, 'field', 'database')),
  entityFields: entities.map(n => createComponent(n, 'field', 'database')),
  widgets: [`${name} Widget 1`, `${name} Widget 2`].map(n => createComponent(n, 'widget', 'widgets', 'var(--surface-fg-warning-primary)')),
  transientPlainFields: [`${name} Transient Field 1`, `${name} Transient Field 2`].map(n => createComponent(n, 'field', 'database', 'var(--surface-fg-tertiary)')),
  transientEntityFields: [`${name} Transient Entity 1`, `${name} Transient Entity 2`].map(n => createComponent(n, 'field', 'database', 'var(--surface-fg-tertiary)'))
});

const caseData = createSampleData('Case', ['Subcase', 'Case Party'], ['Case Charges']);
const subcaseData = createSampleData('Subcase', ['Arrest', 'Subcase Party'], ['Subcase Documents']);
const victimData = createSampleData('Victim', ['Arrest Charges', 'Associated Party'], ['Victim Statements']);
const arrestChargesData = createSampleData('Arrest Charge', ['Officer', 'Plea Bargain'], ['Court Filings']);
const officerData = createSampleData('Officer', ['Assisting Officer'], ['Officer Reports']);


// --- FINAL EXPORTS ---

export const componentListData: Record<string, ComponentGroup[]> = {
  'case': [{ title: 'Plain Fields', components: caseData.plainFields }, { title: 'Entity Fields', components: caseData.entityFields }, { title: 'Widgets', components: caseData.widgets }, { title: 'Transient Plain Fields', components: caseData.transientPlainFields }, { title: 'Transient Entity Fields', components: caseData.transientEntityFields }],
  'subcase': [{ title: 'Plain Fields', components: subcaseData.plainFields }, { title: 'Entity Fields', components: subcaseData.entityFields }, { title: 'Widgets', components: subcaseData.widgets }, { title: 'Transient Plain Fields', components: subcaseData.transientPlainFields }, { title: 'Transient Entity Fields', components: subcaseData.transientEntityFields }],
  'arrest': [{ title: 'Plain Fields', components: arrestData.plainFields }, { title: 'Entity Fields', components: arrestData.entityFields }, { title: 'Widgets', components: arrestData.widgets }, { title: 'Transient Plain Fields', components: arrestData.transientPlainFields }, { title: 'Transient Entity Fields', components: arrestData.transientEntityFields }],
  'victim': [{ title: 'Plain Fields', components: victimData.plainFields }, { title: 'Entity Fields', components: victimData.entityFields }, { title: 'Widgets', components: victimData.widgets }, { title: 'Transient Plain Fields', components: victimData.transientPlainFields }, { title: 'Transient Entity Fields', components: victimData.transientEntityFields }],
  'arrest-charges': [{ title: 'Plain Fields', components: arrestChargesData.plainFields }, { title: 'Entity Fields', components: arrestChargesData.entityFields }, { title: 'Widgets', components: arrestChargesData.widgets }, { title: 'Transient Plain Fields', components: arrestChargesData.transientPlainFields }, { title: 'Transient Entity Fields', components: arrestChargesData.transientEntityFields }],
  'officer': [{ title: 'Plain Fields', components: officerData.plainFields }, { title: 'Entity Fields', components: officerData.entityFields }, { title: 'Widgets', components: officerData.widgets }, { title: 'Transient Plain Fields', components: officerData.transientPlainFields }, { title: 'Transient Entity Fields', components: officerData.transientEntityFields }],
};

export const connectionsDropdownData: Record<string, DropdownCategory> = {
  'case': { entities: [{id: 'subcase', name: 'Subcase', isNavigable: true}, {id: 'case-party', name: 'Case Party'}], collections: [{id: 'case-charges', name: 'Case Charges'}], transients: [{id: 'case-status', name: 'Case Status'}, {id: 'case-history', name: 'Case History'}] },
  'subcase': { entities: [{id: 'arrest', name: 'Arrest', isNavigable: true}, {id: 'subcase-party', name: 'Subcase Party'}], collections: [{id: 'subcase-documents', name: 'Subcase Documents'}], transients: [{id: 'subcase-status', name: 'Subcase Status'}] },
  'arrest': { entities: [{id: 'victim', name: 'Victim', isNavigable: true}, ...arrestData.entityFields.filter(e => e.name !== 'Victim').map(e => ({id: e.id, name: e.name}))], collections: [{id: 'arrest-charges', name: 'Arrest Charges'}], transients: [...arrestData.transientPlainFields.slice(0,4).map(e => ({id: e.id, name: e.name})), ...arrestData.transientEntityFields.slice(0,4).map(e => ({id: e.id, name: e.name}))] },
  'victim': { entities: [{id: 'arrest-charges', name: 'Arrest Charges', isNavigable: true}, {id: 'associated-party', name: 'Associated Party'}], collections: [{id: 'victim-statements', name: 'Victim Statements'}], transients: [{id: 'victim-status', name: 'Victim Status'}] },
  'arrest-charges': { entities: [{id: 'officer', name: 'Officer', isNavigable: true}, {id: 'plea-bargain', name: 'Plea Bargain'}], collections: [{id: 'court-filings', name: 'Court Filings'}], transients: [{id: 'charge-status', name: 'Charge Status'}] },
  'officer': { entities: [{id: 'assisting-officer', name: 'Assisting Officer'}], collections: [{id: 'officer-reports', name: 'Officer Reports'}], transients: [{id: 'officer-status', name: 'Officer Status'}] },
};
```

---

### `src/editor-canvas/canvasAtoms.ts`

This file contains Jotai atoms for managing the state of the editor canvas.

```typescript
// src/editor-canvas/canvasAtoms.ts
import { atom } from 'jotai';
import { FormComponent } from '../types';

/**
 * An atom that holds an array of all component instances on the canvas.
 * This is the single source of truth for the canvas layout.
 */
export const canvasComponentsAtom = atom<FormComponent[]>([]);

/**
 * An atom that holds the ID of the currently selected component on the canvas.
 * It is null if no component is selected.
 */
export const selectedCanvasComponentIdAtom = atom<string | null>(null);