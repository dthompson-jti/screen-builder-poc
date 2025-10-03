// src/components/FullScreenPlaceholder.tsx
import React from 'react';
import styles from './FullScreenPlaceholder.module.css'; // <--- CORRECTED IMPORT

interface FullScreenPlaceholderProps {
  icon: string;
  title: string;
  message: string;
}

export const FullScreenPlaceholder: React.FC<FullScreenPlaceholderProps> = ({ icon, title, message }) => {
  return (
    <div className={styles.fullscreenPlaceholderWrapper}>
      <div className={styles.fullscreenPlaceholderCard}>
        {/* The material-symbols-rounded class is global, so it doesn't need 'styles.' prefix */}
        <span className="material-symbols-rounded">{icon}</span>
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </div>
  );
};