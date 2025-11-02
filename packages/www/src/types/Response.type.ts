export type MetaPager = {
    page?: number;
    limit?: number;
    totalItems?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
};

export type Response<Data, Meta = Record<string, unknown>> = {
    data: Data;
    meta: MetaPager & Meta;
};
