// src/data/historyAtoms.ts
import { atom } from 'jotai';
import { arrayMove } from '@dnd-kit/sortable';
import { FormComponent, BoundData } from '../types';
import { selectedCanvasComponentIdAtom } from './atoms';

// 1. DEFINE THE CORE SHAPES
export interface UndoableState {
  formName: string;
  canvasComponents: FormComponent[];
}

interface ActionMeta {
  message: string;
  selectedId: string | null;
}

type HistoryData = {
  past: UndoableState[];
  present: UndoableState;
  future: UndoableState[];
};

// 2. DEFINE THE ACTION CONTRACT (REDUCER PATTERN)
export type HistoryAction =
  | { type: 'COMPONENT_ADD'; payload: { component: FormComponent; index?: number } }
  | { type: 'COMPONENT_DELETE'; payload: { componentId: string } }
  | { type: 'COMPONENT_REORDER'; payload: { oldIndex: number; newIndex: number } }
  | { type: 'COMPONENT_UPDATE_BINDING'; payload: { componentId: string; newBinding: BoundData | null } }
  | { type: 'FORM_RENAME'; payload: { newName: string } };

// 3. CREATE THE CORE ATOMS
const historyAtom = atom<HistoryData>({
  past: [],
  present: {
    formName: "Dave's Form",
    canvasComponents: [],
  },
  future: [],
});

export const actionMetaHistoryAtom = atom<{ past: ActionMeta[], future: ActionMeta[] }>({
  past: [],
  future: [],
});

// 4. CREATE THE CENTRAL ACTION DISPATCHER (THE REDUCER)
export const commitActionAtom = atom(
  null,
  (get, set, action: { action: HistoryAction, message: string }) => {
    set(historyAtom, (currentHistory) => {
      const presentState = currentHistory.present;
      let newPresent: UndoableState;

      // Reducer logic to calculate the next state based on the action
      switch (action.action.type) {
        case 'COMPONENT_ADD': {
          const { component, index } = action.action.payload;
          const newComponents = [...presentState.canvasComponents];
          const finalIndex = (index === undefined || index < 0) ? newComponents.length : index;
          newComponents.splice(finalIndex, 0, component);
          newPresent = { ...presentState, canvasComponents: newComponents };
          break;
        }
        case 'COMPONENT_DELETE': {
          const { componentId } = action.action.payload;
          const newComponents = presentState.canvasComponents.filter(c => c.id !== componentId);
          newPresent = { ...presentState, canvasComponents: newComponents };
          break;
        }
        case 'COMPONENT_REORDER': {
          const { oldIndex, newIndex } = action.action.payload;
          const reordered = arrayMove(presentState.canvasComponents, oldIndex, newIndex);
          newPresent = { ...presentState, canvasComponents: reordered };
          break;
        }
        case 'COMPONENT_UPDATE_BINDING': {
          const { componentId, newBinding } = action.action.payload;
          const newComponents = presentState.canvasComponents.map(c =>
            c.id === componentId ? { ...c, binding: newBinding } : c
          );
          newPresent = { ...presentState, canvasComponents: newComponents };
          break;
        }
        case 'FORM_RENAME': {
          const { newName } = action.action.payload;
          newPresent = { ...presentState, formName: newName };
          break;
        }
        default:
          return currentHistory; // No change
      }

      return {
        past: [...currentHistory.past, presentState],
        present: newPresent,
        future: [],
      };
    });

    // Metadata update remains separate
    const currentSelectedId = get(selectedCanvasComponentIdAtom);
    const newMeta: ActionMeta = { message: action.message, selectedId: currentSelectedId };
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
    const previousSelectedId = newPastMetas.length > 0 ? newPastMetas[newPastMetas.length - 1].selectedId : null;
    set(selectedCanvasComponentIdAtom, previousSelectedId);
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
    set(selectedCanvasComponentIdAtom, nextMeta.selectedId);
    return {
      past: [...currentMetaHistory.past, nextMeta],
      future: newFutureMetas,
    };
  });
});

// 5. CREATE DERIVED, READ-ONLY ATOMS FOR UI
export const undoableStateAtom = atom<UndoableState>((get) => get(historyAtom).present);
export const formNameAtom = atom<string>((get) => get(undoableStateAtom).formName);
export const canvasComponentsAtom = atom<FormComponent[]>((get) => get(undoableStateAtom).canvasComponents);

export const canUndoAtom = atom<boolean>((get) => get(historyAtom).past.length > 0);
export const canRedoAtom = atom<boolean>((get) => get(historyAtom).future.length > 0);