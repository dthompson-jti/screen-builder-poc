// src/features/Settings/SettingsForm.tsx
import { useEffect, useRef } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { focusIntentAtom } from '../../data/atoms';
import { formNameAtom } from '../../data/historyAtoms';
import { settingsData, SettingsSection, SettingsField } from '../../data/settingsMock';
import { Select, SelectItem } from '../../components/Select';
import styles from './SettingsPage.module.css';

const renderGenericField = (field: SettingsField) => {
  const label = (
    <label htmlFor={field.id}>
      {field.label}
      {field.required && <span className={styles.requiredAsterisk}> *</span>}
    </label>
  );

  switch (field.type) {
    case 'checkbox':
      return (
        <div key={field.id} className={styles.formFieldCheckbox}>
          <input type="checkbox" id={field.id} />
          {label}
        </div>
      );
    case 'text':
      return (
        <div key={field.id} className={styles.formField}>
          {label}
          <input type="text" id={field.id} placeholder={field.placeholder} />
        </div>
      );
    case 'textarea':
      return (
        <div key={field.id} className={styles.formField}>
          {label}
          <textarea id={field.id} placeholder={field.placeholder} />
        </div>
      );
    case 'select':
      return (
        <div key={field.id} className={styles.formField}>
          {label}
          <Select value="" onValueChange={() => {}} placeholder={field.placeholder}>
            {field.options?.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </Select>
        </div>
      );
    default:
      return null;
  }
};

export const SettingsForm = ({ layout }: { layout: 'single-column' | 'two-column' }) => {
  const formName = useAtomValue(formNameAtom);
  const [focusIntent, setFocusIntent] = useAtom(focusIntentAtom);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusIntent === 'form-name-input' && nameInputRef.current) {
      nameInputRef.current.focus();
      setFocusIntent(null);
    }
  }, [focusIntent, setFocusIntent]);

  return (
    <div className={styles.settingsFormContainer} data-layout={layout}>
      {settingsData.map((section: SettingsSection) => (
        <section key={section.id} id={section.id} className={styles.settingsSection}>
          <h2>{section.title}</h2>
          <div className={styles.settingsFormGrid}>
            {section.fields.map((field: SettingsField) => {
              if (field.id === 'name') {
                return (
                  <div key={field.id} className={styles.formField}>
                    <label htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className={styles.requiredAsterisk}> *</span>}
                    </label>
                    <input
                      ref={nameInputRef}
                      id="form-name-input"
                      type="text"
                      placeholder={field.placeholder}
                      value={formName}
                      readOnly // This input is for display/focus only
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