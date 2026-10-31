import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react';
import { Toast } from 'primereact/toast';
import { AlertCircleIcon, CheckIcon } from '@/shared/components/icons';
import styles from './Toast.module.css';

type ToastSeverity = 'success' | 'error';

interface ToastApi {
    success: (message: string) => void;
    error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** A single app-wide toast in the design's style (dark, bottom center). */
export function ToastProvider({ children }: { children: ReactNode }) {
    const toast = useRef<Toast>(null);

    const show = useCallback((severity: ToastSeverity, message: string) => {
        toast.current?.replace({
            severity,
            life: severity === 'error' ? 5000 : 2600,
            content: (
                <div className={styles.content} role={severity === 'error' ? 'alert' : 'status'}>
                    {severity === 'error' ? (
                        <AlertCircleIcon className={styles.errorIcon} />
                    ) : (
                        <CheckIcon className={styles.successIcon} />
                    )}
                    {message}
                </div>
            ),
        });
    }, []);

    const api = useMemo<ToastApi>(
        () => ({
            success: (message) => show('success', message),
            error: (message) => show('error', message),
        }),
        [show],
    );

    return (
        <ToastContext.Provider value={api}>
            {children}
            <Toast
                ref={toast}
                position="bottom-center"
                className={styles.toast}
                // PrimeReact pins the toast 20px from the edge with an inline style.
                pt={{ root: { style: { bottom: 24 } } }}
            />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used inside <ToastProvider>.');
    }
    return context;
}
