// src/state/atoms.ts
import { atom } from 'jotai';
import { componentListData } from '../data/componentBrowserMock';
import { FormComponent, BoundData, ComponentGroup, DraggableComponent } from '../types';

// =================================================================
//                         App State
// =================================================================
export type AppViewMode = 'editor' | 'preview' | 'settings';
export type ToolbarTabId = 'layout' | 'data' | 'general' | 'templates' | 'conditions' | 'layers';

export const appViewModeAtom = atom<AppViewMode>('editor');
export const isMenuOpenAtom = atom(false);
export const isToolbarCompactAtom = atom(false);
export const isShowBreadcrumbAtom = atom(true);
export const activeToolbarTabAtom = atom<ToolbarTabId>('data');
export const isComponentBrowserVisibleAtom = atom(true);

// =================================================================
//                         Canvas State
// =================================================================
export const canvasComponentsAtom = atom<FormComponent[]>([]);
export const selectedCanvasComponentIdAtom = atom<string | null>(null);

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