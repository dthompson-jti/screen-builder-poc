// src/views/SettingsPage.tsx
import { useMemo, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { settingsLayoutModeAtom } from '../data/atoms';
import { SettingsNavigator } from './SettingsNavigator';
import { SettingsForm } from './SettingsForm';
import { settingsData } from '../data/settingsMock';
import { useScrollSpy } from '../data/useScrollSpy';
import styles from './SettingsPage.module.css';

export const SettingsPage = () => {
    const layoutMode = useAtomValue(settingsLayoutModeAtom);
    const isTwoColumn = layoutMode === 'two-column';

    const contentContainerRef = useRef<HTMLDivElement>(null);

    const sectionIds = useMemo(() => settingsData.map(s => s.id), []);

    // Only activate the scroll spy in single-column mode
    const activeSectionId = useScrollSpy(
      isTwoColumn ? [] : sectionIds, // Pass empty array to disable observer
      {
        root: contentContainerRef.current,
        rootMargin: '-20% 0px -75% 0px',
        threshold: 0
      },
      contentContainerRef
    );

    const wrapperClasses = `${styles.settingsPageWrapper} ${isTwoColumn ? styles.twoColumnLayout : styles.singleColumnLayout}`;

    return (
        <div className={wrapperClasses}>
            {!isTwoColumn && (
                <SettingsNavigator sections={settingsData} activeSectionId={activeSectionId} />
            )}
            <div ref={contentContainerRef} className={styles.settingsContentContainer}>
                <SettingsForm layout={layoutMode} />
            </div>
        </div>
    );
};