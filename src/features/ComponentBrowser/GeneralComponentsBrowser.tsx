// src/features/ComponentBrowser/GeneralComponentsBrowser.tsx
import { useSetAtom } from 'jotai';
import { useDraggable } from '@dnd-kit/core';
import { isComponentBrowserVisibleAtom } from '../../data/atoms';
import { DraggableComponent, DndData } from '../../types';
import { PanelHeader } from '../../components/PanelHeader';
import panelStyles from '../../components/panel.module.css';

// Combined list for POC
const components: DraggableComponent[] = [
  { id: 'layout-container', name: 'Layout Container', type: 'layout', icon: 'view_quilt' },
  { id: 'plain-text', name: 'Plain Text', type: 'widget', icon: 'notes', controlType: 'plain-text' },
  { id: 'text-input', name: 'Text Input', type: 'widget', icon: 'text_fields', controlType: 'text-input' },
  { id: 'dropdown', name: 'Dropdown', type: 'widget', icon: 'arrow_drop_down_circle', controlType: 'dropdown' },
  { id: 'radio-buttons', name: 'Radio Buttons', type: 'widget', icon: 'radio_button_checked', controlType: 'radio-buttons' },
];

const DraggableListItem = ({ component }: { component: DraggableComponent }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draggable-${component.id}`,
    data: {
      id: component.id,
      name: component.name,
      type: component.type,
      icon: component.icon,
      isNew: true,
      origin: 'general',
      controlType: component.controlType, // Pass controlType in DND data
    } satisfies DndData,
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
      <PanelHeader title="Components" onClose={handleClosePanel} />
      <div className={panelStyles.componentListContainer}>
        <ul className={panelStyles.componentList}>
          <li>
            <ul>
              {components.map((component: DraggableComponent) => (
                <DraggableListItem key={component.id} component={component} />
              ))}
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
};