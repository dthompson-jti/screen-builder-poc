// src/components/SelectableListItem.tsx
import { DraggableComponent } from '../types';

interface SelectableListItemProps {
  component: DraggableComponent;
  isSelected: boolean;
  onSelect: (component: DraggableComponent) => void;
}

export const SelectableListItem = ({ component, isSelected, onSelect }: SelectableListItemProps) => {
  const iconStyle = component.iconColor ? { color: component.iconColor } : {};
  const className = `component-list-item selectable ${isSelected ? 'selected' : ''}`;

  return (
    <li onClick={() => onSelect(component)} className={className}>
      <span className="material-symbols-outlined component-icon" style={iconStyle}>{component.icon}</span>
      <span className="component-name">{component.name}</span>
      {isSelected && <span className="material-symbols-outlined selection-check">check_circle</span>}
    </li>
  );
};