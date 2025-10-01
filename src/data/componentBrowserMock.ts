// src/data/componentBrowserMock.ts
import { DraggableComponent, ComponentGroup, DropdownItem, ComponentNode } from '../types';

// --- HIERARCHY & INTERFACES ---

const componentTreeBase = [
  { id: 'case', name: 'Case' },
  { id: 'subcase', name: 'Subcase' },
  { id: 'arrest', name: 'Arrest' },
  { id: 'victim', name: 'Victim' },
  { id: 'arrest-charges', name: 'Arrest Charges' },
  { id: 'officer', name: 'Officer' },
];

interface NodeData {
  list: ComponentGroup[];
  dropdown: {
    entities: DropdownItem[];
    collections: DropdownItem[];
    transientEntityFields: DropdownItem[];
  };
}

// --- DATA HELPERS ---

const createId = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

// Helper to create a draggable component for the main list
const createListComponent = (
  name: string,
  type: 'widget' | 'field',
  icon: string,
  node: { id: string, name: string },
  iconColor?: string
): DraggableComponent => ({
  id: createId(name),
  name,
  type,
  icon,
  iconColor,
  nodeId: node.id,
  nodeName: node.name,
  path: `${node.name} > ${name}`,
});

// Helper to create a dropdown item for the "View Related" popover
const createDropdownItem = (name: string, isNavigable = false): DropdownItem => ({
  id: createId(name),
  name,
  isNavigable,
});


// =================================================================
//                         SOURCE DATA
// =================================================================

// -----------------------------------------------------------------
//                           ARREST NODE
// -----------------------------------------------------------------
const arrestNode = { id: 'arrest', name: 'Arrest' };
const arrestFullData: NodeData = {
  list: [
    {
      title: 'Plain Fields',
      components: [
        'Id (PK)', 'Access Level', 'Arrest Date', 'Arrest Time', 'Arrest Type', 'Arresting Agency File Number', 'Booking Number', 'Create User Real Name', 'Create Username', 'Date Created', 'Exchange Id', 'Last Update User Real Name', 'Last Update Username', 'Last Updated', 'Location', 'Memo', 'Roa Access Level', 'Source Case Number', 'Status Date', 'Update Reason'
      ].map(name => createListComponent(name, 'field', 'database', arrestNode))
    },
    {
      title: 'Widgets',
      components: [
        'AddCaseSpecialStatusWidget', 'AddJudgeNoteIcon', 'AddNoteIcon', 'AddPartySpecialStatusWidget', 'AddToRelatedCases', 'CaseDisp', 'CaseEMailIcon', 'CaseLabelWidget', 'ClipboardWidget', 'CustomSearchWidget', 'DateCalculator', 'DaysOfWeekWidget', 'DocAddWidget', 'DocumentCrossReferenceWidget', 'DuplicateHighlighterWidget', 'EntityPagingWidget', 'ExternalSystemSearchWidget', 'FeePayment', 'GeneralFee', 'GenerateDocument', 'GenericDownload', 'GenericLookup', 'LookupItemCategoryWidget', 'ModalWidget', 'NoteIcon', 'ObjectAssociationWidget', 'OpenPersonViewWidget', 'PagePrintIcon', 'PanelTotalWidget', 'PartyCrossReferenceWidget', 'PortalKioskPrintRequest', 'QuestionnaireResponseWidget', 'QuickScheduleEvent', 'RelateCasesByPartyWidget', 'RelatedPeerCasesWidget', 'ReservedToScheduledWidget', 'SSRSWidget', 'ScheduleEvent', 'StaticTextWidget', 'TotalWidget', 'UpdateRecordsOnRelatedCases', 'UserNameSearchWidget', 'VacateFutureEventsWidget', 'WorkflowTasks', 'sendEmailWidget', 'sendSmsWidget'
      ].map(name => createListComponent(name, 'widget', 'widgets', arrestNode, 'var(--surface-fg-warning-primary)'))
    },
    {
      title: 'Transient Plain Fields',
      components: [
        'Access Context Mock', 'Access Level Label', 'Access Level Value', 'Audit Values', 'Case Category', 'Case Id', 'Case Status', 'Case Type', 'Created And Last Updated Label', 'Created And Last Updated User And Date Label', 'Created Name', 'Cross Referenced', 'Current Values', 'Description', 'Entity And Id', 'Entity Display Name', 'Entity Id And Title', 'Entity Name', 'Entity Name And Id', 'Entity Short Name', 'Entity Short Name And Id', 'Entity Underscore Id', 'Id And Entity Name', 'Id And Title', 'Inaccessible', 'Last Modified Or Created', 'Last Modified Or Created Date', 'Last Modified Or Created Username', 'Last Updated Name', 'Number Of Parents', 'Person Id', 'Plain Field Values', 'Plain Fields Only', 'RBCInaccessible', 'Related Peer Ids', 'Revision Objects', 'Roa Changes', 'Title', 'Title With Non Case Parent Titles', 'Update Reason Label', 'Xrefs'
      ].map(name => createListComponent(`${name} (transient)`, 'field', 'database', arrestNode, 'var(--surface-fg-tertiary)'))
    }
  ],
  dropdown: {
    entities: [
      createDropdownItem('Victim', true),
      createDropdownItem('Arresting Agency'),
      createDropdownItem('Associated Party'),
      createDropdownItem('Booking Agency'),
      createDropdownItem('Officer', true)
    ],
    collections: [
      createDropdownItem('Arrest Charges', true)
    ],
    transientEntityFields: [
      'Access Context', 'Case', 'Closed Work Queues', 'Consolidation Peers', 'Cross Referenced Case Assignments', 'Cross Referenced Documents', 'Cross Referenced Parties', 'Cross Referenced Scheduled Events', 'Current Version', 'Entity', 'Left Cross Referenced Documents', 'Left Cross Referenced Parties', 'Left Cross Referenced Scheduled Events', 'Open Work Queues', 'Parent', 'Previous Version', 'Previous Versions', 'Previous Versions No Tx', 'Related Case Notes', 'Related Judge Notes', 'Related Peer Case Numbers', 'Related Peers', 'Related Roa Messages', 'Related Time Standards', 'Revision Bean Results', 'Right Cross Referenced Documents', 'Right Cross Referenced Parties', 'Right Cross Referenced Scheduled Events', 'Sub Case', 'Sub Case Or Case', 'Work Queues', 'Workflow Tasks'
    ].map(name => createDropdownItem(`${name} (transient)`))
  }
};

