import { orReduction } from "../../helpers/arrayFunctions"
import { SearchType } from "../../model/searchType"
import { TableBodyData, TableBodyDataItem, TableBodyDataRow } from "./model/TableBodyData"
import { sortTableBodyDataItem } from "./sortTableBodyDataItem"

export const generateRowsObjectForTable = <T,>(items: T[], searchType: SearchType, searchTerms: string[], databaseColumns: string[], tableBodyDataItemsFilter: Function): TableBodyData => 
    items.reduce((acc: TableBodyData, item: T): TableBodyData => 
        [
            ...acc, // Previous Rows
            //@ts-ignore
            Object.keys(item).reduce((allItems: TableBodyDataRow, currentKey) => {
                return [
                    ...allItems,
                    {
                        name: currentKey,
                        //@ts-ignore
                        item: item[currentKey] ?? ""
                    }
                ]
            }, [])
            .sort((a: TableBodyDataItem, b: TableBodyDataItem) => sortTableBodyDataItem(databaseColumns, a, b))
        ]
    , [])
    .filter((row: TableBodyDataRow) => orReduction(
        row.reduce((allRowResults: boolean[], currentRowItem: TableBodyDataItem) => [
                ...allRowResults,
                tableBodyDataItemsFilter(searchType, searchTerms, currentRowItem)
            ]
        ,[])
    )) 
