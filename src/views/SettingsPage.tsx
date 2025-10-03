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
    const showNavigator = layoutMode === 'single-column';
    
    const contentContainerRef = useRef<HTMLDivElement>(null);
    
    const sectionIds = useMemo(() => settingsData.map(s => s.id), []);
    
    const activeSectionId = useScrollSpy(sectionIds, { 
      root: contentContainerRef.current,
      rootMargin: '-20% 0px -75% 0px',
      threshold: 0
    }, contentContainerRef);


    return (
        <div className={styles.settingsPageWrapper}>
            {showNavigator && (
                <SettingsNavigator sections={settingsData} activeSectionId={activeSectionId} />
            )}
            <div ref={contentContainerRef} className={styles.settingsContentContainer}>
                <SettingsForm layout={layoutMode} />
            </div>
        </div>
    );
};