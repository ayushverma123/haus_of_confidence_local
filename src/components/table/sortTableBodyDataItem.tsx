import { TableBodyDataItem } from "./model/TableBodyData"

export const sortTableBodyDataItem = (sortOrdering: string[], a: TableBodyDataItem, b: TableBodyDataItem) => {
    const aSortingIndex = sortOrdering.findIndex((value) => value === a.name)
    const bSortingIndex = sortOrdering.findIndex((value) => value === b.name)

    return aSortingIndex < bSortingIndex ? -1 : aSortingIndex > bSortingIndex ? 1 : 0
}
