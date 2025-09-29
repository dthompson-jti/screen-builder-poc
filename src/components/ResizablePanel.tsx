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
  
  const currentVisibility = useAtomValue(isComponentBrowserVisibleAtom);
  const isLeftPanelHidden = position === 'left' && !isAnimatedVisible;

  React.useEffect(() => {
    if (onWidthChange && !isLeftPanelHidden) {
      onWidthChange(width);
    }
  }, [width, onWidthChange, isLeftPanelHidden]);


  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isLeftPanelHidden) return;
    
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
          if (newWidth < minWidth && currentVisibility) {
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
  }, [minWidth, width, position, onWidthChange, currentVisibility, isLeftPanelHidden]);

  const resizerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '5px',
    cursor: 'col-resize',
    zIndex: 100,
  };

  if (position === 'left') {
    resizerStyle.right = 0;
  } else {
    resizerStyle.left = 0;
  }
  
  const wrapperStyle: React.CSSProperties = {
    width: isLeftPanelHidden ? '0px' : `${width}px`,
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
          transform: isLeftPanelHidden ? `translateX(-${width}px)` : 'translateX(0)',
          transition: 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
      {!isLeftPanelHidden && (
        <div
          className="resizer"
          style={resizerStyle}
          onMouseDown={handleMouseDown}
        />
      )}
    </div>
  );
};