// src/features/Preview/PreviewView.tsx
// MODIFIED FILE
import React, { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { isPreviewFluidAtom, previewWidthAtom } from '../../data/atoms';
import { canvasComponentsByIdAtom, rootComponentIdAtom } from '../../data/historyAtoms';
import { PreviewToolbar } from './PreviewToolbar';
import { FormRenderer } from '../../components/FormRenderer';
import { FullScreenPlaceholder } from '../../components/FullScreenPlaceholder';
import styles from './PreviewView.module.css';

export const PreviewView = () => {
  const isFluid = useAtomValue(isPreviewFluidAtom);
  const width = useAtomValue(previewWidthAtom);
  const allComponents = useAtomValue(canvasComponentsByIdAtom);
  const rootId = useAtomValue(rootComponentIdAtom);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const rootComponent = allComponents[rootId];
  // MODIFIED: Add type guard to safely access children property.
  const isCanvasEmpty =
    !rootComponent ||
    (rootComponent.componentType === 'layout' && rootComponent.children.length === 0);

  const canvasStyle: React.CSSProperties = isFluid
    ? { width: '100%', maxWidth: '100%' }
    : { maxWidth: `${width}px`, width: '100%' };

  useEffect(() => {
    // Scroll to top when switching to preview mode
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, []);

  return (
    <div className={styles.previewWrapper}>
      <PreviewToolbar />
      <div className={styles.canvasContainer} ref={scrollContainerRef}>
        {isCanvasEmpty ? (
          <FullScreenPlaceholder
            icon="visibility"
            title="Nothing to Preview"
            message="Add components to the screen in the Editor view to see them here."
          />
        ) : (
          <div className={styles.formFrame} style={canvasStyle}>
            <FormRenderer />
          </div>
        )}
      </div>
    </div>
  );
};