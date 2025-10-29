// src/components/Toast.tsx
import React from 'react';
import * as RadixToast from '@radix-ui/react-toast';
import { Toast as ToastType } from '../data/toastAtoms';

interface ToastProps {
  toast: ToastType;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  return (
    <RadixToast.Root className="toast-root">
      <span className="material-symbols-rounded">{toast.icon}</span>
      <RadixToast.Description>{toast.message}</RadixToast.Description>
    </RadixToast.Root>
  );
};