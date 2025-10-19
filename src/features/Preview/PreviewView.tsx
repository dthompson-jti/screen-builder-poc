// src/features/Preview/PreviewView.tsx
import React from 'react';
import { useAtomValue } from 'jotai';
import { isPreviewFluidAtom, previewWidthAtom } from '../../data/atoms';
import { PreviewToolbar } from './PreviewToolbar';
import { FormRenderer } from '../../components/FormRenderer';
import styles from './PreviewView.module.css';

export const PreviewView = () => {
  const isFluid = useAtomValue(isPreviewFluidAtom);
  const width = useAtomValue(previewWidthAtom);

  const canvasStyle: React.CSSProperties =
    isFluid ? { width: '100%', maxWidth: '100%' } : { maxWidth: `${width}px`, width: '100%' };

  return (
    <div className={styles.previewWrapper}>
      <PreviewToolbar />
      <div className={styles.canvasContainer}>
        <div className={styles.formFrame} style={canvasStyle}>
          <FormRenderer />
        </div>
      </div>
    </div>
  );
};