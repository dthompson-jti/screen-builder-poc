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

// =================================================================
//                 ICON & COLOR CONFIGURATION (OKLCH)
// =================================================================
const ICONS = {
  PLAIN_FIELD: { icon: 'short_text', color: 'oklch(0.65 0 0)' }, 
  WIDGET: { icon: 'widgets', color: 'oklch(0.65 0.15 100)' },
  TRANSIENT_PLAIN_FIELD: { icon: 'short_text', color: 'oklch(0.65 0.15 160)' },
  ENTITY: { icon: 'grid_on', color: 'oklch(0.65 0.15 260)' },
  COLLECTION: { icon: 'table_rows', color: 'oklch(0.65 0.15 300)' },
  TRANSIENT_ENTITY_FIELD: { icon: 'variables', color: 'oklch(0.65 0.15 140)' },
};
// =================================================================

// --- DATA HELPERS ---

const createId = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

const createListComponent = (
  name: string,
  type: 'widget' | 'field',
  category: keyof typeof ICONS,
  node: { id: string, name: string },
  pathPrefix: string = ''
): DraggableComponent => ({
  id: createId(`${node.name}-${name}`),
  name,
  type,
  icon: ICONS[category].icon,
  iconColor: ICONS[category].color,
  nodeId: node.id,
  nodeName: node.name,
  path: pathPrefix ? `${pathPrefix} > ${node.name} > ${name}` : `${node.name} > ${name}`,
});

const createDropdownItem = (
  name: string,
  category: keyof typeof ICONS,
  isNavigable = false
): DropdownItem => ({
  id: createId(name),
  name,
  isNavigable,
  icon: ICONS[category].icon,
  iconColor: ICONS[category].color,
});


// =================================================================
//                         SOURCE DATA
// =================================================================

// -----------------------------------------------------------------
//                           ARREST NODE
// -----------------------------------------------------------------
const arrestNode = { id: 'arrest', name: 'Arrest' };
const arrestPathPrefix = 'Case > Subcase';
const arrestFullData: NodeData = {
  list: [
    {
      title: 'Plain Fields',
      components: [
        'Id (PK)', 'Access Level', 'Arrest Date', 'Arrest Time', 'Arrest Type', 'Arresting Agency File Number', 'Booking Number', 'Create User Real Name', 'Create Username', 'Date Created', 'Exchange Id', 'Last Update User Real Name', 'Last Update Username', 'Last Updated', 'Location', 'Memo', 'Roa Access Level', 'Source Case Number', 'Status Date', 'Update Reason'
      ].map(name => createListComponent(name, 'field', 'PLAIN_FIELD', arrestNode, arrestPathPrefix))
    },
    {
      title: 'Widgets',
      components: [
        'AddCaseSpecialStatusWidget', 'AddJudgeNoteIcon', 'AddNoteIcon', 'AddPartySpecialStatusWidget', 'AddToRelatedCases', 'CaseDisp', 'CaseEMailIcon', 'CaseLabelWidget', 'ClipboardWidget', 'CustomSearchWidget', 'DateCalculator', 'DaysOfWeekWidget', 'DocAddWidget', 'DocumentCrossReferenceWidget', 'DuplicateHighlighterWidget', 'EntityPagingWidget', 'ExternalSystemSearchWidget', 'FeePayment', 'GeneralFee', 'GenerateDocument', 'GenericDownload', 'GenericLookup', 'LookupItemCategoryWidget', 'ModalWidget', 'NoteIcon', 'ObjectAssociationWidget', 'OpenPersonViewWidget', 'PagePrintIcon', 'PanelTotalWidget', 'PartyCrossReferenceWidget', 'PortalKioskPrintRequest', 'QuestionnaireResponseWidget', 'QuickScheduleEvent', 'RelateCasesByPartyWidget', 'RelatedPeerCasesWidget', 'ReservedToScheduledWidget', 'SSRSWidget', 'ScheduleEvent', 'StaticTextWidget', 'TotalWidget', 'UpdateRecordsOnRelatedCases', 'UserNameSearchWidget', 'VacateFutureEventsWidget', 'WorkflowTasks', 'sendEmailWidget', 'sendSmsWidget'
      ].map(name => createListComponent(name, 'widget', 'WIDGET', arrestNode, arrestPathPrefix))
    },
    {
      title: 'Transient Plain Fields',
      components: [
        'Access Context Mock', 'Access Level Label', 'Access Level Value', 'Audit Values', 'Case Category', 'Case Id', 'Case Status', 'Case Type', 'Created And Last Updated Label', 'Created And Last Updated User And Date Label', 'Created Name', 'Cross Referenced', 'Current Values', 'Description', 'Entity And Id', 'Entity Display Name', 'Entity Id And Title', 'Entity Name', 'Entity Name And Id', 'Entity Short Name', 'Entity Short Name And Id', 'Entity Underscore Id', 'Id And Entity Name', 'Id And Title', 'Inaccessible', 'Last Modified Or Created', 'Last Modified Or Created Date', 'Last Modified Or Created Username', 'Last Updated Name', 'Number Of Parents', 'Person Id', 'Plain Field Values', 'Plain Fields Only', 'RBCInaccessible', 'Related Peer Ids', 'Revision Objects', 'Roa Changes', 'Title', 'Title With Non Case Parent Titles', 'Update Reason Label', 'Xrefs'
      ].map(name => createListComponent(`${name} (transient)`, 'field', 'TRANSIENT_PLAIN_FIELD', arrestNode, arrestPathPrefix))
    }
  ],
  dropdown: {
    entities: [
      createDropdownItem('Victim', 'ENTITY', true),
      createDropdownItem('Arresting Agency', 'ENTITY'),
      createDropdownItem('Associated Party', 'ENTITY'),
      createDropdownItem('Booking Agency', 'ENTITY'),
      createDropdownItem('Officer', 'ENTITY', true)
    ],
    collections: [
      createDropdownItem('Arrest Charges', 'COLLECTION', true)
    ],
    transientEntityFields: [
      'Access Context', 'Case', 'Closed Work Queues', 'Consolidation Peers', 'Cross Referenced Case Assignments', 'Cross Referenced Documents', 'Cross Referenced Parties', 'Cross Referenced Scheduled Events', 'Current Version', 'Entity', 'Left Cross Referenced Documents', 'Left Cross Referenced Parties', 'Left Cross Referenced Scheduled Events', 'Open Work Queues', 'Parent', 'Previous Version', 'Previous Versions', 'Previous Versions No Tx', 'Related Case Notes', 'Related Judge Notes', 'Related Peer Case Numbers', 'Related Peers', 'Related Roa Messages', 'Related Time Standards', 'Revision Bean Results', 'Right Cross Referenced Documents', 'Right Cross Referenced Parties', 'Right Cross Referenced Scheduled Events', 'Sub Case', 'Sub Case Or Case', 'Work Queues', 'Workflow Tasks'
    ].map(name => createDropdownItem(`${name} (transient)`, 'TRANSIENT_ENTITY_FIELD'))
  }
};

