// src/features/Settings/SettingsPage.tsx
import { useMemo, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { settingsLayoutModeAtom, screenTypeAtom } from '../../data/atoms';
import { SettingsNavigator } from './SettingsNavigator';
import { SettingsForm } from './SettingsForm';
import { settingsData } from '../../data/settingsMock';
import { useScrollSpy } from '../../data/useScrollSpy';
import { FullScreenPlaceholder } from '../../components/FullScreenPlaceholder';
import { screenTypeConfig } from '../../data/screenTypeConfig';
import styles from './SettingsPage.module.css';

export const SettingsPage = () => {
    const layoutMode = useAtomValue(settingsLayoutModeAtom);
    const screenType = useAtomValue(screenTypeAtom);
    const isTwoColumn = layoutMode === 'two-column';

    const contentContainerRef = useRef<HTMLDivElement>(null);

    const sectionIds = useMemo(() => settingsData.map(s => s.id), []);

    const activeSectionId = useScrollSpy(
      isTwoColumn ? [] : sectionIds,
      {
        root: contentContainerRef.current,
        rootMargin: '-20% 0px -75% 0px',
        threshold: 0
      },
      contentContainerRef
    );

    const wrapperClasses = `${styles.settingsPageWrapper} ${isTwoColumn ? styles.twoColumnLayout : styles.singleColumnLayout}`;

    const renderForm = () => (
      <SettingsForm layout={isTwoColumn ? 'two-column' : 'single-column'} />
    );

    const renderContent = () => {
      if (screenType === 'case-init') {
        if (isTwoColumn) {
          return (
            <div className={styles.settingsFrame}>
              {renderForm()}
            </div>
          );
        }
        return renderForm();
      }
      
      const config = screenTypeConfig[screenType];
      return (
        <FullScreenPlaceholder
          icon="settings"
          title={`${config.label} Settings`}
          message={`Configuration for the ${config.label} screen type is not yet available.`}
        />
      );
    };

    return (
        <div className={wrapperClasses}>
            {!isTwoColumn && screenType === 'case-init' && (
                <SettingsNavigator sections={settingsData} activeSectionId={activeSectionId} />
            )}
            <div ref={contentContainerRef} className={styles.settingsContentContainer}>
                {renderContent()}
            </div>
        </div>
    );
};