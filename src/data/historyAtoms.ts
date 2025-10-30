// src/data/historyAtoms.ts
import { atom } from 'jotai';
import { produce, Draft } from 'immer';
import { BoundData, LayoutComponent, FormComponent, CanvasComponent, AppearanceProperties, NormalizedCanvasComponents, DraggableComponent } from '../types';
import { canvasInteractionAtom, CanvasInteractionState, scrollRequestAtom } from './atoms';
import { createFormComponent, createLayoutComponent } from './componentFactory';

// 1. DEFINE THE CORE SHAPES
// NormalizedCanvasComponents is now imported from ../types

export interface UndoableState {
  formName: string;
  rootComponentId: string;
  components: NormalizedCanvasComponents;
}

interface ActionMeta {
  message: string;
  // FIX: Store the entire interaction state to allow for a perfect undo/redo.
  interactionState: CanvasInteractionState;
}

type HistoryData = {
  past: UndoableState[];
  present: UndoableState;
  future: UndoableState[];
};

// 2. DEFINE THE ACTION CONTRACT (REDUCER PATTERN)
export type HistoryAction =
  | { type: 'COMPONENT_ADD'; payload: { 
      componentType: 'layout' | 'widget' | 'field'; 
      name: string; // For layouts, this is the name. For form components, it's the initial label.
      origin?: 'data' | 'general'; 
      parentId: string; 
      index: number; 
      controlType?: FormComponent['properties']['controlType']; // NEW: Allow specifying control type
      controlTypeProps?: Partial<FormComponent['properties']>;
      bindingData?: { nodeId: string, nodeName: string, fieldId: string, path: string };
    } }
  // NEW: Bulk add action for Data Navigator
  | { type: 'COMPONENTS_ADD_BULK'; payload: { componentsToAdd: DraggableComponent[]; targetParentId: string; targetIndex?: number; } }
  | { type: 'COMPONENT_DELETE'; payload: { componentId: string } }
  | { type: 'COMPONENTS_DELETE_BULK'; payload: { componentIds: string[] } }
  | { type: 'COMPONENT_MOVE'; payload: { componentId: string; newParentId: string; oldParentId: string; newIndex: number; } }
  | { type: 'COMPONENT_REORDER'; payload: { componentId: string; parentId: string; oldIndex: number; newIndex: number; } }
  | { type: 'COMPONENTS_WRAP'; payload: { componentIds: string[]; parentId: string; } }
  | { type: 'COMPONENT_UNWRAP'; payload: { componentId: string; } } // NEW
  | { type: 'COMPONENT_CONVERT'; payload: { componentId: string; targetType: 'heading' | 'paragraph' | 'link' } }
  | { type: 'COMPONENT_UPDATE_BINDING'; payload: { componentId: string; newBinding: BoundData | null } }
  | { type: 'COMPONENT_UPDATE_PROPERTIES'; payload: { componentId: string; newProperties: Partial<Omit<LayoutComponent['properties'], 'appearance'>>; } }
  | { type: 'COMPONENT_UPDATE_APPEARANCE'; payload: { componentId: string; newAppearance: Partial<AppearanceProperties>; } }
  | { type: 'COMPONENT_UPDATE_CONTEXTUAL_LAYOUT'; payload: { componentId: string; newLayout: Partial<FormComponent['contextualLayout']> } }
  | { type: 'COMPONENT_UPDATE_FORM_PROPERTIES'; payload: { componentId: string; newProperties: Partial<FormComponent['properties']> } } // NEW
  | { type: 'FORM_RENAME'; payload: { newName: string } };

const defaultAppearance: AppearanceProperties = {
  type: 'transparent',
  bordered: false,
  padding: 'md',
};

