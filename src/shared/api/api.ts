import axios from 'axios';

/**
 * Shared client for contract-management-api; every service goes through it.
 * Arrays go as repeated keys (`sort=a&sort=b`), the format Spring reads.
 */
export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL, paramsSerializer: { indexes: null } });

/** How often list and summary queries refresh in the background. */
export const REFETCH_INTERVAL = 5 * 60 * 1000;
