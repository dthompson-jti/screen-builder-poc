// src/features/Editor/renderers/types.ts
import { FormComponent, LayoutComponent } from '../../../types';
import { EditableProps } from '../../../data/useEditable';

export type RendererMode = 'canvas' | 'preview';

export interface RendererProps<T extends FormComponent | LayoutComponent> {
  component: T;
  mode: RendererMode;
}

export interface FormRendererProps<T extends FormComponent> extends RendererProps<T> {
  editableProps?: EditableProps<HTMLInputElement | HTMLTextAreaElement>;
}