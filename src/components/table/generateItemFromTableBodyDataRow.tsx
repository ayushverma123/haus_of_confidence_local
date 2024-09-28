import { TableBodyDataItem, TableBodyDataRow } from "./model/TableBodyData";

export const generateItemFromTableBodyDataRow = <T,>(rowData: TableBodyDataRow): T => rowData.reduce((item: T, currentRowItem: TableBodyDataItem): T => (
    {
        ...item,
        [currentRowItem.name]: currentRowItem.item
    }
), {} as T)