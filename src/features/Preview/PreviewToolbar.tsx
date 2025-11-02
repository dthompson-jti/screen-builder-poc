// src/features/Preview/PreviewToolbar.tsx
import React from 'react';
import { useAtom } from 'jotai';
import { isPreviewFluidAtom, previewWidthAtom } from '../../data/atoms';
import { Tooltip } from '../../components/Tooltip';
import { Button } from '../../components/Button';
import { Toggle } from '../../components/Toggle';
import { IconToggleGroup } from '../../components/IconToggleGroup';
import styles from './PreviewToolbar.module.css';

// MODIFIED: Device order is now Desktop -> Tablet -> Mobile
const PRESETS = [
  { value: 'desktop', icon: 'desktop_mac', width: 1280, label: 'Desktop' },
  { value: 'tablet', icon: 'tablet_mac', width: 768, label: 'Tablet' },
  { value: 'mobile', icon: 'smartphone', width: 390, label: 'Mobile' },
];

export const PreviewToolbar = () => {
  const [isFluid, setIsFluid] = useAtom(isPreviewFluidAtom);
  const [width, setWidth] = useAtom(previewWidthAtom);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsFluid(false);
    const newWidth = parseInt(e.target.value, 10);
    if (!isNaN(newWidth)) {
      setWidth(newWidth);
    }
  };

  const handleFitClick = (pressed: boolean) => {
    setIsFluid(pressed);
  };

  const activePresetId = isFluid ? '' : PRESETS.find(p => p.width === width)?.value || '';

  const handlePresetChange = (newId: string) => {
    const selectedPreset = PRESETS.find(p => p.value === newId);
    if (selectedPreset) {
      setIsFluid(false);
      setWidth(selectedPreset.width);
    }
  };

  return (
    <div className={styles.previewToolbar}>
      <div className={styles.toolbarGroup}>
        <Tooltip content="Fit to Window">
          <Toggle asChild pressed={isFluid} onPressedChange={handleFitClick}>
            <Button
              variant="tertiary"
              size="m"
              iconOnly
              aria-label="Fit to Window"
            >
              <span className="material-symbols-rounded">open_in_full</span>
            </Button>
          </Toggle>
        </Tooltip>
        <div className={styles.verticalDivider} />
        <IconToggleGroup
          id="device-presets"
          options={PRESETS}
          value={activePresetId}
          onValueChange={handlePresetChange}
        />
      </div>
      <div className={styles.verticalDivider} />
      <div className={styles.widthInputWrapper}>
        <input
          type="number"
          className={styles.widthInput}
          value={isFluid ? '' : width}
          placeholder={isFluid ? 'Auto' : ''}
          onChange={handleWidthChange}
          disabled={isFluid}
          aria-label="Preview width"
          min="320"
          max="2400"
        />
        <span className={styles.widthInputUnit}>px</span>
      </div>
    </div>
  );
};