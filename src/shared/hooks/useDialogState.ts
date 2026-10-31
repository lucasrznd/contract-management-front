import { useState } from 'react';

/**
 * Open/close state for a dialog that works on one record (or none, to create one).
 * The record is kept while the dialog closes, so its content doesn't vanish mid-animation,
 * and `key` changes on every open so a form inside can remount with fresh values.
 */
export function useDialogState<T>() {
    const [state, setState] = useState<{ visible: boolean; item: T | null; key: number }>({
        visible: false,
        item: null,
        key: 0,
    });

    return {
        ...state,
        open: (item: T | null = null) => setState((s) => ({ visible: true, item, key: s.key + 1 })),
        close: () => setState((s) => ({ ...s, visible: false })),
    };
}
