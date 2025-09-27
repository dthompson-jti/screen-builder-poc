// src/editor-canvas/canvasAtoms.ts
import { atom } from 'jotai';
import { FormComponent } from '../types';

/**
 * An atom that holds an array of all component instances on the canvas.
 * This is the single source of truth for the canvas layout.
 */
export const canvasComponentsAtom = atom<FormComponent[]>([]);

/**
 * An atom that holds the ID of the currently selected component on the canvas.
 * It is null if no component is selected.
 */
export const selectedCanvasComponentIdAtom = atom<string | null>(null);