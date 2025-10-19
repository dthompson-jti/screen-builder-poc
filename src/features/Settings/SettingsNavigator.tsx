// src/features/Settings/SettingsNavigator.tsx
import { SettingsSection } from '../../data/settingsMock';
import styles from './SettingsPage.module.css';

interface SettingsNavigatorProps {
  sections: SettingsSection[];
  activeSectionId: string;
}

export const SettingsNavigator = ({ sections, activeSectionId }: SettingsNavigatorProps) => {
  
  const handleNavClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className={styles.settingsNavigatorContainer}>
      <ul className={styles.settingsNavigatorList}>
        {sections.map((section) => (
          <li key={section.id}>
            <a
              className={activeSectionId === section.id ? styles.active : ''}
              onClick={() => handleNavClick(section.id)}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};