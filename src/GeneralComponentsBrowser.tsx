// src/GeneralComponentsBrowser.tsx
import { useSetAtom } from 'jotai';
import { useDraggable } from '@dnd-kit/core';
import { isComponentBrowserVisibleAtom } from './state/atoms';
import { generalComponents } from './data/generalComponentsMock';
import { DraggableComponent } from './types';
import { PanelHeader } from './components/PanelHeader';
import './components/panel.css';

const DraggableListItem = ({ component }: { component: DraggableComponent }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draggable-${component.id}`,
    // FIX: Add the intrinsic `origin` property to the draggable data payload.
    data: { ...component, isNew: true, origin: 'general' },
  });
  const iconStyle = component.iconColor ? { color: component.iconColor } : {};
  return (
    <li ref={setNodeRef} style={{ opacity: isDragging ? 0.4 : 1 }} {...listeners} {...attributes} className="component-list-item">
      <span className="material-symbols-rounded component-icon" style={iconStyle}>{component.icon}</span>
      <span className="component-name">{component.name}</span>
    </li>
  );
};

export const GeneralComponentsBrowser = () => {
  const setIsPanelVisible = useSetAtom(isComponentBrowserVisibleAtom);

  const handleClosePanel = () => {
    setIsPanelVisible(false);
  }

  return (
    <div className="component-browser-container">
      <PanelHeader title="General Components" onClose={handleClosePanel} />
      <div className="component-list-container">
        <ul className="component-list">
          <li>
            <ul>
              {generalComponents.map((component) => (
                <DraggableListItem key={component.id} component={component} />
              ))}
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
};