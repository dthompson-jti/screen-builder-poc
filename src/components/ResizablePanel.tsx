// src/components/ResizablePanel.tsx
import React, { useState, useCallback, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { isComponentBrowserVisibleAtom } from '../state/atoms';

interface ResizablePanelProps {
  initialWidth: number;
  minWidth?: number;
  children: React.ReactNode;
  position?: 'left' | 'right';
  isAnimatedVisible?: boolean; 
  onWidthChange?: (width: number) => void;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  initialWidth,
  minWidth = 200,
  children,
  position = 'left',
  isAnimatedVisible = true, 
  onWidthChange,
}) => {
  const [width, setWidth] = useState(initialWidth);
  const isResizing = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // This atom is only for the left panel logic.
  const isLeftPanelBrowserVisible = useAtomValue(isComponentBrowserVisibleAtom);
  const isPanelHidden = !isAnimatedVisible;

  React.useEffect(() => {
    if (onWidthChange && !isPanelHidden) {
      onWidthChange(width);
    }
  }, [width, onWidthChange, isPanelHidden]);


  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isPanelHidden) return;
    
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const startX = e.clientX;
    const startWidth = panelRef.current?.offsetWidth ?? width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (isResizing.current) {
        const deltaX = moveEvent.clientX - startX;
        let newWidth;
        
        if (position === 'left') {
          newWidth = startWidth + deltaX;
          if (newWidth < minWidth && isLeftPanelBrowserVisible) {
             newWidth = minWidth;
          }
        } else {
          newWidth = startWidth - deltaX;
          if (newWidth < minWidth) {
             newWidth = minWidth;
          }
        }
        
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      if (onWidthChange) {
        onWidthChange(width);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [minWidth, width, position, onWidthChange, isLeftPanelBrowserVisible, isPanelHidden]);

  const resizerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    // FIX: Resizer is now 1px wide
    width: '1px',
    cursor: 'col-resize',
    zIndex: 100,
  };

  if (position === 'left') {
    resizerStyle.right = 0;
  } else {
    resizerStyle.left = 0;
  }
  
  const wrapperStyle: React.CSSProperties = {
    width: isPanelHidden ? '0px' : `${width}px`,
    position: 'relative',
    flexShrink: 0,
    overflow: 'hidden',
    transition: 'width 0.3s ease-out',
  };

  return (
    <div
      ref={panelRef}
      style={wrapperStyle}
    >
      <div 
        style={{ 
          width: `${width}px`, 
          flex: 1, 
          minWidth: 0, 
          height: '100%',
          transform: isPanelHidden ? `translateX(-${width}px)` : 'translateX(0)',
          transition: 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
      {!isPanelHidden && (
        <div
          className="resizer"
          style={resizerStyle}
          onMouseDown={handleMouseDown}
        />
      )}
    </div>
  );
};