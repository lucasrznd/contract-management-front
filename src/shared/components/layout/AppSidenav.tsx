import { useEffect, useRef, useState, type ForwardRefExoticComponent, type RefAttributes } from 'react';
import { Link, NavLink } from 'react-router';
import { LazyMotion, MotionConfig } from 'motion/react';
import { BriefcaseBusinessIcon } from '@/shared/components/icons/animated/briefcase-business';
import { FilePenLineIcon } from '@/shared/components/icons/animated/file-pen-line';
import { MenuIcon } from '@/shared/components/icons/animated/menu';
import { PanelLeftCloseIcon } from '@/shared/components/icons/animated/panel-left-close';
import { PanelLeftOpenIcon } from '@/shared/components/icons/animated/panel-left-open';
import { UsersIcon } from '@/shared/components/icons/animated/users';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import BrandLogo from './BrandLogo';
import ThemeSwitch from './ThemeSwitch';
import styles from './AppSidenav.module.css';

interface AnimatedIconHandle {
    startAnimation: () => void;
    stopAnimation: () => void;
}

type AnimatedIcon = ForwardRefExoticComponent<
    { size?: number; strokeWidth?: number; className?: string } & RefAttributes<AnimatedIconHandle>
>;

const navItems: { to: string; label: string; icon: AnimatedIcon }[] = [
    { to: '/contratos', label: 'Contratos', icon: FilePenLineIcon },
    { to: '/empresas', label: 'Empresas', icon: BriefcaseBusinessIcon },
    { to: '/vendedores', label: 'Vendedores', icon: UsersIcon },
];

// The icons' animation engine is downloaded after the first render (they show up static until then).
const loadMotionFeatures = () => import('@/shared/components/icons/animated/motionFeatures').then((mod) => mod.default);

// The design's stroke, thinner than lucide's default 2.
const ICON_STROKE = 1.75;

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

/** Plays an animated icon while the pointer is over its whole item, not only over the icon. */
function useIconAnimation() {
    const ref = useRef<AnimatedIconHandle>(null);
    return {
        ref,
        hover: {
            onMouseEnter: () => ref.current?.startAnimation(),
            onMouseLeave: () => ref.current?.stopAnimation(),
        },
    };
}

function NavItem({
    to,
    label,
    icon: Icon,
    expanded,
    onNavigate,
}: (typeof navItems)[number] & { expanded: boolean; onNavigate: () => void }) {
    const { ref, hover } = useIconAnimation();

    return (
        <NavLink
            to={to}
            title={expanded ? undefined : label}
            aria-label={expanded ? undefined : label}
            className={({ isActive }) => cx(styles.item, isActive && styles.active)}
            onClick={onNavigate}
            {...hover}
        >
            <Icon ref={ref} size={18} strokeWidth={ICON_STROKE} className={styles.itemIcon} />
            {expanded && <span>{label}</span>}
        </NavLink>
    );
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
    const menuIcon = useIconAnimation();
    const toggleIcon = useIconAnimation();

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

    // Shows the "open" panel icon only while the desktop sidebar is collapsed.
    const ToggleIcon = !isMobile && collapsed ? PanelLeftOpenIcon : PanelLeftCloseIcon;

    return (
        // Icons skip their animations when the OS asks for reduced motion.
        <MotionConfig reducedMotion="user">
            <LazyMotion features={loadMotionFeatures} strict>
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
                            {...menuIcon.hover}
                        >
                            <MenuIcon ref={menuIcon.ref} size={20} className={styles.menuIcon} />
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
                        {navItems.map((item) => (
                            <NavItem key={item.to} {...item} expanded={expanded} onNavigate={closeDrawer} />
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
                            {...toggleIcon.hover}
                        >
                            <ToggleIcon
                                ref={toggleIcon.ref}
                                size={18}
                                strokeWidth={ICON_STROKE}
                                className={styles.itemIcon}
                            />
                            {expanded && <span>{isMobile ? 'Fechar menu' : 'Recolher menu'}</span>}
                        </button>
                    </div>
                </aside>
            </LazyMotion>
        </MotionConfig>
    );
}
