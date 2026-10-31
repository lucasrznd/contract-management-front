import type { ReactNode } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { CloseIcon } from '../icons';
import styles from './Modal.module.css';

interface ModalProps {
    visible: boolean;
    onHide: () => void;
    /** id of the element that names the dialog (usually the ModalHeader title). */
    labelledBy: string;
    width?: number;
    /**
     * top: opens `offsetTop` below the top of the screen, like the design's short dialogs.
     * center: centered vertically, for long forms.
     * Either way it never grows past the screen; the body scrolls instead.
     */
    position?: 'top' | 'center';
    /** Distance from the top of the screen when `position` is top. */
    offsetTop?: string;
    role?: 'dialog' | 'alertdialog';
    children: ReactNode;
}

/**
 * The design's modal, built on PrimeReact's Dialog (mask, focus trap, Escape, transitions)
 * with fully custom content. Compose it with ModalHeader, ModalBody and ModalFooter.
 */
export function Modal({
    visible,
    onHide,
    labelledBy,
    width = 560,
    position = 'top',
    offsetTop = '10vh',
    role = 'dialog',
    children,
}: ModalProps) {
    return (
        <Dialog
            visible={visible}
            onHide={onHide}
            position={position}
            draggable={false}
            resizable={false}
            dismissableMask
            blockScroll
            className={styles.modal}
            maskClassName={styles.mask}
            maskStyle={position === 'top' ? { paddingTop: offsetTop } : { paddingTop: 16 }}
            style={{
                width,
                maxHeight: position === 'top' ? `calc(100dvh - ${offsetTop} - 16px)` : 'calc(100dvh - 32px)',
            }}
            pt={{ root: { role, 'aria-labelledby': labelledBy, 'aria-describedby': undefined } }}
            content={() => <>{children}</>}
        />
    );
}

interface ModalHeaderProps {
    id: string;
    title: ReactNode;
    subtitle?: ReactNode;
    onClose: () => void;
}

export function ModalHeader({ id, title, subtitle, onClose }: ModalHeaderProps) {
    return (
        <div className={styles.header}>
            <div className={styles.heading}>
                <h2 id={id} className={styles.title}>
                    {title}
                </h2>
                {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
            </div>
            <Button
                type="button"
                text
                icon={<CloseIcon />}
                aria-label="Fechar"
                className={styles.close}
                onClick={onClose}
            />
        </div>
    );
}

export function ModalBody({ children }: { children: ReactNode }) {
    return <div className={styles.body}>{children}</div>;
}

export function ModalFooter({ children }: { children: ReactNode }) {
    return <div className={styles.footer}>{children}</div>;
}
