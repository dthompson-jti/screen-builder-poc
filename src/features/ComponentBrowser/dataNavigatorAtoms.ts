// src/features/ComponentBrowser/dataNavigatorAtoms.ts
import { atom } from 'jotai';

/**
 * Atoms to manage the selection state within the Data Navigator panel,
 * kept separate from the main canvas selection state for encapsulation.
 */

// Holds the array of component IDs selected in the Data Navigator.
export const dataNavigatorSelectedIdsAtom = atom<string[]>([]);

// Holds the ID of the last clicked item, used for range (Shift+Click) selections.
export const dataNavigatorSelectionAnchorIdAtom = atom<string | null>(null);