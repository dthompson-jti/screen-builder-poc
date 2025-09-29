// src/component-browser/ComponentBrowser.tsx
import { useSetAtom, useAtomValue } from 'jotai';
import { useDraggable } from '@dnd-kit/core';
import { selectedNodeIdAtom, componentSearchQueryAtom } from './browserAtoms';
import { componentListData, componentTreeData, DraggableComponent } from './mockComponentTree';
import { isComponentBrowserVisibleAtom, isShowBreadcrumbAtom } from '../appAtoms';
import { DataNavigatorView } from './DataNavigatorView';
import { ConnectionsDropdown } from './ConnectionsDropdown';
import './navigator.css';

const DraggableListItem = ({ component }: { component: DraggableComponent }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draggable-${component.id}`,
    data: { type: component.type, name: component.name, icon: component.icon, id: component.id, isNew: true },
  });
  const iconStyle = component.iconColor ? { color: component.iconColor } : {};
  return (
    <li ref={setNodeRef} style={{ opacity: isDragging ? 0.4 : 1 }} {...listeners} {...attributes} className="component-list-item">
      <span className="material-symbols-outlined component-icon" style={iconStyle}>{component.icon}</span>
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
      renderConnectionsDropdown={(navigator, selectedNodeId) => (
        <ConnectionsDropdown navigator={navigator} selectedNodeId={selectedNodeId} />
      )}
      onClosePanel={handleClosePanel}
      showBreadcrumb={isShowBreadcrumb}
    />
  );
};