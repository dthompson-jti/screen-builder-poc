// src/components/StaticBindingDisplay.tsx
import { BoundData } from '../types';
import './StaticBindingDisplay.css';

interface StaticBindingDisplayProps {
  binding: BoundData | null | undefined;
}

export const StaticBindingDisplay = ({ binding }: StaticBindingDisplayProps) => {
  if (!binding) {
    return null;
  }

  // FIX: Render the Node Name > Field Name format
  return (
    <div className="static-binding-display">
      <span>{binding.nodeName}</span>
      <span className="material-symbols-rounded chevron">chevron_right</span>
      <span>{binding.fieldName}</span>
    </div>
  );
};