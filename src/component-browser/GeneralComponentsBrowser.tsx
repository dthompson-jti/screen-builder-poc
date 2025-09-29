// src/component-browser/GeneralComponentsBrowser.tsx
import { useSetAtom } from 'jotai';
import { useDraggable } from '@dnd-kit/core';
import { isComponentBrowserVisibleAtom } from '../appAtoms';
import { generalComponents } from './generalComponentMockData';
import { DraggableComponent } from './mockComponentTree';
import './navigator.css'; // Re-use styles

const DraggableListItem = ({ component }: { component: DraggableComponent }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draggable-${component.id}`,
    data: { 
      type: component.type, 
      name: component.name, 
      icon: component.icon, 
      id: component.id, 
      isNew: true 
    },
  });
  const iconStyle = component.iconColor ? { color: component.iconColor } : {};
  return (
    <li ref={setNodeRef} style={{ opacity: isDragging ? 0.4 : 1 }} {...listeners} {...attributes} className="component-list-item">
      <span className="material-symbols-outlined component-icon" style={iconStyle}>{component.icon}</span>
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
      <div className="component-browser-header">
        <h4>General Components</h4>
        <button 
          className="btn-tertiary icon-only close-panel-button" 
          title="Close Panel" 
          aria-label="Close Panel"
          onClick={handleClosePanel}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
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