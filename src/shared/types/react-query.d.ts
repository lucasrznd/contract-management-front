import type { AxiosError } from 'axios';
import type { StandardError } from '@/types/api.types';

// Every request goes through axios, so mutation/query errors are AxiosErrors carrying the API's StandardError body.
declare module '@tanstack/react-query' {
    interface Register {
        defaultError: AxiosError<StandardError>;
    }
}
