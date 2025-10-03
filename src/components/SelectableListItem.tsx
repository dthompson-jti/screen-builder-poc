// src/components/SelectableListItem.tsx
import { DraggableComponent } from '../types';
import panelStyles from './panel.module.css';

interface SelectableListItemProps {
  component: DraggableComponent;
  isSelected: boolean;
  onSelect: (component: DraggableComponent) => void;
}

export const SelectableListItem = ({ component, isSelected, onSelect }: SelectableListItemProps) => {
  const iconStyle = component.iconColor ? { color: component.iconColor } : {};
  const className = `${panelStyles.componentListItem} ${panelStyles.selectable} ${isSelected ? panelStyles.selected : ''}`;

  return (
    <li onClick={() => onSelect(component)} className={className}>
      <span className={`material-symbols-rounded ${panelStyles.componentIcon}`} style={iconStyle}>{component.icon}</span>
      <span className={panelStyles.componentName}>{component.name}</span>
      {isSelected && <span className={`material-symbols-rounded ${panelStyles.selectionCheck}`}>check_circle</span>}
    </li>
  );
};