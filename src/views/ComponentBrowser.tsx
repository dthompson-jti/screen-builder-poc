// src/views/ComponentBrowser.tsx
import { useSetAtom, useAtomValue } from 'jotai';
import { useDraggable } from '@dnd-kit/core';
import { selectedNodeIdAtom, componentSearchQueryAtom, isComponentBrowserVisibleAtom, isShowBreadcrumbAtom } from '../data/atoms';
import { componentListData, componentTreeData } from '../data/componentBrowserMock';
import { DraggableComponent } from '../types';
import { DataNavigatorView } from './DataNavigatorView';
import { ConnectionsDropdown } from '../components/ConnectionsDropdown';
import panelStyles from '../components/panel.module.css';

const DraggableListItem = ({ component }: { component: DraggableComponent }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draggable-${component.id}`,
    data: { 
      type: component.type, 
      name: component.name, 
      icon: component.icon, 
      id: component.id, 
      isNew: true,
      origin: 'data',
      data: {
        nodeId: component.nodeId,
        nodeName: component.nodeName
      }
    },
  });
  const iconStyle = component.iconColor ? { color: component.iconColor } : {};
  return (
    <li ref={setNodeRef} style={{ opacity: isDragging ? 0.4 : 1 }} {...listeners} {...attributes} className={panelStyles.componentListItem}>
      <span className={`material-symbols-rounded ${panelStyles.componentIcon}`} style={iconStyle}>{component.icon}</span>
      <span className={panelStyles.componentName}>{component.name}</span>
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
      // FIX: Remove unnecessary type assertion. `component` is already the correct type.
      renderComponentItem={(component) => <DraggableListItem component={component} />}
      renderConnectionsDropdown={(navigator, selectedNodeId, onClose) => (
        <ConnectionsDropdown navigator={navigator} selectedNodeId={selectedNodeId} onClose={onClose} />
      )}
      onClosePanel={handleClosePanel}
      showBreadcrumb={isShowBreadcrumb}
    />
  );
};