// -----------------------------------------------------------------
//                     OTHER SIMPLIFIED NODES
// -----------------------------------------------------------------

const createSimplifiedNodeData = (node: {id: string, name: string}, pathPrefix: string, relations: {entities: string[], collections: string[]}, nav: Record<string, boolean>): NodeData => ({
  list: [
    { title: 'Plain Fields', components: [`${node.name} ID (PK)`, `${node.name} Date`, `${node.name} Status`].map(n => createListComponent(n, 'field', 'PLAIN_FIELD', node, pathPrefix))},
    { title: 'Widgets', components: [`${node.name} Widget 1`, `GenerateDocument`].map(n => createListComponent(n, 'widget', 'WIDGET', node, pathPrefix)) },
    { title: 'Transient Plain Fields', components: [`${node.name} Category (transient)`, `${node.name} Type (transient)`].map(n => createListComponent(n, 'field', 'TRANSIENT_PLAIN_FIELD', node, pathPrefix))}
  ],
  dropdown: {
    entities: relations.entities.map(name => createDropdownItem(name, 'ENTITY', !!nav[name])),
    collections: relations.collections.map(name => createDropdownItem(name, 'COLLECTION', !!nav[name])),
    transientEntityFields: [`${node.name} Related Notes (transient)`, `${node.name} History (transient)`].map(n => createDropdownItem(n, 'TRANSIENT_ENTITY_FIELD'))
  }
});

const caseNode = { id: 'case', name: 'Case' };
const caseData = createSimplifiedNodeData(caseNode, '', {
  entities: ['Subcase', 'Case Party'],
  collections: ['Case Charges']
}, { 'Subcase': true });

const subcaseNode = { id: 'subcase', name: 'Subcase' };
const subcaseData = createSimplifiedNodeData(subcaseNode, 'Case', {
  entities: ['Arrest', 'Subcase Party'],
  collections: ['Subcase Documents']
}, { 'Arrest': true });

const victimNode = { id: 'victim', name: 'Victim' };
const victimData = createSimplifiedNodeData(victimNode, 'Case > Arrest', {
  entities: ['Associated Party'],
  collections: ['Victim Statements', 'Arrest Charges']
}, { 'Arrest Charges': true });

const arrestChargesNode = { id: 'arrest-charges', name: 'Arrest Charges' };
const arrestChargesData = createSimplifiedNodeData(arrestChargesNode, 'Case > Arrest', {
  entities: ['Officer', 'Plea Bargain'],
  collections: ['Court Filings']
}, { 'Officer': true });

const officerNode = { id: 'officer', name: 'Officer' };
const officerData = createSimplifiedNodeData(officerNode, 'Case > Arrest', {
  entities: ['Assisting Officer'],
  collections: ['Officer Reports']
}, {});

// =================================================================
//                         FINAL EXPORTS
// =================================================================

export const componentListData: Record<string, ComponentGroup[]> = {
  'case': caseData.list,
  'subcase': subcaseData.list,
  'arrest': arrestFullData.list,
  'victim': victimData.list,
  'arrest-charges': arrestChargesData.list,
  'officer': officerData.list,
};

export const connectionsDropdownData: Record<string, NodeData['dropdown']> = {
  'case': caseData.dropdown,
  'subcase': subcaseData.dropdown,
  'arrest': arrestFullData.dropdown,
  'victim': victimData.dropdown,
  'arrest-charges': arrestChargesData.dropdown,
  'officer': officerData.dropdown,
};

export const componentTreeData: ComponentNode[] = componentTreeBase.map(node => {
  const connections = connectionsDropdownData[node.id];
  const count = connections
    ? connections.entities.length + connections.collections.length + connections.transientEntityFields.length
    : 0;
  return { ...node, connections: count };
});