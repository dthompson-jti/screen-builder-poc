// src/components/DataBindingPicker.tsx
import { BoundData } from '../types';
import './DataBindingPicker.css';

interface DataBindingPickerProps {
  binding: BoundData | null | undefined;
  onOpen: () => void;
}

export const DataBindingPicker = ({ binding, onOpen }: DataBindingPickerProps) => {
  const isBound = !!binding;

  return (
    <div className="data-binding-picker">
      {/* FIX: onClick is now on the main wrapper div */}
      <div className={`picker-control ${isBound ? 'bound' : 'unbound'}`} onClick={onOpen}>
        <span className={`picker-label ${isBound ? 'bound' : ''}`}>
          {/* FIX: Only show the field name inside the picker */}
          {isBound ? binding.fieldName : 'No data binding'}
        </span>
        {/* FIX: The button is now just a visual affordance */}
        <button className="btn-tertiary icon-only" aria-label="Select data binding" tabIndex={-1} style={{pointerEvents: 'none'}}>
          <span className="material-symbols-rounded">more_horiz</span>
        </button>
      </div>
      {/* FIX: Show the full path in helper text below */}
      {isBound && <span className="picker-helper-text">{binding.path}</span>}
    </div>
  );
};