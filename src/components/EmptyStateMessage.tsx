// src/components/EmptyStateMessage.tsx
import styles from './EmptyStateMessage.module.css';

interface EmptyStateMessageProps {
  query: string;
}

export const EmptyStateMessage = ({ query }: EmptyStateMessageProps) => {
  return (
    <div className={styles.emptyStateContainer}>
      <span className={`material-symbols-rounded ${styles.placeholderIcon}`}>search_off</span>
      <p className={styles.emptyStateMessage}>
        No results for "<span className={styles.emptyStateQuery}>{query}</span>"
      </p>
    </div>
  );
};