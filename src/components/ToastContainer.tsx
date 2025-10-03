// src/components/ToastContainer.tsx
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { AnimatePresence } from 'framer-motion';
import { toastsAtom } from '../data/toastAtoms';
import { Toast } from './Toast';
import styles from './ToastContainer.module.css';

const TOAST_TIMEOUT = 4000; // 4 seconds

export const ToastContainer = () => {
  const [toasts, setToasts] = useAtom(toastsAtom);

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        // Remove the oldest toast
        setToasts(currentToasts => currentToasts.slice(1));
      }, TOAST_TIMEOUT);

      return () => clearTimeout(timer);
    }
  }, [toasts, setToasts]);

  return (
    <div className={styles.toastContainer}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};