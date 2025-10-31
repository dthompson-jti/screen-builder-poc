// src/features/ComponentBrowser/DraggableListItem.tsx
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { DraggableComponent, DndData } from '../../types';
import { ActionMenu, ActionMenuItem } from '../../components/ActionMenu';
import { dataNavigatorSelectedIdsAtom, dataNavigatorSelectionAnchorIdAtom } from './dataNavigatorAtoms';
import { commitActionAtom, rootComponentIdAtom, canvasComponentsByIdAtom } from '../../data/historyAtoms';
import { selectedCanvasComponentIdsAtom } from '../../data/atoms';
import panelStyles from '../../components/panel.module.css';

interface DraggableListItemProps {
  component: DraggableComponent;
  list: DraggableComponent[];
}

export const DraggableListItem = ({ component, list }: DraggableListItemProps) => {
  const [selectedIds, setSelectedIds] = useAtom(dataNavigatorSelectedIdsAtom);
  const [anchorId, setAnchorId] = useAtom(dataNavigatorSelectionAnchorIdAtom);
  const commitAction = useSetAtom(commitActionAtom);
  const canvasSelectedIds = useAtomValue(selectedCanvasComponentIdsAtom);
  const allCanvasComponents = useAtomValue(canvasComponentsByIdAtom);
  const rootId = useAtomValue(rootComponentIdAtom);

  const { attributes, listeners, setNodeRef } = useDraggable({
    id: component.id,
    data: {
      ...component,
      isNew: true,
      origin: 'data',
      data: {
        nodeId: component.nodeId ?? '',
        nodeName: component.nodeName ?? '',
        path: component.path ?? '',
      },
    } satisfies DndData,
  });

  const isSelected = selectedIds.includes(component.id);
  const iconStyle = component.iconColor ? { color: component.iconColor } : {};
  const className = `menu-item ${panelStyles.dataNavItem}`;

  const determineTargetParentId = (): string => {
    if (canvasSelectedIds.length === 1) {
      const comp = allCanvasComponents[canvasSelectedIds[0]];
      if (comp && comp.componentType === 'layout') {
        return comp.id;
      }
    }
    return rootId;
  };

  const handleQuickAdd = () => {
    const componentsToAdd = selectedIds
      .map(id => list.find(item => item.id === id))
      .filter((c): c is DraggableComponent => !!c);

    if (componentsToAdd.length === 0) return;

    const targetParentId = determineTargetParentId();
    commitAction({
      action: {
        type: 'COMPONENTS_ADD_BULK',
        payload: { componentsToAdd, targetParentId },
      },
      message: `Add ${componentsToAdd.length} field(s)`,
    });
    setSelectedIds([]);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isCtrlClick = e.ctrlKey || e.metaKey;
    const isSingleClick = !isCtrlClick && !e.shiftKey;

    if (isSingleClick) {
        setSelectedIds([component.id]);
        setAnchorId(component.id);
        return;
    }

    if (isCtrlClick) {
      const newIds = isSelected ? selectedIds.filter(id => id !== component.id) : [...selectedIds, component.id];
      setSelectedIds(newIds);
      setAnchorId(component.id);
    } else if (e.shiftKey && anchorId) {
      const anchorIndex = list.findIndex(item => item.id === anchorId);
      const targetIndex = list.findIndex(item => item.id === component.id);
      if (anchorIndex !== -1 && targetIndex !== -1) {
        const start = Math.min(anchorIndex, targetIndex);
        const end = Math.max(anchorIndex, targetIndex);
        const rangeIds = list.slice(start, end + 1).map(item => item.id);
        setSelectedIds(rangeIds);
      } else {
        setSelectedIds([component.id]);
        setAnchorId(component.id);
      }
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    // When menu opens, select the item if it's not already.
    if (isOpen) {
      if (!isSelected) {
        setSelectedIds([component.id]);
        setAnchorId(component.id);
      }
    }
  };

  const isTransient = component.name.toLowerCase().includes('transient');

  const numSelected = selectedIds.length;
  const menuItems: ActionMenuItem[] = [
    {
      id: 'add',
      icon: numSelected > 1 ? 'playlist_add' : 'add',
      label: numSelected > 1 ? `Add ${numSelected} Fields` : 'Add to canvas',
      onClick: handleQuickAdd
    },
  ];

  return (
    <ContextMenu.Root onOpenChange={handleOpenChange}>
      <ContextMenu.Trigger asChild>
        <li
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          onClick={handleClick}
          className={className}
          data-state={isSelected ? 'checked' : 'unchecked'}
          style={{ touchAction: 'none' }}
        >
          <div className={panelStyles.iconWrapper}>
            <span className={`material-symbols-rounded ${panelStyles.componentIcon}`} style={iconStyle}>{component.icon}</span>
            {isTransient && <span className={`material-symbols-rounded ${panelStyles.overlayIcon}`}>title</span>}
          </div>
          <span className={panelStyles.componentName}>{component.name}</span>
        </li>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="menu-popover" onCloseAutoFocus={(e) => e.preventDefault()}>
          <ActionMenu items={menuItems} />
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};