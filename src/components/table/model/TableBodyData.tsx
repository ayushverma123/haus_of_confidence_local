export type TableBodyData = TableBodyDataRow[]
export type TableBodyDataRow = TableBodyDataItem[]
export type ValidTableBodyDataRowItemTypes = Element | string | boolean | number | Array<string | boolean | number> 
export type TableBodyDataItem = { 
    name: string,
    item: ValidTableBodyDataRowItemTypes,
    negative?: boolean,
    positive?: boolean,
    error?: boolean,
    collapsing?: boolean,
    warning?: boolean,
    textAlign?: 'left' | 'center' | 'right',
}