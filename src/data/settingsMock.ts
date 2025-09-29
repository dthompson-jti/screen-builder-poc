// src/data/settingsMock.ts

export interface SettingsField {
    id: string;
    label: string;
    type: 'text' | 'select' | 'checkbox' | 'textarea';
    placeholder?: string;
    options?: string[];
    required?: boolean;
}

export interface SettingsSection {
    id: string;
    title: string;
    fields: SettingsField[];
}

export const settingsData: SettingsSection[] = [
    {
        id: 'main-settings',
        title: 'Main settings',
        fields: [
            { id: 'name', label: 'Name', type: 'text', placeholder: 'Enter name', required: true },
            { id: 'code', label: 'Code', type: 'text', placeholder: 'Enter code', required: true },
            { id: 'default-save-name', label: 'Default save name', type: 'text', placeholder: 'Enter name', required: true },
            { id: 'custom-title', label: 'Custom Title', type: 'text', placeholder: 'Enter title', required: true },
            { id: 'help-note', label: 'Help Note', type: 'text', placeholder: 'Enter note', required: true },
        ]
    },
    {
        id: 'actions-prompts',
        title: 'Actions & Prompts',
        fields: [
            { id: 'confirm-submit', label: 'Confirm submit', type: 'checkbox' },
            { id: 'save-message', label: 'Save message', type: 'text', placeholder: 'Enter save message', required: true },
            { id: 'confirm-leave-page', label: 'Confirm leave page', type: 'checkbox' },
            { id: 'roa-message', label: 'ROA Message', type: 'select', options: ['Option 1', 'Option 2'], required: true },
        ]
    },
    {
        id: 'layout-display',
        title: 'Layout & Display',
        fields: [
            { id: 'style', label: 'Style', type: 'select', options: ['Normal', 'Compact'], required: true },
            { id: 'double-column', label: 'Double column', type: 'checkbox' },
            { id: 'color', label: 'Color', type: 'select', options: ['Blue', 'Green', 'Red'], required: true, placeholder: 'Select color' },
        ]
    },
    {
        id: 'properties-attributes',
        title: 'Properties & Attributes',
        fields: [
            { id: 'default-form', label: 'Default form', type: 'checkbox' },
            { id: 'hidden-system', label: 'Hidden / System', type: 'checkbox' },
            { id: 'read-only', label: 'Read only', type: 'checkbox' },
            { id: 'api-enabled', label: 'API enabled', type: 'checkbox' },
            { id: 'config-note', label: 'Configuration note', type: 'textarea', placeholder: 'Enter note', required: true },
        ]
    },
    {
        id: 'button-visibility',
        title: 'Button Visibility',
        fields: [
            { id: 'show-save', label: 'Show save button', type: 'checkbox' },
            { id: 'show-save-back', label: 'Show save & back button', type: 'checkbox' },
            { id: 'show-save-add', label: 'Show save & add another button', type: 'checkbox' },
            { id: 'show-session-carry-over', label: 'Show session carry over', type: 'checkbox' },
        ]
    }
];