// src/views/GeneralComponentsBrowser.tsx
import { useSetAtom } from 'jotai';
import { useDraggable } from '@dnd-kit/core';
import { isComponentBrowserVisibleAtom } from '../data/atoms';
import { generalComponents } from '../data/generalComponentsMock';
import { DraggableComponent } from '../types';
import { PanelHeader } from '../components/PanelHeader';
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
      origin: 'general',
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
          <li>
            <ul>
              {generalComponents.map((component: DraggableComponent) => (
                <DraggableListItem key={component.id} component={component} />
              ))}
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
};