// 3. CREATE THE CORE ATOMS
const historyAtom = atom<HistoryData>({
  past: [],
  present: {
    // Change the default screen name to 'My Screen'
    formName: "My Screen",
    rootComponentId: 'root',
    components: {
      'root': {
        id: 'root',
        parentId: '',
        name: 'Root',
        componentType: 'layout',
        children: [],
        properties: { 
          arrangement: 'stack', 
          gap: 'md', 
          distribution: 'start', 
          verticalAlign: 'stretch', 
          columnLayout: 'auto',
          appearance: { ...defaultAppearance }
        },
      }
    },
  },
  future: [],
});

export const actionMetaHistoryAtom = atom<{ past: ActionMeta[], future: ActionMeta[] }>({
  past: [],
  future: [],
});

const deleteComponentAndChildren = (
  components: Draft<NormalizedCanvasComponents>,
  componentId: string
) => {
  const componentToDelete = components[componentId];
  if (!componentToDelete) return;
  if (componentToDelete.componentType === 'layout' && componentToDelete.children) {
    [...componentToDelete.children].forEach(childId => {
      deleteComponentAndChildren(components, childId);
    });
  }
  const parent = components[componentToDelete.parentId];
  if (parent && parent.componentType === 'layout') {
    parent.children = parent.children.filter(id => id !== componentId);
  }
  delete components[componentId];
};

