// src/data/screenTypeConfig.ts
import { ScreenType } from './atoms';

export const screenTypeConfig: Record<ScreenType, { label: string; tooltip: string }> = {
  // FIX: Update the label text.
  'case-init': { label: 'Case Initiation', tooltip: 'Screen Type: Case Initiation Screen' },
  'insert':    { label: 'Insert', tooltip: 'Screen Type: Insert Screen' },
  'update':    { label: 'Update', tooltip: 'Screen Type: Update Screen' },
  'search':    { label: 'Search', tooltip: 'Screen Type: Search Screen' },
  'folder-view': { label: 'Folder View', tooltip: 'Screen Type: Folder View Screen' },
  'header-screen': { label: 'Header Screen', tooltip: 'Screen Type: Header Screen' },
};

export const screenTypeOptions: ScreenType[] = [
    'case-init',
    'insert',
    'update',
    'search',
    'folder-view',
    'header-screen'
];