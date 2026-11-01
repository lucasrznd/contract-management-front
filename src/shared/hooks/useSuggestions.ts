import { useRef, useState } from 'react';
import type { AutoCompleteCompleteEvent } from 'primereact/autocomplete';

/**
 * Suggestions for an AutoComplete fed by an API search: spread the result on the AutoComplete.
 * Its own `delay` debounces the typing; an answer that arrives after a newer search is dropped.
 */
export function useSuggestions<T>(search: (text: string) => Promise<T[] | undefined>) {
    const [suggestions, setSuggestions] = useState<T[]>([]);
    const latestQuery = useRef('');

    const completeMethod = async ({ query }: AutoCompleteCompleteEvent) => {
        latestQuery.current = query;
        const found = await search(query);
        // A new array every time, so the panel opens even when the answer is the same as last time.
        if (latestQuery.current === query) setSuggestions([...(found ?? [])]);
    };

    return { suggestions, completeMethod };
}
