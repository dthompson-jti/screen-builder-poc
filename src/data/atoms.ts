// src/data/atoms.ts
import { atom } from 'jotai';
import { UniqueIdentifier, ClientRect } from '@dnd-kit/core';
import { componentListData } from './componentBrowserMock';
import { BoundData, ComponentGroup, DraggableComponent } from '../types';
import { rootComponentIdAtom } from './historyAtoms';

// =================================================================
//                         App State
// =================================================================
export type AppViewMode = 'editor' | 'preview' | 'settings';
export type ToolbarTabId = 'layout' | 'data' | 'general' | 'templates' | 'conditions' | 'layers';
export type SettingsLayoutMode = 'single-column' | 'two-column';
export type ScreenType = 'case-init' | 'insert' | 'update' | 'search' | 'folder-view' | 'header-screen';

export const appViewModeAtom = atom<AppViewMode>('editor');
export const isSettingsMenuOpenAtom = atom(false);
export const isShowBreadcrumbAtom = atom(true);
export const activeToolbarTabAtom = atom<ToolbarTabId>('data');
export const isComponentBrowserVisibleAtom = atom(false);
export const isPropertiesPanelVisibleAtom = atom(true);

// =================================================================
//                         View Preferences
// =================================================================
export const isToolbarCompactAtom = atom(false);

// =================================================================
//                         Settings State
// =================================================================
export const isFormNameEditingAtom = atom(false);
export const isFormNameMenuOpenAtom = atom(false);
export const settingsLayoutModeAtom = atom<SettingsLayoutMode>('single-column');
export const focusIntentAtom = atom<string | null>(null);
export const screenTypeAtom = atom<ScreenType>('case-init');
export const isScreenTypePopoverOpenAtom = atom(false);
export const isApiEnabledAtom = atom(true);
export const isReadOnlyAtom = atom(true);


// =================================================================
//                         Canvas State
// =================================================================

export type CanvasInteractionState =
  | { mode: 'idle' }
  | { mode: 'selecting'; ids: string[] }
  | { mode: 'editing'; id: string };

export const canvasInteractionAtom = atom<CanvasInteractionState>({ mode: 'idle' });

export const selectionAnchorIdAtom = atom<string | null>(null);

// --- Context Menu State ---
export const contextMenuTargetIdAtom = atom<string | null>(null);
// FIX: Re-add the necessary atoms for the "keyed portal" architecture.
export const isContextMenuOpenAtom = atom(false); 
export const contextMenuInstanceKeyAtom = atom(0);

// A write-only "action" atom to safely handle selection changes when a context menu is triggered.
export const updateSelectionOnContextMenuAtom = atom(
  null,
  (get, set) => {
    const targetId = get(contextMenuTargetIdAtom);
    if (!targetId) return;

    const currentInteraction = get(canvasInteractionAtom);
    const selectedIds = (currentInteraction.mode === 'selecting' ? currentInteraction.ids : (currentInteraction.mode === 'editing' ? [currentInteraction.id] : []));
        
    const isTargetAlreadySelected = selectedIds.includes(targetId);
    if (!isTargetAlreadySelected) {
      set(canvasInteractionAtom, { mode: 'selecting', ids: [targetId] });
      set(selectionAnchorIdAtom, targetId);
    }
  }
);
// --- End Context Menu State ---


export const selectedCanvasComponentIdsAtom = atom<string[]>((get) => {
  const state = get(canvasInteractionAtom);
  if (state.mode === 'selecting') return state.ids;
  if (state.mode === 'editing') return [state.id];
  return [];
});

export const activelyEditingComponentIdAtom = atom<string | null>((get) => {
  const state = get(canvasInteractionAtom);
  return state.mode === 'editing' ? state.id : null;
});

// --- User Flow Atom ---
export const startEditingOnEmptyCanvasAtom = atom(null, (get, set) => {
  const rootId = get(rootComponentIdAtom);
  set(canvasInteractionAtom, { mode: 'selecting', ids: [rootId] });
  set(isPropertiesPanelVisibleAtom, true);
  set(activeToolbarTabAtom, 'data');
  set(isComponentBrowserVisibleAtom, true);
});


// Atoms to track the global state of a drag-and-drop operation.
export const activeDndIdAtom = atom<UniqueIdentifier | null>(null);
export const overDndIdAtom = atom<UniqueIdentifier | null>(null);

export const dropPlaceholderAtom = atom<{ parentId: string; index: number; viewportRect: ClientRect | null; isGrid: boolean; } | null>(null);

// Atom to signal a scroll-to-component request
export const scrollRequestAtom = atom<null | { componentId: string }>(null);


// =================================================================
//                     Component Browser State
// =================================================================
export const selectedNodeIdAtom = atom<string>('arrest');

export const availableComponentGroupsAtom = atom<ComponentGroup[]>((get) => {
  const selectedId = get(selectedNodeIdAtom);
  return componentListData[selectedId] || [];
});

export const componentSearchQueryAtom = atom('');

export const filteredComponentGroupsAtom = atom((get) => {
  const query = get(componentSearchQueryAtom).toLowerCase().trim();
  const allGroups = get(availableComponentGroupsAtom);

  if (!query) {
    return allGroups;
  }

  return allGroups
    .map(group => ({
      ...group,
      components: group.components.filter((component: DraggableComponent) =>
        component.name.toLowerCase().includes(query)
      ),
    }))
    .filter(group => group.components.length > 0);
});


// =================================================================
//                     Data Binding Modal State
// =================================================================
interface DataBindingRequest {
  componentId: string;
  currentBinding: BoundData | null | undefined;
}

export const dataBindingRequestAtom = atom<DataBindingRequest | null>(null);

export const isDataBindingModalOpenAtom = atom<boolean>(
  (get) => get(dataBindingRequestAtom) !== null
);

interface DataBindingResult {
  componentId: string;
  newBinding: BoundData | null;
}

export const dataBindingResultAtom = atom<DataBindingResult | null>(null);

// =================================================================
//                         Preview Mode State
// =================================================================
export const isPreviewFluidAtom = atom(false);
export const previewWidthAtom = atom<number>(1280); // Default to desktop preset width