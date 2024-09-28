import { SortDirection } from "../../model/sortDirection"
import { TableBodyDataItem, TableBodyDataRow } from "./model/TableBodyData"

//@ts-ignore
export const sortItemsFunction = <_sortType, >(typeValues: string[], databaseColumns: string[], sortTypeToTypeProperties: {[key in _sortType]: string}, sortType: _sortType, sortDirection: SortDirection, a: TableBodyDataRow, b: TableBodyDataRow) => {
    // Map each row to the predicate needed
    // Perform your typical sorting functions on that
    // So basically produce an array of stuff

    const directionResult: {[key in SortDirection]: (arg0: any, arg1: any) => number} = {
        [SortDirection.Ascending]: (aItem, bItem) => aItem < bItem ? -1 : aItem > bItem ? 1 : 0,
        [SortDirection.Descending]: (aItem, bItem) => aItem > bItem ? -1 : aItem < bItem ? 1 : 0,
        [SortDirection.None]: (aItem, bItem) => 0
    }

    const getSortItems = (): any[] => {
        const getColumnIndex = (searchText: string): number => databaseColumns.findIndex((value) => value === searchText) 

        //@ts-ignore
        type matchMapType = {[key in _sortType]: string}

        //@ts-ignore
        const matchMap: matchMapType = typeValues.reduce((finalMap: matchMapType, currentSortType: _sortType) => (
            {
                ...finalMap,
                [`${currentSortType}`] : databaseColumns[getColumnIndex(sortTypeToTypeProperties[currentSortType])]
            }
        ), {})

        const aFiltered = a.filter((item: TableBodyDataItem) => item.name == matchMap[sortType])
        const bFiltered = b.filter((item: TableBodyDataItem) => item.name == matchMap[sortType])

        return [
            aFiltered.length > 0 ? aFiltered[0].item : [],
            bFiltered.length > 0 ? bFiltered[0].item : []
        ]
    }

    const [resultA, resultB] = getSortItems()

    return directionResult[sortDirection](resultA, resultB)
}