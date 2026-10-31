import { Suspense, useEffect, useRef } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Outlet, useLocation } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import AppHeader from './AppHeader';
import AppFooter from '../footer/AppFooter';
import RouteErrorBoundary from './RouteErrorBoundary';
import { ToastProvider } from '../ui/toast/ToastProvider';
import styles from './AppLayout.module.css';

export default function AppLayout() {
    const { pathname, key } = useLocation();
    const mainRef = useRef<HTMLElement>(null);
    const lastKey = useRef(key);

    // Without full page reloads, reset scroll and focus like a fresh page load would.
    useEffect(() => {
        if (lastKey.current === key) return;
        lastKey.current = key;
        window.scrollTo(0, 0);
        mainRef.current?.focus({ preventScroll: true });
    }, [key]);

    return (
        <HelmetProvider>
            <ToastProvider>
                <div className={styles.shell}>
                    <AppHeader />

                    <main ref={mainRef} tabIndex={-1} className={styles.main}>
                        {/* Keyed by path so navigating away from a failed page clears the error. */}
                        <RouteErrorBoundary key={pathname}>
                            <Suspense
                                fallback={
                                    <div className={styles.fallback}>
                                        <ProgressSpinner />
                                    </div>
                                }
                            >
                                <Outlet />
                            </Suspense>
                        </RouteErrorBoundary>
                    </main>

                    <AppFooter />
                </div>
            </ToastProvider>
        </HelmetProvider>
    );
}
