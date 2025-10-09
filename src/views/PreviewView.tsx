// src/views/PreviewView.tsx
// NEW FILE
import React from 'react';
import { useAtomValue } from 'jotai';
import { previewModeAtom, previewWidthAtom } from '../data/atoms';
import { PreviewToolbar } from '../components/PreviewToolbar';
import { FormRenderer } from '../components/FormRenderer';
import styles from './PreviewView.module.css';

export const PreviewView = () => {
  const mode = useAtomValue(previewModeAtom);
  const width = useAtomValue(previewWidthAtom);

  const canvasStyle: React.CSSProperties =
    mode === 'web' ? { maxWidth: `${width}px`, width: '100%' } : {};

  return (
    <div className={styles.previewWrapper}>
      <PreviewToolbar />
      <div className={`${styles.canvasContainer} ${styles[mode]}`}>
        <div className={styles.formFrame} style={canvasStyle}>
          <FormRenderer />
        </div>
      </div>
    </div>
  );
};