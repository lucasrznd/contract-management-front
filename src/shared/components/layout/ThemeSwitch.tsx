import { MoonIcon, SunIcon } from '@/shared/components/icons';
import { useTheme } from '@/shared/theme/ThemeProvider';
import styles from './ThemeSwitch.module.css';

/** Light/dark switch from the sidenav footer; the label is hidden when the sidenav is collapsed. */
export default function ThemeSwitch({ showLabel }: { showLabel: boolean }) {
    const { theme, uiTheme, toggleTheme } = useTheme();
    const isDark = uiTheme === 'dark';
    const actionLabel = isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro';

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label={actionLabel}
            title={actionLabel}
            className={showLabel ? styles.switch : `${styles.switch} ${styles.iconOnly}`}
            onClick={(event) => toggleTheme(event.currentTarget)}
        >
            {showLabel && <span>{theme === 'dark' ? 'Tema escuro' : 'Tema claro'}</span>}
            <span className={isDark ? `${styles.track} ${styles.on}` : styles.track} aria-hidden="true">
                <span className={styles.knob}>
                    <SunIcon size={14} className={styles.sun} />
                    <MoonIcon size={13} className={styles.moon} />
                </span>
            </span>
        </button>
    );
}
