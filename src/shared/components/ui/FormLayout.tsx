import type { ReactNode } from 'react';
import styles from './FormLayout.module.css';

/** Two columns that collapse to one on narrow screens. `wide` children span both. */
export function FormGrid({ children }: { children: ReactNode }) {
    return <div className={styles.grid}>{children}</div>;
}

export function FormWide({ children }: { children: ReactNode }) {
    return <div className={styles.wide}>{children}</div>;
}

/** Titled group of fields inside a modal ("Endereço", "Pagamento"...). */
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className={styles.section}>
            <h3 className={styles.title}>{title}</h3>
            {children}
        </section>
    );
}
