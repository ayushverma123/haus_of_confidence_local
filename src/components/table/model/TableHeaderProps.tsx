import { SortDirection } from "../../../model/sortDirection";

export interface TableHeaderProps<sortType> {
    headerTitles: string[],
    sortDirection: SortDirection,
    sortType: sortType,
    onHeaderCellClick: (sortType: sortType, sortDirection: SortDirection) => void,
    allowDelete?: boolean,
    headerTitleToSortTypeMap:  {[key in string]: sortType}
}