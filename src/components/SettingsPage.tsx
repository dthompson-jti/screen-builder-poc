// src/components/SettingsPage.tsx
import { useMemo, useRef } from 'react'; // FIX: Import useRef
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
    
    // FIX: Create a ref for the scrollable container
    const contentContainerRef = useRef<HTMLDivElement>(null);
    
    const sectionIds = useMemo(() => settingsData.map(s => s.id), []);
    
    // FIX: Pass the container ref to the hook
    const activeSectionId = useScrollSpy(sectionIds, { 
      root: contentContainerRef.current, // Observe within the container
      rootMargin: '-20% 0px -75% 0px',
      threshold: 0
    }, contentContainerRef);


    return (
        <div className="settings-page-wrapper">
            {showNavigator && (
                <SettingsNavigator sections={settingsData} activeSectionId={activeSectionId} />
            )}
            {/* FIX: Attach the ref to the div */}
            <div ref={contentContainerRef} className="settings-content-container">
                <SettingsForm layout={layoutMode} />
            </div>
        </div>
    );
};