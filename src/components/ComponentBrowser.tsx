// src/components/ComponentBrowser.tsx
import { useSetAtom, useAtomValue } from 'jotai';
import { useDraggable } from '@dnd-kit/core';
import { selectedNodeIdAtom, componentSearchQueryAtom, isComponentBrowserVisibleAtom, isShowBreadcrumbAtom } from '../state/atoms';
import { componentListData, componentTreeData } from '../data/componentBrowserMock';
import { DraggableComponent } from '../types';
import { DataNavigatorView } from './DataNavigatorView';
import { ConnectionsDropdown } from './ConnectionsDropdown';
import './panel.css';
import './navigator.css';

const DraggableListItem = ({ component }: { component: DraggableComponent }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draggable-${component.id}`,
    // FIX: Add the intrinsic `origin` property to the draggable data payload.
    data: { ...component, isNew: true, origin: 'data' },
  });
  const iconStyle = component.iconColor ? { color: component.iconColor } : {};
  return (
    <li ref={setNodeRef} style={{ opacity: isDragging ? 0.4 : 1 }} {...listeners} {...attributes} className="component-list-item">
      <span className="material-symbols-rounded component-icon" style={iconStyle}>{component.icon}</span>
      <span className="component-name">{component.name}</span>
    </li>
  );
};

export const ComponentBrowser = () => {
  const setIsPanelVisible = useSetAtom(isComponentBrowserVisibleAtom);
  const isShowBreadcrumb = useAtomValue(isShowBreadcrumbAtom);

  const handleClosePanel = () => {
    setIsPanelVisible(false);
  }

  return (
    <DataNavigatorView
      treeData={componentTreeData}
      componentData={componentListData}
      atoms={{
        selectedNodeIdAtom: selectedNodeIdAtom,
        searchQueryAtom: componentSearchQueryAtom,
      }}
      renderComponentItem={(component) => <DraggableListItem component={component as DraggableComponent} />}
      renderConnectionsDropdown={(navigator, selectedNodeId, onClose) => (
        <ConnectionsDropdown navigator={navigator} selectedNodeId={selectedNodeId} onClose={onClose} />
      )}
      onClosePanel={handleClosePanel}
      showBreadcrumb={isShowBreadcrumb}
    />
  );
};