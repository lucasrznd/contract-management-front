import { useEffect } from 'react';
import {
    useMutation,
    useQuery,
    useQueryClient,
    type DefaultError,
    type FetchQueryOptions,
    type QueryKey,
    type UseMutationOptions,
    type UseQueryOptions,
} from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useToast } from '@/shared/components/ui/toast/ToastProvider';
import { errorMessageFormatter } from '@/shared/helpers/messageFormatter.helper';
import type { StandardError } from '@/shared/types/api.types';

const DEFAULT_ERROR_MESSAGE = 'Não foi possível concluir a operação. Tente novamente em alguns instantes.';
const CONNECTION_ERROR_MESSAGE = 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
const IMAGE_TOO_LARGE_MESSAGE = 'A imagem é maior que 5 MB. Escolha um arquivo menor.';
const INVALID_IMAGE_MESSAGE = 'Formato de imagem não suportado. Envie JPG, PNG ou WebP.';

/** A message the user can act on: the API's own when it has a friendly version, `fallback` otherwise. */
export function apiErrorMessage(error: unknown, fallback = DEFAULT_ERROR_MESSAGE) {
    if (!isAxiosError<StandardError>(error)) return fallback;
    if (!error.response) return CONNECTION_ERROR_MESSAGE;
    if (error.response.status === 413) return IMAGE_TOO_LARGE_MESSAGE;
    if (error.response.data?.errors?.some((fieldError) => fieldError.fieldName === 'image'))
        return INVALID_IMAGE_MESSAGE;
    return errorMessageFormatter(error.response.data?.message) ?? fallback;
}

interface ApiErrorOptions {
    /** Shown in the toast when the request fails, e.g. "Não foi possível carregar as empresas." */
    errorMessage?: string;
}

/** useQuery that shows a toast whenever the request fails. */
export function useApiQuery<TData, TKey extends QueryKey = QueryKey>({
    errorMessage,
    ...options
}: UseQueryOptions<TData, DefaultError, TData, TKey> & ApiErrorOptions) {
    const toast = useToast();
    const query = useQuery(options);

    // errorUpdatedAt changes on every failed attempt, including background refetches.
    useEffect(() => {
        if (query.error) toast.error(apiErrorMessage(query.error, errorMessage));
    }, [query.errorUpdatedAt]);

    return query;
}

/**
 * Imperative lookup for type-ahead fields: `const search = useApiFetch(...); await search(text)`.
 * Goes through the query cache, shows a toast and answers `undefined` when the request fails.
 */
export function useApiFetch<TArg, TData>(
    options: (arg: TArg) => FetchQueryOptions<TData, DefaultError, TData, QueryKey>,
    errorMessage?: string,
) {
    const toast = useToast();
    const queryClient = useQueryClient();

    return async (arg: TArg): Promise<TData | undefined> => {
        try {
            return await queryClient.fetchQuery(options(arg));
        } catch (error) {
            toast.error(apiErrorMessage(error, errorMessage));
            return undefined;
        }
    };
}

interface ApiMutationOptions {
    /** Refetch every query once the mutation succeeds, so lists and counters reflect the change. */
    invalidateQueries?: boolean;
}

/**
 * useMutation that shows a toast when the request fails and, by default, refreshes every query on success.
 * Callers only handle the success case: `mutate(variables, { onSuccess })`.
 */
export function useApiMutation<TData, TVariables>({
    errorMessage,
    invalidateQueries = true,
    onSuccess,
    onError,
    ...options
}: UseMutationOptions<TData, DefaultError, TVariables> & ApiErrorOptions & ApiMutationOptions) {
    const toast = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        onSuccess: (...args) => {
            if (invalidateQueries) queryClient.invalidateQueries();
            return onSuccess?.(...args);
        },
        onError: (...args) => {
            toast.error(apiErrorMessage(args[0], errorMessage));
            return onError?.(...args);
        },
    });
}
