// src/components/ToastContainer.tsx
import { useAtomValue } from 'jotai';
import * as RadixToast from '@radix-ui/react-toast';
import { toastsAtom } from '../data/toastAtoms';
import { Toast } from './Toast';

export const ToastContainer = () => {
  const toasts = useAtomValue(toastsAtom);

  return (
    <>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
      <RadixToast.Viewport className="toast-viewport" />
    </>
  );
};