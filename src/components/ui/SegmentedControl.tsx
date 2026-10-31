import styles from './SegmentedControl.module.css';

interface SegmentedControlProps<T extends string> {
    value: T;
    onChange: (value: T) => void;
    options: { value: T; label: string }[];
    'aria-label': string;
}

/** Pill-shaped tabs for switching between a few modes of the same form. */
export default function SegmentedControl<T extends string>(props: SegmentedControlProps<T>) {
    return (
        <div className={styles.root} role="tablist" aria-label={props['aria-label']}>
            {props.options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    role="tab"
                    aria-selected={option.value === props.value}
                    className={option.value === props.value ? `${styles.option} ${styles.active}` : styles.option}
                    onClick={() => props.onChange(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
