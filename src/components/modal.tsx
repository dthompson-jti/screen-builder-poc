// src/components/Modal.tsx
import React, { useRef, useEffect } from 'react';
import { useOnClickOutside } from '../data/useOnClickOutside';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string | number;
  height?: string | number;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, width = 'auto', height = 'auto' }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(modalRef, onClose);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div 
        ref={modalRef} 
        className="modal-container"
        style={{ width, height }}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
};