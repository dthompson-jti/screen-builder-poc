// src/features/Editor/DndDragOverlay.tsx
import { useAtomValue } from 'jotai';
import { Active } from '@dnd-kit/core';
import { canvasComponentsByIdAtom } from '../../data/historyAtoms';
import { DndData } from '../../types';

// Previews
import { BrowserItemPreview } from './previews/BrowserItemPreview';
import { ContainerPreview } from './previews/ContainerPreview';
import PlainTextPreview from './previews/PlainTextPreview';
import { TextInputPreview } from './previews/TextInputPreview';
import DropdownPreview from './previews/DropdownPreview';
import RadioButtonsPreview from './previews/RadioButtonsPreview';
import LinkPreview from './previews/LinkPreview';

interface DndDragOverlayProps {
  activeItem: Active | null;
}

export const DndDragOverlay = ({ activeItem }: DndDragOverlayProps) => {
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  
  if (!activeItem) return null;

  const activeData = activeItem.data.current as DndData;
  const { isNew, name, icon } = activeData || {};

  if (isNew) {
    return <BrowserItemPreview name={name ?? ''} icon={icon ?? ''} />;
  }
  
  const componentId = activeItem.id;
  if (typeof componentId !== 'string') return null;

  const activeComponent = allComponents[componentId];
  if (!activeComponent) return null;
  
  if (activeComponent.componentType === 'layout') {
    return <ContainerPreview component={activeComponent} allComponents={allComponents} />;
  }
  
  if (activeComponent.componentType === 'widget' || activeComponent.componentType === 'field') {
    const formComponent = activeComponent;
    const commonProps = {
        label: formComponent.properties.label,
        content: formComponent.properties.content,
        required: formComponent.properties.required,
        hintText: formComponent.properties.hintText,
        placeholder: formComponent.properties.placeholder,
        isEditing: false,
    };
    
    let previewElement;
    switch (formComponent.properties.controlType) {
        case 'plain-text':
            previewElement = <PlainTextPreview {...commonProps} textElement={formComponent.properties.textElement} />;
            break;
        case 'dropdown':
            previewElement = <DropdownPreview {...commonProps} />;
            break;
        case 'radio-buttons':
            previewElement = <RadioButtonsPreview {...commonProps} />;
            break;
        case 'link':
            previewElement = <LinkPreview {...commonProps} />;
            break;
        case 'text-input':
        default:
            previewElement = <TextInputPreview {...commonProps} />;
            break;
    }
    return <div style={{ pointerEvents: 'none', opacity: 0.85 }}>{previewElement}</div>;
  }
  
  return null;
};