// src/component-browser/mockComponentTreen.ts

// --- HIERARCHY & INTERFACES ---

// Base definition of the tree structure
const componentTreeBase = [
  { id: 'case', name: 'Case' },
  { id: 'subcase', name: 'Subcase' },
  { id: 'arrest', name: 'Arrest' },
  { id: 'victim', name: 'Victim' },
  { id: 'arrest-charges', name: 'Arrest Charges' },
  { id: 'officer', name: 'Officer' },
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
  collectionFields: collections.map(n => createComponent(n, 'field', 'window', '#008B8B')), // Using a distinct icon/color for collections
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
// Helper function to build component groups, now including collections
const buildComponentGroups = (data: any): ComponentGroup[] => {
    const groups: ComponentGroup[] = [
        { title: 'Plain Fields', components: data.plainFields },
        { title: 'Entity Fields', components: data.entityFields }
    ];
    if (data.collectionFields && data.collectionFields.length > 0) {
        groups.push({ title: 'Collection Fields', components: data.collectionFields });
    }
    groups.push(
        { title: 'Widgets', components: data.widgets },
        { title: 'Transient Plain Fields', components: data.transientPlainFields },
        { title: 'Transient Entity Fields', components: data.transientEntityFields }
    );
    return groups;
};


export const componentListData: Record<string, ComponentGroup[]> = {
  'case': buildComponentGroups(caseData),
  'subcase': buildComponentGroups(subcaseData),
  'arrest': buildComponentGroups(arrestData),
  'victim': buildComponentGroups(victimData),
  'arrest-charges': buildComponentGroups(arrestChargesData),
  'officer': buildComponentGroups(officerData),
};

export const connectionsDropdownData: Record<string, DropdownCategory> = {
  'case': { entities: [{id: 'subcase', name: 'Subcase', isNavigable: true}, {id: 'case-party', name: 'Case Party'}], collections: [{id: 'case-charges', name: 'Case Charges'}], transients: [{id: 'case-status', name: 'Case Status'}, {id: 'case-history', name: 'Case History'}] },
  'subcase': { entities: [{id: 'arrest', name: 'Arrest', isNavigable: true}, {id: 'subcase-party', name: 'Subcase Party'}], collections: [{id: 'subcase-documents', name: 'Subcase Documents'}], transients: [{id: 'subcase-status', name: 'Subcase Status'}] },
  'arrest': { entities: [{id: 'victim', name: 'Victim', isNavigable: true}, ...arrestData.entityFields.filter(e => e.name !== 'Victim').map(e => ({id: e.id, name: e.name}))], collections: [{id: 'arrest-charges', name: 'Arrest Charges'}], transients: [...arrestData.transientPlainFields.slice(0,4).map(e => ({id: e.id, name: e.name})), ...arrestData.transientEntityFields.slice(0,4).map(e => ({id: e.id, name: e.name}))] },
  'victim': { entities: [{id: 'arrest-charges', name: 'Arrest Charges', isNavigable: true}, {id: 'associated-party', name: 'Associated Party'}], collections: [{id: 'victim-statements', name: 'Victim Statements'}], transients: [{id: 'victim-status', name: 'Victim Status'}] },
  'arrest-charges': { entities: [{id: 'officer', name: 'Officer', isNavigable: true}, {id: 'plea-bargain', name: 'Plea Bargain'}], collections: [{id: 'court-filings', name: 'Court Filings'}], transients: [{id: 'charge-status', name: 'Charge Status'}] },
  'officer': { entities: [{id: 'assisting-officer', name: 'Assisting Officer'}], collections: [{id: 'officer-reports', name: 'Officer Reports'}], transients: [{id: 'officer-status', name: 'Officer Status'}] },
};

// FIX: Dynamically generate componentTreeData with accurate connection counts
export const componentTreeData = componentTreeBase.map(node => {
  const connections = connectionsDropdownData[node.id];
  const count = connections
    ? connections.entities.length + connections.collections.length + connections.transients.length
    : 0;
  return { ...node, connections: count };
});