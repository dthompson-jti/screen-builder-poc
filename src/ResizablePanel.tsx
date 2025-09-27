// src/ResizablePanel.tsx
import React, { useState, useCallback, useRef } from 'react';

interface ResizablePanelProps {
  initialWidth: number;
  minWidth?: number;
  children: React.ReactNode;
  position?: 'left' | 'right';
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  initialWidth,
  minWidth = 200,
  children,
  position = 'left',
}) => {
  const [width, setWidth] = useState(initialWidth);
  const isResizing = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const startX = e.clientX;
    const startWidth = panelRef.current?.offsetWidth ?? width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (isResizing.current) {
        const deltaX = moveEvent.clientX - startX;
        const newWidth = position === 'left' 
          ? startWidth + deltaX 
          : startWidth - deltaX;
        setWidth(Math.max(minWidth, newWidth));
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [minWidth, width, position]);

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

  return (
    <div
      ref={panelRef}
      style={{
        display: 'flex',
        width: `${width}px`,
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        {children}
      </div>
      <div
        className="resizer"
        style={resizerStyle}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};