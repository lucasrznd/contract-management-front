import type { Page } from '@/shared/types/api.types';

/** API page with `content`; `totalElements` defaults to its length. */
export function pageOf<T>(content: T[], { totalElements = content.length, size = 10, number = 0 } = {}): Page<T> {
    return { content, page: { size, number, totalElements, totalPages: Math.ceil(totalElements / size) } };
}
