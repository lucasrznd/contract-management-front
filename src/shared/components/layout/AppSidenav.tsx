import { useEffect, useRef, useState, type ComponentType } from 'react';
import { Link, NavLink } from 'react-router';
import {
    BuildingIcon,
    FolderIcon,
    MenuIcon,
    SidebarToggleIcon,
    UsersIcon,
    type IconProps,
} from '@/shared/components/icons';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import BrandLogo from './BrandLogo';
import ThemeSwitch from './ThemeSwitch';
import styles from './AppSidenav.module.css';

const navItems: { to: string; label: string; icon: ComponentType<IconProps> }[] = [
    { to: '/contratos', label: 'Contratos', icon: FolderIcon },
    { to: '/empresas', label: 'Empresas', icon: BuildingIcon },
    { to: '/vendedores', label: 'Vendedores', icon: UsersIcon },
];

const COLLAPSED_KEY = 'egc-nav';
// Keep in sync with the media queries in AppSidenav.module.css and AppLayout.module.css.
export const MOBILE_QUERY = '(max-width: 767px)';
const DRAWER_ID = 'app-sidenav';

function readCollapsed() {
    try {
        return localStorage.getItem(COLLAPSED_KEY) === '0';
    } catch {
        return false;
    }
}

function cx(...classes: (string | false | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}

/**
 * Main navigation: a sidebar that collapses to icons on desktop, and an off-canvas drawer
 * opened from a top bar on small screens.
 */
export default function AppSidenav() {
    const isMobile = useMediaQuery(MOBILE_QUERY);
    const [collapsed, setCollapsed] = useState(readCollapsed);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const asideRef = useRef<HTMLElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    const isDrawerOpen = isMobile && drawerOpen;
    // The drawer always shows labels; only the desktop sidebar collapses.
    const expanded = isMobile || !collapsed;

    const toggleCollapsed = () => {
        const next = !collapsed;
        setCollapsed(next);
        try {
            localStorage.setItem(COLLAPSED_KEY, next ? '0' : '1');
        } catch {
            // Storage blocked: the choice lasts for this visit.
        }
    };

    const closeDrawer = () => setDrawerOpen(false);

    // A closed drawer stays in the DOM (for its slide-in) but must not be reachable by keyboard or screen readers.
    // React 18 doesn't know the `inert` attribute, so it's set on the element directly.
    useEffect(() => {
        if (asideRef.current) asideRef.current.inert = isMobile && !drawerOpen;
    }, [isMobile, drawerOpen]);

    useEffect(() => {
        if (!isDrawerOpen) return;

        const menuButton = menuButtonRef.current;
        const { overflow } = document.body.style;
        document.body.style.overflow = 'hidden';
        asideRef.current?.querySelector<HTMLElement>('a, button')?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setDrawerOpen(false);
        };
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = overflow;
            document.removeEventListener('keydown', onKeyDown);
            menuButton?.focus();
        };
    }, [isDrawerOpen]);

    const toggleLabel = isMobile ? 'Fechar menu' : collapsed ? 'Expandir menu' : 'Recolher menu';

    return (
        <>
            {isMobile && (
                <header className={styles.topbar}>
                    <button
                        ref={menuButtonRef}
                        type="button"
                        className={styles.menuButton}
                        aria-label="Abrir menu"
                        aria-expanded={isDrawerOpen}
                        aria-controls={DRAWER_ID}
                        onClick={() => setDrawerOpen(true)}
                    >
                        <MenuIcon size={20} />
                    </button>
                    <Link to="/" className={styles.topbarBrand}>
                        <BrandLogo className={styles.topbarLogo} />
                    </Link>
                </header>
            )}

            {isMobile && (
                <div
                    className={cx(styles.overlay, isDrawerOpen && styles.overlayVisible)}
                    onClick={closeDrawer}
                    aria-hidden="true"
                />
            )}

            <aside
                ref={asideRef}
                id={DRAWER_ID}
                aria-label="Menu principal"
                className={cx(
                    styles.sidenav,
                    !expanded && styles.collapsed,
                    isMobile && styles.drawer,
                    isDrawerOpen && styles.drawerOpen,
                )}
            >
                <div className={styles.brandRow}>
                    <Link to="/" className={styles.brand} onClick={closeDrawer}>
                        <BrandLogo className={styles.logo} />
                    </Link>
                </div>

                <nav className={styles.nav} aria-label="Principal">
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            title={expanded ? undefined : label}
                            aria-label={expanded ? undefined : label}
                            className={({ isActive }) => cx(styles.item, isActive && styles.active)}
                            onClick={closeDrawer}
                        >
                            <Icon size={18} className={styles.itemIcon} />
                            {expanded && <span>{label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className={styles.footer}>
                    <ThemeSwitch showLabel={expanded} />
                    <button
                        type="button"
                        className={styles.item}
                        title={toggleLabel}
                        aria-label={toggleLabel}
                        onClick={isMobile ? closeDrawer : toggleCollapsed}
                    >
                        <SidebarToggleIcon size={18} className={cx(styles.itemIcon, styles.toggleIcon)} />
                        {expanded && <span>{isMobile ? 'Fechar menu' : 'Recolher menu'}</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