// 4. CREATE THE CENTRAL ACTION DISPATCHER (THE REDUCER)
export const commitActionAtom = atom(
  null,
  (get, set, action: { action: HistoryAction, message: string }) => {
    set(historyAtom, (currentHistory) => {
      const nextState = produce(currentHistory, (draft: Draft<HistoryData>) => {
        const presentState = draft.present;

        switch (action.action.type) {
          case 'COMPONENT_ADD': {
            const { componentType, parentId, index, ...rest } = action.action.payload;
            let newComponent: CanvasComponent;

            if (componentType === 'layout') {
              newComponent = createLayoutComponent(parentId, rest.name);
            } else {
              newComponent = createFormComponent({ parentId, ...rest });
            }
            
            presentState.components[newComponent.id] = newComponent;
            const parent = presentState.components[parentId];
            if (parent && parent.componentType === 'layout') {
              const childrenCountBefore = parent.children.length;
              parent.children.splice(index, 0, newComponent.id);
              // Check if component was added to the end of the root container to trigger auto-scroll
              if (parentId === presentState.rootComponentId && index === childrenCountBefore) {
                set(scrollRequestAtom, { componentId: newComponent.id });
              }
            }
            break;
          }
          case 'COMPONENTS_ADD_BULK': {
            const { componentsToAdd, targetParentId, targetIndex } = action.action.payload;
            const parent = presentState.components[targetParentId];
            if (!parent || parent.componentType !== 'layout') break;

            const newComponentIds: string[] = [];
            for (const comp of componentsToAdd) {
                const newComponent = createFormComponent({
                    parentId: targetParentId,
                    name: comp.name,
                    origin: 'data',
                    bindingData: comp.nodeId && comp.nodeName && comp.path ? {
                        nodeId: comp.nodeId,
                        nodeName: comp.nodeName,
                        fieldId: comp.id,
                        path: comp.path
                    } : undefined,
                });
                presentState.components[newComponent.id] = newComponent;
                newComponentIds.push(newComponent.id);
            }
            
            const finalIndex = targetIndex ?? parent.children.length;
            parent.children.splice(finalIndex, 0, ...newComponentIds);
            break;
          }
          case 'COMPONENT_DELETE': {
            const { componentId } = action.action.payload;
            deleteComponentAndChildren(presentState.components, componentId);
            break;
          }
          case 'COMPONENTS_DELETE_BULK': {
            const { componentIds } = action.action.payload;
            componentIds.forEach(id => {
              deleteComponentAndChildren(presentState.components, id);
            });
            break;
          }
          case 'COMPONENT_REORDER': {
            const { parentId, oldIndex, newIndex } = action.action.payload;
            const parent = presentState.components[parentId];
            if (parent && parent.componentType === 'layout') {
              const [moved] = parent.children.splice(oldIndex, 1);
              parent.children.splice(newIndex, 0, moved);
            }
            break;
          }
          case 'COMPONENT_MOVE': {
            const { componentId, oldParentId, newParentId, newIndex } = action.action.payload;
            const oldParent = presentState.components[oldParentId];
            if (oldParent && oldParent.componentType === 'layout') {
              oldParent.children = oldParent.children.filter(id => id !== componentId);
            }
            const newParent = presentState.components[newParentId];
            if (newParent && newParent.componentType === 'layout') {
              newParent.children.splice(newIndex, 0, componentId);
            }
            const component = presentState.components[componentId];
            if (component) {
              component.parentId = newParentId;
            }
            break;
          }
          case 'COMPONENTS_WRAP': {
            const { componentIds, parentId } = action.action.payload;
            const parent = presentState.components[parentId];
            if (!parent || parent.componentType !== 'layout') break;
            
            const newContainer = createLayoutComponent(parentId);
            newContainer.children = componentIds;

            presentState.components[newContainer.id] = newContainer;
            componentIds.forEach(id => {
              const child = presentState.components[id];
              if (child) child.parentId = newContainer.id;
            });
            const firstChildIndex = parent.children.indexOf(componentIds[0]);
            const remainingChildren = parent.children.filter(id => !componentIds.includes(id));
            remainingChildren.splice(firstChildIndex, 0, newContainer.id);
            parent.children = remainingChildren;
            break;
          }
          case 'COMPONENT_UNWRAP': { // NEW
            const { componentId } = action.action.payload;
            const container = presentState.components[componentId];
            if (!container || container.componentType !== 'layout') break;
            
            const parent = presentState.components[container.parentId];
            if (!parent || parent.componentType !== 'layout') break;

            const containerIndex = parent.children.indexOf(componentId);
            if (containerIndex === -1) break;

            // Re-parent children
            container.children.forEach(childId => {
              const child = presentState.components[childId];
              if (child) {
                child.parentId = parent.id;
              }
            });

            // Splice children into parent's children array
            parent.children.splice(containerIndex, 1, ...container.children);

            // Delete the container
            delete presentState.components[componentId];
            break;
          }
          case 'COMPONENT_CONVERT': {
            const { componentId, targetType } = action.action.payload;
            const component = presentState.components[componentId];
            if (!component || component.componentType === 'layout') break;

            if (targetType === 'heading') {
              component.properties.controlType = 'plain-text';
              component.properties.textElement = 'h2'; // Default to H2 when converting
              component.properties.href = undefined;
              component.properties.target = undefined;
            } else if (targetType === 'paragraph') {
              component.properties.controlType = 'plain-text';
              component.properties.textElement = 'p';
              component.properties.href = undefined;
              component.properties.target = undefined;
            } else if (targetType === 'link') {
              component.properties.controlType = 'link';
              component.properties.href = '#';
              component.properties.target = '_self';
              component.properties.textElement = undefined; // Clean up unused prop
            }
            break;
          }
          case 'COMPONENT_UPDATE_PROPERTIES': {
            const { componentId, newProperties } = action.action.payload;
            const component = presentState.components[componentId];
            if (component && component.componentType === 'layout') {
              // This ensures we don't accidentally wipe out the appearance object
              const { appearance, ...rest } = component.properties;
              component.properties = { ...rest, ...newProperties, appearance };
            }
            break;
          }
          case 'COMPONENT_UPDATE_APPEARANCE': {
            const { componentId, newAppearance } = action.action.payload;
            const component = presentState.components[componentId];
            if (component && component.componentType === 'layout') {
              component.properties.appearance = { 
                ...(component.properties.appearance || defaultAppearance), 
                ...newAppearance 
              };
            }
            break;
          }
          case 'COMPONENT_UPDATE_CONTEXTUAL_LAYOUT': {
            const { componentId, newLayout } = action.action.payload;
            const component = presentState.components[componentId];
            if (component) {
              component.contextualLayout = { ...component.contextualLayout, ...newLayout };
            }
            break;
          }
          case 'COMPONENT_UPDATE_BINDING': {
            const { componentId, newBinding } = action.action.payload;
            const component = presentState.components[componentId];
            if (component && (component.componentType === 'field' || component.componentType === 'widget')) {
                component.binding = newBinding;
            }
            break;
          }
          case 'COMPONENT_UPDATE_FORM_PROPERTIES': { // NEW
            const { componentId, newProperties } = action.action.payload;
            const component = presentState.components[componentId];
            if (component && (component.componentType === 'field' || component.componentType === 'widget')) {
              component.properties = { ...component.properties, ...newProperties };
            }
            break;
          }
          case 'FORM_RENAME': {
            presentState.formName = action.action.payload.newName;
            break;
          }
        }
        draft.past.push(currentHistory.present);
        draft.future = [];
      });
      return nextState;
    });
    // FIX: Get the interaction state from the correct source atom.
    const currentInteractionState = get(canvasInteractionAtom);
    const newMeta: ActionMeta = { message: action.message, interactionState: currentInteractionState };
    set(actionMetaHistoryAtom, (currentMetaHistory) => ({
      past: [...currentMetaHistory.past, newMeta],
      future: [],
    }));
  }
);

