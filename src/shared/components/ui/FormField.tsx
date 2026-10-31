import type { ReactNode } from 'react';
import { AlertCircleIcon } from '@/shared/components/icons';
import styles from './FormField.module.css';

interface FormFieldProps {
    id: string;
    label: string;
    required?: boolean;
    /** Shown inside the input, on the left. */
    icon?: ReactNode;
    /** Shown instead of the hint when present. */
    error?: string | false;
    hint?: ReactNode;
    children: ReactNode;
}

/** Label, input (with optional icon) and an error or hint below it. The input must use `id`. */
export default function FormField({ id, label, required, icon, error, hint, children }: FormFieldProps) {
    return (
        <div className={styles.field}>
            <label htmlFor={id} className={styles.label}>
                {label} {required && <span className={styles.required}>*</span>}
            </label>
            <div className={icon ? `${styles.control} ${styles.withIcon}` : styles.control}>
                {icon && <span className={styles.icon}>{icon}</span>}
                {children}
            </div>
            {error ? (
                <div id={`${id}-error`} className={styles.error} role="alert">
                    <AlertCircleIcon size={13} />
                    {error}
                </div>
            ) : (
                hint && (
                    <div id={`${id}-hint`} className={styles.hint}>
                        {hint}
                    </div>
                )
            )}
        </div>
    );
}
