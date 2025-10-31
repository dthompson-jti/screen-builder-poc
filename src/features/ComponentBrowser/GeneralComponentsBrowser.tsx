// src/features/ComponentBrowser/GeneralComponentsBrowser.tsx
import { useSetAtom } from 'jotai';
import { useDraggable } from '@dnd-kit/core';
import { isComponentBrowserVisibleAtom } from '../../data/atoms';
import { generalComponents } from '../../data/generalComponentsMock';
import { DraggableComponent, DndData, FormComponent } from '../../types';
import { PanelHeader } from '../../components/PanelHeader';
import panelStyles from '../../components/panel.module.css';

const DraggableListItem = ({ component }: { component: DraggableComponent }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-${component.id}`, // Use a prefix to ensure it's unique from canvas items
    data: {
      id: component.id,
      name: component.name,
      type: component.type,
      icon: component.icon,
      isNew: true,
      origin: 'general',
      controlType: 
        (component.id === 'heading' || component.id === 'paragraph') ? 'plain-text' : 
        (component.id === 'layout-container') ? undefined : component.id as FormComponent['properties']['controlType'],
      controlTypeProps: 
        component.id === 'heading' ? { textElement: 'h2', content: 'Heading' } :
        component.id === 'paragraph' ? { textElement: 'p', content: 'This is a paragraph of text.' } :
        undefined,
      data: undefined,
    } satisfies DndData,
  });

  const iconStyle = component.iconColor ? { color: component.iconColor } : {};

  // Use the global .menu-item class for consistent styling
  return (
    <li
      ref={setNodeRef}
      style={{ opacity: isDragging ? 0.4 : 1, touchAction: 'none' }}
      {...listeners}
      {...attributes}
      className={`menu-item ${panelStyles.dataNavItem}`}
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
          {generalComponents.map((group) => (
            <li key={group.title} className={panelStyles.componentListGroup}>
              <h5 className={panelStyles.listGroupTitle}>{group.title}</h5>
              <ul className={panelStyles.componentListGroupItems}>
                {group.components.map((component) => (
                  <DraggableListItem key={component.id} component={component} />
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};