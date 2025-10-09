// src/components/PreviewToolbar.tsx
// NEW FILE
import React from 'react';
import { useAtom } from 'jotai';
import { previewModeAtom, previewWidthAtom, PreviewMode } from '../data/atoms';
import styles from './PreviewToolbar.module.css';

const PRESETS = [
  { id: 'mobile', icon: 'smartphone', width: 390, label: 'Mobile' },
  { id: 'tablet', icon: 'tablet_mac', width: 768, label: 'Tablet' },
  { id: 'laptop', icon: 'laptop_mac', width: 1280, label: 'Laptop' },
];

export const PreviewToolbar = () => {
  const [mode, setMode] = useAtom(previewModeAtom);
  const [width, setWidth] = useAtom(previewWidthAtom);

  const handleModeChange = (newMode: PreviewMode) => {
    setMode(newMode);
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value, 10);
    if (!isNaN(newWidth)) {
      setWidth(newWidth);
    }
  };

  const handlePresetClick = (presetWidth: number) => {
    setWidth(presetWidth);
  };

  return (
    <div className={styles.previewToolbar}>
      <div className={styles.toolbarGroup}>
        <button
          className={`btn btn-secondary ${mode === 'desktop' ? 'active' : ''}`}
          onClick={() => handleModeChange('desktop')}
        >
          <span className="material-symbols-rounded">desktop_windows</span>
          Desktop
        </button>
        <button
          className={`btn btn-secondary ${mode === 'web' ? 'active' : ''}`}
          onClick={() => handleModeChange('web')}
        >
          <span className="material-symbols-rounded">public</span>
          Web
        </button>
      </div>

      {mode === 'web' && (
        <>
          <div className={styles.verticalDivider} />
          <div className={styles.toolbarGroup}>
            {PRESETS.map(p => (
              <button
                key={p.id}
                className={`btn btn-secondary icon-only ${width === p.width ? 'active' : ''}`}
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
              value={width}
              onChange={handleWidthChange}
              aria-label="Preview width"
            />
            <span className={styles.widthInputUnit}>px</span>
          </div>
        </>
      )}
    </div>
  );
};