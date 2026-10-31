import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
    icon: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    /** primary: nothing registered yet · neutral: nothing matched · danger: something failed. */
    tone?: 'primary' | 'neutral' | 'danger';
}

export default function EmptyState({ icon, title, description, action, tone = 'primary' }: EmptyStateProps) {
    return (
        <div className={`${styles.root} ${styles[tone]}`}>
            <div className={styles.icon}>{icon}</div>
            <h2 className={styles.title}>{title}</h2>
            {description && <p className={styles.description}>{description}</p>}
            {action && <div className={styles.action}>{action}</div>}
        </div>
    );
}
