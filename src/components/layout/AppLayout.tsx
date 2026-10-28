import { Suspense, useEffect, useRef } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Outlet, useLocation } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import AppMenu from '../menu/AppMenu';
import AppFooter from '../footer/AppFooter';
import RouteErrorBoundary from './RouteErrorBoundary';

export default function AppLayout() {
    const { pathname, key } = useLocation();
    const mainRef = useRef<HTMLElement>(null);
    const lastKey = useRef(key);

    // Without full page reloads, reset scroll and focus like a fresh page load would.
    // Moving focus off the menu also clears the focus highlight MegaMenu leaves on its first item.
    useEffect(() => {
        if (lastKey.current === key) return;
        lastKey.current = key;
        window.scrollTo(0, 0);
        mainRef.current?.focus({ preventScroll: true });
    }, [key]);

    return (
        <HelmetProvider>
            <div>
                <AppMenu />

                <main ref={mainRef} tabIndex={-1} style={{ outline: 'none' }}>
                    {/* Keyed by path so navigating away from a failed page clears the error. */}
                    <RouteErrorBoundary key={pathname}>
                        <Suspense
                            fallback={
                                <div className="flex align-items-center justify-content-center py-8">
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
        </HelmetProvider>
    );
}
