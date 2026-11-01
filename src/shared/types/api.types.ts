/** Error body returned by contract-management-api. */
export interface StandardError {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    path: string;
}

/** Page returned by the list endpoints (Spring Data `Page`, serialized via DTO). */
export interface Page<T> {
    content: T[];
    page: {
        size: number;
        /** Zero-based. */
        number: number;
        totalElements: number;
        totalPages: number;
    };
}

export type SortDirection = 'asc' | 'desc';

/** What a list endpoint is asked for: a page, its order and an optional text search. */
export interface PageRequest {
    /** Searched by the API in each domain's main fields, ignoring case and accents. */
    text?: string;
    /** Zero-based. */
    page?: number;
    size?: number;
    sort?: { field: string; direction: SortDirection };
}
