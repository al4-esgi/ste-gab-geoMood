import type { QueryKey, UseQueryOptions } from '@tanstack/vue-query';

export enum QueryName {}

export enum QueryStatus {
    IDLE = 'idle',
    SUCCESS = 'success',
    ERROR = 'error',
    LOADING = 'loading',
}

export const QueryOptions: Omit<
    UseQueryOptions<unknown, unknown, unknown, QueryKey>,
    'queryFn' | 'queryKey'
> = {
    retry: 0,
    retryDelay: 1_000,
    staleTime: 2000,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
};
