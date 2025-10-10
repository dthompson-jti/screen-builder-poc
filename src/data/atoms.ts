// src/data/atoms.ts
import { atom } from 'jotai';
import { UniqueIdentifier, ClientRect } from '@dnd-kit/core';
import { componentListData } from './componentBrowserMock';
import { BoundData, ComponentGroup, DraggableComponent } from '../types';

// =================================================================
//                         App State
// =================================================================
export type AppViewMode = 'editor' | 'preview' | 'settings';
export type ToolbarTabId = 'layout' | 'data' | 'general' | 'templates' | 'conditions' | 'layers';
export type SettingsLayoutMode = 'single-column' | 'two-column';
export type ScreenType = 'case-init' | 'insert' | 'update' | 'search' | 'folder-view' | 'header-screen';

export const appViewModeAtom = atom<AppViewMode>('editor');
export const isMenuOpenAtom = atom(false);
export const isSettingsMenuOpenAtom = atom(false);
export const isToolbarCompactAtom = atom(false);
export const isShowBreadcrumbAtom = atom(false);
export const activeToolbarTabAtom = atom<ToolbarTabId>('data');
export const isComponentBrowserVisibleAtom = atom(false);
export const isPropertiesPanelVisibleAtom = atom(true);

// =================================================================
//                         Settings State
// =================================================================
// NOTE: formNameAtom is now managed in historyAtoms.ts
export const isNameEditorPopoverOpenAtom = atom(false);
export const settingsLayoutModeAtom = atom<SettingsLayoutMode>('single-column');
export const focusIntentAtom = atom<string | null>(null);
export const screenTypeAtom = atom<ScreenType>('case-init');
export const isScreenTypePopoverOpenAtom = atom(false);


// =================================================================
//                         Canvas State
// =================================================================
// NOTE: canvasComponentsAtom is now managed in historyAtoms.ts

// The selected component ID is now an array to support multi-select.
// The first ID in the array is considered the "primary" selection for the properties panel.
export const selectedCanvasComponentIdsAtom = atom<string[]>([]);

// Atoms to track the global state of a drag-and-drop operation.
export const activeDndIdAtom = atom<UniqueIdentifier | null>(null);
export const overDndIdAtom = atom<UniqueIdentifier | null>(null);

// FIX: The rect is now explicitly a viewport-relative rect. The component will translate it.
export const dropPlaceholderAtom = atom<{ parentId: string; index: number; viewportRect: ClientRect | null; isGrid: boolean; } | null>(null);


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

// --- Atoms Scoped to the Modal ---
export const modalPendingSelectionAtom = atom<BoundData | null>(null);
export const modalSelectedNodeIdAtom = atom<string>('arrest');
export const modalComponentSearchQueryAtom = atom('');

// =================================================================
//                         Preview Mode State
// =================================================================
export const isPreviewFluidAtom = atom(false);
export const previewWidthAtom = atom<number>(1280); // Default to desktop preset width