// -----------------------------------------------------------------
//                     OTHER SIMPLIFIED NODES
// -----------------------------------------------------------------

const createSimplifiedNodeData = (node: {id: string, name: string}, relations: {entities: DropdownItem[], collections: DropdownItem[]}): NodeData => ({
  list: [
    { title: 'Plain Fields', components: [`${node.name} ID (PK)`, `${node.name} Date`, `${node.name} Status`].map(n => createListComponent(n, 'field', 'database', node))},
    { title: 'Widgets', components: [`${node.name} Widget 1`, `GenerateDocument`].map(n => createListComponent(n, 'widget', 'widgets', node, 'var(--surface-fg-warning-primary)')) },
    { title: 'Transient Plain Fields', components: [`${node.name} Category (transient)`, `${node.name} Type (transient)`].map(n => createListComponent(n, 'field', 'database', node, 'var(--surface-fg-tertiary)'))}
  ],
  dropdown: {
    entities: relations.entities,
    collections: relations.collections,
    transientEntityFields: [`${node.name} Related Notes (transient)`, `${node.name} History (transient)`].map(n => createDropdownItem(n))
  }
});

const caseNode = { id: 'case', name: 'Case' };
const caseData = createSimplifiedNodeData(caseNode, {
  entities: [createDropdownItem('Subcase', true), createDropdownItem('Case Party')],
  collections: [createDropdownItem('Case Charges')]
});

const subcaseNode = { id: 'subcase', name: 'Subcase' };
const subcaseData = createSimplifiedNodeData(subcaseNode, {
  entities: [createDropdownItem('Arrest', true), createDropdownItem('Subcase Party')],
  collections: [createDropdownItem('Subcase Documents')]
});

const victimNode = { id: 'victim', name: 'Victim' };
const victimData = createSimplifiedNodeData(victimNode, {
  entities: [createDropdownItem('Associated Party')],
  collections: [createDropdownItem('Victim Statements'), createDropdownItem('Arrest Charges', true)]
});

const arrestChargesNode = { id: 'arrest-charges', name: 'Arrest Charges' };
const arrestChargesData = createSimplifiedNodeData(arrestChargesNode, {
  entities: [createDropdownItem('Officer', true), createDropdownItem('Plea Bargain')],
  collections: [createDropdownItem('Court Filings')]
});

const officerNode = { id: 'officer', name: 'Officer' };
const officerData = createSimplifiedNodeData(officerNode, {
  entities: [createDropdownItem('Assisting Officer')],
  collections: [createDropdownItem('Officer Reports')]
});

// =================================================================
//                         FINAL EXPORTS
// =================================================================

// Export 1: Data for the "Data fields" component list
export const componentListData: Record<string, ComponentGroup[]> = {
  'case': caseData.list,
  'subcase': subcaseData.list,
  'arrest': arrestFullData.list,
  'victim': victimData.list,
  'arrest-charges': arrestChargesData.list,
  'officer': officerData.list,
};

// Export 2: Data for the "View Related" dropdown
export const connectionsDropdownData: Record<string, NodeData['dropdown']> = {
  'case': caseData.dropdown,
  'subcase': subcaseData.dropdown,
  'arrest': arrestFullData.dropdown,
  'victim': victimData.dropdown,
  'arrest-charges': arrestChargesData.dropdown,
  'officer': officerData.dropdown,
};

// Export 3: Data for the navigator tree itself, with connection counts
export const componentTreeData: ComponentNode[] = componentTreeBase.map(node => {
  const connections = connectionsDropdownData[node.id];
  const count = connections
    ? connections.entities.length + connections.collections.length + connections.transientEntityFields.length
    : 0;
  return { ...node, connections: count };
});