export const undoAtom = atom(null, (_get, set) => {
  set(historyAtom, (currentHistory) => {
    if (!currentHistory.past.length) return currentHistory;
    const newPresent = currentHistory.past[currentHistory.past.length - 1];
    const newPast = currentHistory.past.slice(0, -1);
    return {
      past: newPast,
      present: newPresent,
      future: [currentHistory.present, ...currentHistory.future],
    };
  });
  set(actionMetaHistoryAtom, (currentMetaHistory) => {
    if (!currentMetaHistory.past.length) return currentMetaHistory;
    const lastMeta = currentMetaHistory.past[currentMetaHistory.past.length - 1];
    const newPastMetas = currentMetaHistory.past.slice(0, -1);
    // FIX: Set the source atom, not the derived one, to restore the full interaction state.
    set(canvasInteractionAtom, lastMeta.interactionState);
    return {
      past: newPastMetas,
      future: [lastMeta, ...currentMetaHistory.future],
    };
  });
});

export const redoAtom = atom(null, (_get, set) => {
  set(historyAtom, (currentHistory) => {
    if (!currentHistory.future.length) return currentHistory;
    const newPresent = currentHistory.future[0];
    const newFuture = currentHistory.future.slice(1);
    return {
      past: [...currentHistory.past, currentHistory.present],
      present: newPresent,
      future: newFuture,
    };
  });
  set(actionMetaHistoryAtom, (currentMetaHistory) => {
    if (!currentMetaHistory.future.length) return currentMetaHistory;
    const nextMeta = currentMetaHistory.future[0];
    const newFutureMetas = currentMetaHistory.future.slice(1);
    // FIX: Set the source atom, not the derived one, to restore the full interaction state.
    set(canvasInteractionAtom, nextMeta.interactionState);
    return {
      past: [...currentMetaHistory.past, nextMeta],
      future: newFutureMetas,
    };
  });
});

// 5. CREATE DERIVED, READ-ONLY ATOMS FOR UI
export const undoableStateAtom = atom<UndoableState>((get) => get(historyAtom).present);
export const formNameAtom = atom<string>((get) => get(undoableStateAtom).formName);
export const canvasComponentsByIdAtom = atom<NormalizedCanvasComponents>((get) => get(undoableStateAtom).components);
export const rootComponentIdAtom = atom<string>((get) => get(undoableStateAtom).rootComponentId);
export const canUndoAtom = atom<boolean>((get) => get(historyAtom).past.length > 0);
export const canRedoAtom = atom<boolean>((get) => get(historyAtom).future.length > 0);