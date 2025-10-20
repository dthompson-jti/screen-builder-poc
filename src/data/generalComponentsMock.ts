// src/data/generalComponentsMock.ts
import { ComponentGroup } from '../types';

export const generalComponents: ComponentGroup[] = [
  {
    title: 'Layout',
    components: [
      { id: 'layout-container', name: 'Layout Container', type: 'layout', icon: 'view_quilt' },
    ],
  },
  {
    title: 'Content',
    components: [
      { id: 'heading', name: 'Heading', type: 'widget', icon: 'title' },
      { id: 'paragraph', name: 'Paragraph', type: 'widget', icon: 'notes' },
      { id: 'link', name: 'Link', type: 'widget', icon: 'link' },
    ],
  },
  {
    title: 'Form Fields',
    components: [
      { id: 'text-input', name: 'Text Input', type: 'widget', icon: 'text_fields' },
      { id: 'dropdown', name: 'Dropdown', type: 'widget', icon: 'arrow_drop_down_circle' },
      { id: 'checkbox', name: 'Checkbox', type: 'widget', icon: 'check_box' },
      { id: 'radio-buttons', name: 'Radio Buttons', type: 'widget', icon: 'radio_button_checked' },
    ],
  },
];