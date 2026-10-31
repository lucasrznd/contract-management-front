/** Error body returned by contract-management-api. */
export interface StandardError {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    path: string;
}
