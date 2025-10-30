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
  // Use the global 'menu-item' for base styles and our local class for overrides.
  const className = `menu-item ${panelStyles.dataNavItem}`;

  // This is a placeholder for the transient field logic.
  const isTransient = component.name.toLowerCase().includes('transient');

  return (
    <li 
      onClick={() => onSelect(component)} 
      className={className}
      data-state={isSelected ? 'checked' : 'unchecked'}
    >
      <div className="checkmark-container">
        {isSelected && <span className="material-symbols-rounded">check</span>}
      </div>
      <div className={panelStyles.iconWrapper}>
        <span className={`material-symbols-rounded ${panelStyles.componentIcon}`} style={iconStyle}>{component.icon}</span>
        {isTransient && <span className={`material-symbols-rounded ${panelStyles.overlayIcon}`}>title</span>}
      </div>
      <span className={panelStyles.componentName}>{component.name}</span>
    </li>
  );
};