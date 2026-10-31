import type { RefObject } from 'react';
import type { Toast } from 'primereact/toast';

type ToastRef = RefObject<Toast | null>;

export function successMsg(toast: ToastRef, msg?: string) {
    toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: msg, life: 5000 });
}

export function infoMsg(toast: ToastRef, msg?: string) {
    toast.current?.show({ severity: 'info', summary: 'Info', detail: msg, life: 5000 });
}

export function warnMsg(toast: ToastRef, msg?: string) {
    toast.current?.show({ severity: 'warn', summary: 'Aviso', detail: msg, life: 5000 });
}
