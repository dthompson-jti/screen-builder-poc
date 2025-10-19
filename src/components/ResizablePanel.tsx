// src/components/ResizablePanel.tsx
import React, { useState, useCallback, useRef } from 'react';
import styles from './ResizablePanel.module.css';

interface ResizablePanelProps {
  initialWidth: number;
  minWidth?: number;
  children: React.ReactNode;
  position?: 'left' | 'right';
  isAnimatedVisible?: boolean; 
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  initialWidth,
  minWidth = 200,
  children,
  position = 'left',
  isAnimatedVisible = true, 
}) => {
  const [width, setWidth] = useState(initialWidth);
  const isResizing = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const isPanelHidden = !isAnimatedVisible;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isPanelHidden) return;
    
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    if (panelRef.current) {
      panelRef.current.style.transition = 'none';
      const resizer = panelRef.current.querySelector(`.${styles.resizerWrapper}`);
      resizer?.classList.add(styles.active);
    }

    const startX = e.clientX;
    const startWidth = panelRef.current?.offsetWidth ?? width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing.current) return;
      const deltaX = moveEvent.clientX - startX;
      let newWidth = position === 'left' ? startWidth + deltaX : startWidth - deltaX;
      if (newWidth < minWidth) newWidth = minWidth;
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';

      if (panelRef.current) {
        panelRef.current.style.transition = 'width 0.3s ease-out';
        const resizer = panelRef.current.querySelector(`.${styles.resizerWrapper}`);
        resizer?.classList.remove(styles.active);
      }

      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [minWidth, position, isPanelHidden, width]);

  const wrapperStyle: React.CSSProperties = {
    width: isPanelHidden ? '0px' : `${width}px`,
    position: 'relative',
    flexShrink: 0,
    overflow: 'hidden',
    transition: 'width 0.3s ease-out',
  };

  return (
    <div ref={panelRef} style={wrapperStyle}>
      <div 
        style={{ 
          width: `${width}px`, 
          minWidth: 0, 
          height: '100%',
          transform: isPanelHidden ? `translateX(${position === 'left' ? '-' : ''}${width}px)` : 'translateX(0)',
          transition: 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
      {!isPanelHidden && (
        <div
          className={`${styles.resizerWrapper} ${position === 'left' ? styles.resizerRight : styles.resizerLeft}`}
          onMouseDown={handleMouseDown}
        >
          <div className={styles.resizerIndicator} />
        </div>
      )}
    </div>
  );
};