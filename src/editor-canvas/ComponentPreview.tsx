// src/editor-canvas/ComponentPreview.tsx
import './ComponentPreview.css';

interface ComponentPreviewProps {
  name: string;
  type: string;
}

export const ComponentPreview = ({ name, type }: ComponentPreviewProps) => {
  return (
    <div className="component-preview">
      <p className="component-preview-name">{name}</p>
      <span className="component-preview-type">{type}</span>
    </div>
  );
};