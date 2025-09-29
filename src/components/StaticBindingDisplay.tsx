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

  return (
    <div className="static-binding-display">
      <p>{binding.fieldName}</p>
      <span>{binding.path}</span>
    </div>
  );
};