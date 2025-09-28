// src/appAtoms.ts
import { atom } from 'jotai';

// --- App State ---
export const isMenuOpenAtom = atom(false);
export const isToolbarCompactAtom = atom(false);
export const isShowBreadcrumbAtom = atom(true);

// FIX: New atom to control the main application view
export type AppViewMode = 'editor' | 'preview' | 'settings';
export const appViewModeAtom = atom<AppViewMode>('editor');


// --- Toolbar and Panel State ---
export const activeToolbarTabAtom = atom('data');
export const isComponentBrowserVisibleAtom = atom(true);