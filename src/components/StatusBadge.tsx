// src/components/StatusBadge.tsx
// NEW FILE
import { Tooltip } from './Tooltip';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  icon: string;
  tooltip: string;
  variant: 'info'; // Add more variants like 'warning', 'success' as needed
}

export const StatusBadge = ({ icon, tooltip, variant }: StatusBadgeProps) => {
  const badgeClasses = `${styles.badge} ${styles[variant]}`;

  return (
    <Tooltip content={tooltip} side="bottom">
      <div className={badgeClasses}>
        <span className="material-symbols-rounded">{icon}</span>
      </div>
    </Tooltip>
  );
};