import type { ReactNode } from 'react';
import styles from './StatusBadge.module.css';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'primary' | 'neutral';

export default function StatusBadge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
    return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}
