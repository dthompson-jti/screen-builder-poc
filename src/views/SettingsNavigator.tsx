// src/components/SettingsNavigator.tsx
import { SettingsSection } from '../data/settingsMock';

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
    <nav className="settings-navigator-container">
      <ul className="settings-navigator-list">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              className={activeSectionId === section.id ? 'active' : ''}
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