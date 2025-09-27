// src/editor-canvas/TextInputPreview.tsx
import './TextInputPreview.css';

export const TextInputPreview = ({ label }: { label: string }) => (
  <div className="field-preview">
    <label>{label}</label>
    <input type="text" placeholder={`Enter ${label.toLowerCase()}`} disabled />
  </div>
);