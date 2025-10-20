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

  const defaultState = {
    canRename: false, canDelete: false, canWrap: false, canUnwrap: false,
    canNudgeUp: false, canNudgeDown: false, canSelectParent: false,
    canConvertToHeading: false, canConvertToParagraph: false, canConvertToLink: false,
  };

  if (selectedIds.length === 0) {
    return defaultState;
  }

  const isSingleSelection = selectedIds.length === 1;
  const primaryComponent = allComponents[selectedIds[0]];
  if (!primaryComponent) {
      return defaultState;
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

  // Conversion capabilities
  const isFormComponent = primaryComponent.componentType === 'widget' || primaryComponent.componentType === 'field';
  const formComponent = isFormComponent ? primaryComponent : null;
  const isPlainText = formComponent?.properties.controlType === 'plain-text';
  const isLink = formComponent?.properties.controlType === 'link';
  const isHeading = isPlainText && formComponent?.properties.textElement?.startsWith('h');
  const isParagraph = isPlainText && !isHeading;

  const canConvertToHeading = isSingleSelection && (isParagraph || isLink);
  const canConvertToParagraph = isSingleSelection && (isHeading || isLink);
  const canConvertToLink = isSingleSelection && (isHeading || isParagraph);

  return {
    canRename,
    canDelete,
    canWrap,
    canUnwrap,
    canNudgeUp,
    canNudgeDown,
    canSelectParent,
    canConvertToHeading,
    canConvertToParagraph,
    canConvertToLink,
  };
};