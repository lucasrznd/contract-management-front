import axios from 'axios';

/** Shared client for contract-management-api; every service goes through it. */
export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

/** How often list and summary queries refresh in the background. */
export const REFETCH_INTERVAL = 5 * 60 * 1000;
