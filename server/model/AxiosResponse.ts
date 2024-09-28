export type AxiosResponse<T = any,> = {
    data: T,
    status: number,
    statusText: string,
    headers: any,
    config: any,
    request: any
}