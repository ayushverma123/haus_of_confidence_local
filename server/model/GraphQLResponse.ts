export type GraphQLResponse<T,> = {
    data: T,
    errors: any[],
    status: number,
    headers: any
}