// src/components/SettingsPage.tsx
import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { settingsLayoutModeAtom } from '../state/atoms';
import { SettingsNavigator } from './SettingsNavigator';
import { SettingsForm } from './SettingsForm';
import { settingsData } from '../data/settingsMock';
import { useScrollSpy } from './useScrollSpy';
import './SettingsPage.css';

export const SettingsPage = () => {
    const layoutMode = useAtomValue(settingsLayoutModeAtom);
    const showNavigator = layoutMode === 'single-column';
    
    const sectionIds = useMemo(() => settingsData.map(s => s.id), []);
    
    const activeSectionId = useScrollSpy(sectionIds, { 
      rootMargin: '-20% 0px -80% 0px',
      threshold: 0
    });

    return (
        <div className="settings-page-wrapper">
            {showNavigator && (
                <SettingsNavigator sections={settingsData} activeSectionId={activeSectionId} />
            )}
            <div className="settings-content-container">
                <SettingsForm layout={layoutMode} />
            </div>
        </div>
    );
};