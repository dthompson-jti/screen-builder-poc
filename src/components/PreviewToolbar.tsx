// src/components/PreviewToolbar.tsx
import React from 'react';
import { useAtom } from 'jotai';
import { isPreviewFluidAtom, previewWidthAtom } from '../data/atoms';
import styles from './PreviewToolbar.module.css';

const PRESETS = [
  { id: 'mobile', icon: 'smartphone', width: 390, label: 'Mobile' },
  { id: 'tablet', icon: 'tablet_mac', width: 768, label: 'Tablet' },
  { id: 'desktop', icon: 'desktop_mac', width: 1280, label: 'Desktop' },
];

export const PreviewToolbar = () => {
  const [isFluid, setIsFluid] = useAtom(isPreviewFluidAtom);
  const [width, setWidth] = useAtom(previewWidthAtom);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Typing in the input should automatically deactivate fluid mode
    setIsFluid(false); 
    const newWidth = parseInt(e.target.value, 10);
    if (!isNaN(newWidth)) {
      setWidth(newWidth);
    }
  };

  const handlePresetClick = (presetWidth: number) => {
    setIsFluid(false);
    setWidth(presetWidth);
  };
  
  const handleFitClick = () => {
    setIsFluid(true);
  };

  return (
    <div className={styles.previewToolbar}>
        <div className={styles.toolbarGroup}>
            <button
                className={`btn btn-secondary icon-only ${isFluid ? 'active' : ''}`}
                title="Fit to Window"
                onClick={handleFitClick}
            >
                <span className="material-symbols-rounded">open_in_full</span>
            </button>
            <div className={styles.verticalDivider} />
            {PRESETS.map(p => (
              <button
                key={p.id}
                className={`btn btn-secondary icon-only ${!isFluid && width === p.width ? 'active' : ''}`}
                title={p.label}
                onClick={() => handlePresetClick(p.width)}
              >
                <span className="material-symbols-rounded">{p.icon}</span>
              </button>
            ))}
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
        />
        <span className={styles.widthInputUnit}>px</span>
        </div>
    </div>
  );
};