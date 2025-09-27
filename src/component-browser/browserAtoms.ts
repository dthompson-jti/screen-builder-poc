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

/**
 * An atom to hold the search query for the component browser list.
 */
export const componentSearchQueryAtom = atom('');

/**
 * A derived atom that filters the available components based on the search query.
 */
export const filteredComponentGroupsAtom = atom((get) => {
  const query = get(componentSearchQueryAtom).toLowerCase().trim();
  const allGroups = get(availableComponentGroupsAtom);

  if (!query) {
    return allGroups; // Return all if query is empty
  }

  return allGroups
    .map(group => ({
      ...group,
      components: group.components.filter(component =>
        component.name.toLowerCase().includes(query)
      ),
    }))
    .filter(group => group.components.length > 0); // Hide groups that become empty
});