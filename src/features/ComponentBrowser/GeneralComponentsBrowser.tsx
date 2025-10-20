// src/features/ComponentBrowser/GeneralComponentsBrowser.tsx
import { useSetAtom } from 'jotai';
import { useDraggable } from '@dnd-kit/core';
import { isComponentBrowserVisibleAtom } from '../../data/atoms';
import { generalComponents } from '../../data/generalComponentsMock';
import { DraggableComponent, DndData } from '../../types';
import { PanelHeader } from '../../components/PanelHeader';
import panelStyles from '../../components/panel.module.css';

const DraggableListItem = ({ component }: { component: DraggableComponent }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-${component.id}`, // Use a prefix to ensure it's unique from canvas items
    data: {
      // FIX: Structure the payload to match the DndData type precisely.
      // Top-level properties:
      id: component.id,
      name: component.name,
      type: component.type,
      icon: component.icon,
      isNew: true,
      origin: 'general',
      // Nested `data` property for binding info (null for general components):
      data: undefined,
    } satisfies DndData,
  });

  const iconStyle = component.iconColor ? { color: component.iconColor } : {};

  return (
    <li 
      ref={setNodeRef} 
      style={{ opacity: isDragging ? 0.4 : 1 }} 
      {...listeners} 
      {...attributes} 
      className={panelStyles.componentListItem}
    >
      <span className={`material-symbols-rounded ${panelStyles.componentIcon}`} style={iconStyle}>{component.icon}</span>
      <span className={panelStyles.componentName}>{component.name}</span>
    </li>
  );
};

export const GeneralComponentsBrowser = () => {
  const setIsPanelVisible = useSetAtom(isComponentBrowserVisibleAtom);

  const handleClosePanel = () => {
    setIsPanelVisible(false);
  }

  return (
    <div className={panelStyles.componentBrowserContainer}>
      <PanelHeader title="General Components" onClose={handleClosePanel} />
      <div className={panelStyles.componentListContainer}>
        <ul className={panelStyles.componentList}>
          {generalComponents.map((component) => (
            <DraggableListItem key={component.id} component={component} />
          ))}
        </ul>
      </div>
    </div>
  );
};