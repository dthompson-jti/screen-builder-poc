// src/features/Editor/useComponentCapabilities.ts
import { useAtomValue } from 'jotai';
import { canvasComponentsByIdAtom, rootComponentIdAtom } from '../../data/historyAtoms';
import { LayoutComponent } from '../../types';

/**
 * A hook that computes the possible actions for a given set of component IDs.
 * This centralizes the capability logic to be reused by the SelectionToolbar,
 * ContextMenu, and hotkeys.
 */
export const useComponentCapabilities = (selectedIds: string[]) => {
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const rootId = useAtomValue(rootComponentIdAtom);

  if (selectedIds.length === 0) {
    return {
      canRename: false, canDelete: false, canWrap: false, canUnwrap: false,
      canNudgeUp: false, canNudgeDown: false, canSelectParent: false,
    };
  }

  const isSingleSelection = selectedIds.length === 1;
  const primaryComponent = allComponents[selectedIds[0]];
  if (!primaryComponent) {
      return { canRename: false, canDelete: false, canWrap: false, canUnwrap: false, canNudgeUp: false, canNudgeDown: false, canSelectParent: false };
  }
  const isRootSelected = selectedIds.includes(rootId);
  const parent = allComponents[primaryComponent.parentId] as LayoutComponent | undefined;

  const canDelete = !isRootSelected;
  const canWrap = !isRootSelected;
  
  const canUnwrap = isSingleSelection &&
    primaryComponent.componentType === 'layout' &&
    !isRootSelected &&
    primaryComponent.children.length > 0 &&
    !!parent;

  const canRename = isSingleSelection && !isRootSelected;

  const canSelectParent = isSingleSelection && !!parent && parent.id !== rootId;

  let canNudgeUp = false;
  let canNudgeDown = false;
  if (isSingleSelection && parent) {
    const index = parent.children.indexOf(primaryComponent.id);
    canNudgeUp = index > 0;
    canNudgeDown = index < parent.children.length - 1;
  }

  return {
    canRename,
    canDelete,
    canWrap,
    canUnwrap,
    canNudgeUp,
    canNudgeDown,
    canSelectParent,
  };
};