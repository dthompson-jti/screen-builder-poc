// src/components/Modal.tsx
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string | number;
  height?: string | number;
}

const Modal: React.FC<ModalProps> & {
  Header: React.FC<React.PropsWithChildren<unknown>>;
  Content: React.FC<React.PropsWithChildren<unknown>>;
  Footer: React.FC<React.PropsWithChildren<unknown>>;
} = ({ isOpen, onClose, children, width = 'auto', height = 'auto' }) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop" />
        <Dialog.Content 
          className="modal-container" 
          style={{ width, height }}
          onEscapeKeyDown={onClose}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const ModalHeader: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => (
  <div className="modal-header">{children}</div>
);

const ModalContent: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => (
  <div className="modal-content">{children}</div>
);

const ModalFooter: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => (
  <div className="modal-footer">{children}</div>
);

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;

export { Modal };