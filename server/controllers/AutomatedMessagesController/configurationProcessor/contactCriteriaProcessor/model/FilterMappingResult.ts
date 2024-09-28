export type FilterMappingResult<T,> = {
    filterResult: boolean,
    data?: T,
    excludeContact?: boolean
}