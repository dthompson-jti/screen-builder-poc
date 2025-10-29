// src/features/ComponentBrowser/ComponentBrowser.tsx
import { useSetAtom } from 'jotai';
import { useDraggable } from '@dnd-kit/core';
import { selectedNodeIdAtom, componentSearchQueryAtom, isComponentBrowserVisibleAtom } from '../../data/atoms';
import { componentListData, componentTreeData } from '../../data/componentBrowserMock';
import { DraggableComponent, DndData } from '../../types';
import { DataNavigatorView } from '../DataNavigator/DataNavigatorView';
import { ConnectionsDropdown } from '../DataNavigator/ConnectionsDropdown';
import panelStyles from '../../components/panel.module.css'; // CORRECTED PATH

const DraggableListItem = ({ component }: { component: DraggableComponent }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: draggable-,
    data: { 
      id: component.id, 
      name: component.name, 
      type: component.type, 
      icon: component.icon, 
      isNew: true,
      origin: 'data',
      data: {
        nodeId: component.nodeId!,
        nodeName: component.nodeName!,
        path: component.path!,
      }
    } satisfies DndData,
  });
  const iconStyle = component.iconColor ? { color: component.iconColor } : {};
  return (
    // DEFINITIVE FIX: Use the global .menu-item class for consistent styling.
    <li ref={setNodeRef} style={{ opacity: isDragging ? 0.4 : 1 }} {...listeners} {...attributes} className="menu-item">
      <span className={material-symbols-rounded } style={iconStyle}>{component.icon}</span>
      <span className={panelStyles.componentName}>{component.name}</span>
    </li>
  );
};

export const ComponentBrowser = () => {
  const setIsPanelVisible = useSetAtom(isComponentBrowserVisibleAtom);

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
      renderComponentItem={(component) => <DraggableListItem component={component} />}
      renderConnectionsDropdown={(navigator, selectedNodeId, onClose) => (
        <ConnectionsDropdown navigator={navigator} selectedNodeId={selectedNodeId} onClose={onClose} />
      )}
      onClosePanel={handleClosePanel}
    />
  );
};
