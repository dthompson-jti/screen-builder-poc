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
  // Use the global 'menu-item' class for shared styling.
  // Use the Radix-standard 'data-state' attribute for selection state.
  const className = `menu-item`;

  return (
    <li 
      onClick={() => onSelect(component)} 
      className={className}
      data-state={isSelected ? 'checked' : 'unchecked'}
    >
      <span className="checkmark-container">
        {/* The checkmark is now handled by the global menu.css via data-state */}
        {isSelected && <span className="material-symbols-rounded">check</span>}
      </span>
      <span className={`material-symbols-rounded ${panelStyles.componentIcon}`} style={iconStyle}>{component.icon}</span>
      <span className={panelStyles.componentName}>{component.name}</span>
    </li>
  );
};