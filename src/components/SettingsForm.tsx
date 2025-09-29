// src/components/SettingsForm.tsx
// FIX: Remove unused React import
import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { formNameAtom, focusIntentAtom } from '../state/atoms';
import { settingsData, SettingsSection, SettingsField } from '../data/settingsMock';
import './SettingsPage.css';

// Generic field renderer
const renderGenericField = (field: SettingsField) => {
  const label = (
    <label htmlFor={field.id}>
      {field.label}
      {field.required && <span className="required-asterisk"> *</span>}
    </label>
  );

  switch (field.type) {
    case 'checkbox':
      return (
        <div key={field.id} className="form-field-checkbox">
          <input type="checkbox" id={field.id} />
          {label}
        </div>
      );
    case 'text':
      return (
        <div key={field.id} className="form-field">
          {label}
          <input type="text" id={field.id} placeholder={field.placeholder} />
        </div>
      );
    case 'textarea':
      return (
        <div key={field.id} className="form-field">
          {label}
          <textarea id={field.id} placeholder={field.placeholder} />
        </div>
      );
    case 'select':
      return (
        <div key={field.id} className="form-field">
          {label}
          <select id={field.id}>
            {field.placeholder && <option value="">{field.placeholder}</option>}
            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      );
    default:
      return null;
  }
};


export const SettingsForm = ({ layout }: { layout: 'single-column' | 'two-column' }) => {
  const [formName, setFormName] = useAtom(formNameAtom);
  const [focusIntent, setFocusIntent] = useAtom(focusIntentAtom);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusIntent === 'form-name-input' && nameInputRef.current) {
      nameInputRef.current.focus();
      setFocusIntent(null);
    }
  }, [focusIntent, setFocusIntent]);

  return (
    <div className="settings-form-container" data-layout={layout}>
      {settingsData.map((section: SettingsSection) => (
        <section key={section.id} id={section.id} className="settings-section">
          <h2>{section.title}</h2>
          <div className="settings-form-grid">
            {section.fields.map(field => {
              if (field.id === 'name') {
                return (
                  <div key={field.id} className="form-field">
                    <label htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="required-asterisk"> *</span>}
                    </label>
                    <input
                      ref={nameInputRef}
                      id="form-name-input"
                      type="text"
                      placeholder={field.placeholder}
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>
                );
              }
              return renderGenericField(field);
            })}
          </div>
        </section>
      ))}
    </div>
  );
};