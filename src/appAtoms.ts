// src/appAtoms.ts
import { atom } from 'jotai';

/**
 * Controls visibility of the left Component Browser panel.
 */
export const isComponentBrowserVisibleAtom = atom(true);

/**
 * Controls the layout of the Main Toolbar (true = icon only/compact, false = icon + text/normal).
 */
export const isToolbarCompactAtom = atom(true);

/**
 * Tracks which toolbar tab (e.g., 'data', 'layout') is currently active/selected.
 */
export const activeToolbarTabAtom = atom('data');

/**
 * Controls visibility of the header pop-over menu.
 */
export const isMenuOpenAtom = atom(false);

/**
 * Controls whether the data navigator breadcrumbs are displayed.
 */
export const isShowBreadcrumbAtom = atom(true);