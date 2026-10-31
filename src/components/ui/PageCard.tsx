import type { ReactNode } from 'react';
import styles from './PageCard.module.css';

interface PageCardProps {
    title: string;
    /** Shown as a badge next to the title. */
    count?: number;
    actions?: ReactNode;
    children: ReactNode;
}

/** White card that holds a page's list: title, count badge and actions on top. */
export default function PageCard({ title, count, actions, children }: PageCardProps) {
    return (
        <section className={styles.card}>
            <div className={styles.header}>
                <div className={styles.heading}>
                    <h1 className={styles.title}>{title}</h1>
                    {count !== undefined && <span className={styles.count}>{count}</span>}
                </div>
                {actions && <div className={styles.actions}>{actions}</div>}
            </div>
            {children}
        </section>
    );
}
