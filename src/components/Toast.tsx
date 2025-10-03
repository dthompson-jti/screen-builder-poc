// src/components/Toast.tsx
import { motion } from 'framer-motion';
import { Toast as ToastType } from '../data/toastAtoms';
import styles from './Toast.module.css';

interface ToastProps {
  toast: ToastType;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5, transition: { duration: 0.2 } }}
      className={styles.toastWrapper}
    >
      <span className="material-symbols-rounded">{toast.icon}</span>
      <span>{toast.message}</span>
    </motion.div>
  );
};