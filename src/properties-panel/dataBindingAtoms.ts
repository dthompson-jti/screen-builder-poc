// src/properties-panel/dataBindingAtoms.ts
import { atom } from 'jotai';
import { BoundData } from '../types';

interface DataBindingRequest {
  componentId: string;
  currentBinding: BoundData | null | undefined;
}

/**
 * An atom that holds the request to open the data binding modal.
 * Writing a request object opens the modal, writing null closes it.
 */
export const dataBindingRequestAtom = atom<DataBindingRequest | null>(null);

/**
 * A derived atom that controls the visibility of the modal.
 */
export const isDataBindingModalOpenAtom = atom<boolean>(
  (get) => get(dataBindingRequestAtom) !== null
);

interface DataBindingResult {
  componentId: string;
  newBinding: BoundData | null; // null indicates an "Unbind" action
}

/**
 * An atom to communicate the result from the modal back to the app.
 * The modal writes to this atom when the user clicks "Apply" or "Unbind".
 */
export const dataBindingResultAtom = atom<DataBindingResult | null>(null);

// --- Atoms Scoped to the Modal ---

/**
 * Holds the pending selection within the modal before "Apply" is clicked.
 */
export const modalPendingSelectionAtom = atom<BoundData | null>(null);

/**
 * The ID of the node currently at the center of the modal's navigator view.
 */
export const modalSelectedNodeIdAtom = atom<string>('arrest');

/**
 * The search query for the modal's component browser list.
 */
export const modalComponentSearchQueryAtom = atom('');