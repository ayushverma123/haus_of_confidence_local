import React from 'react'
import { Button, Checkbox, Table } from 'semantic-ui-react'
import { globalStyles } from '../../data/styles'
import { SortDirection } from '../../model/sortDirection'
import { TableProps } from './model/TableProps'
import { UITableCustomColumnItemFormatObject } from './model/UITableCustomColumnItemFormatObject'
import { UITableCustomColumnEnableCheckboxObject } from './model/UITableCustomColumnEnabledCheckboxObject'
import { UITableCustomColumnCheckboxFunctionObject } from './model/UITableCustomColumnCheckboxFunctionObject'
import { TableHeaderProps } from './model/TableHeaderProps'
import { TableBodyData, TableBodyDataItem } from './model/TableBodyData'

export interface TableBodyProps <sortType> {
    rowsData: TableBodyData,
    onRowClick: (index: number, entryId: number) => void,
    activeRowIndex: number,
    allowDelete?: boolean,
    deleteFunction?: (entryId: number, index: number) => void,
    headerTitleToSortTypeMap:  {[key in string]: sortType},
    databaseColumns: string[],
    customColumnFormatting?: UITableCustomColumnItemFormatObject,
    enableCheckboxesForColumns?: UITableCustomColumnEnableCheckboxObject,
    customToggleFunctions?: UITableCustomColumnCheckboxFunctionObject,
    idColumnName: string
}

export type UITableProps <sortType> = TableProps & TableHeaderProps<sortType> & TableBodyProps<sortType>

export const UITableHeader = <sortType,>(props: TableHeaderProps<sortType>): React.FC<TableHeaderProps<sortType>> => {
    const { headerTitles, sortDirection, sortType, onHeaderCellClick, allowDelete, headerTitleToSortTypeMap } = props

    //@ts-ignore
    return (
        <Table.Header>
            <Table.Row>
                { headerTitles.map(headerTitle => {
                    const columnSortType: sortType = headerTitleToSortTypeMap[headerTitle]

                    const isSorted: boolean = sortDirection !== SortDirection.None && columnSortType == sortType

                    const sortDirectionToTextOrUndefined: {[key in SortDirection]: 'ascending' | 'descending' | undefined } = {
                        [SortDirection.Ascending]: 'ascending',
                        [SortDirection.Descending]: 'descending',
                        [SortDirection.None]: undefined
                    }

                    return (
                        <Table.HeaderCell
                            onClick={() => onHeaderCellClick(columnSortType, sortDirection)}
                            sorted={ isSorted ? sortDirectionToTextOrUndefined[sortDirection] : undefined}
                            style={globalStyles.unselectable}
                        >
                            {headerTitle}
                        </Table.HeaderCell>
                    )
                })}
                { allowDelete &&                
                    <Table.HeaderCell
                        style={globalStyles.unselectable}
                    ></Table.HeaderCell>
                }
            </Table.Row>
        </Table.Header>
    )
}

export const UITable = <sortType,>(props: UITableProps<sortType>): React.FC<UITableProps<sortType>> => {
    const { 
        headerTitles, 
        celled, 
        padded, 
        rowsData, 
        onRowClick, 
        activeRowIndex, 
        sortDirection, 
        sortType, 
        onHeaderCellClick, 
        allowDelete, 
        deleteFunction, 
        customColumnFormatting, 
        customToggleFunctions, 
        enableCheckboxesForColumns,
        headerTitleToSortTypeMap,
        idColumnName
    } = props

    //@ts-ignore
    return (
        <Table sortable celled={celled} padded={padded}>
            {/* @ts-ignore */}
            <UITableHeader<sortType>
                headerTitles={headerTitles} 
                sortDirection={sortDirection} 
                sortType={sortType} 
                onHeaderCellClick={onHeaderCellClick}
                allowDelete={allowDelete}
                headerTitleToSortTypeMap={headerTitleToSortTypeMap}
            />
            {/* @ts-ignore */}
            <UITableBody<sortType>
                rowsData={rowsData}
                onRowClick={onRowClick}
                activeRowIndex={activeRowIndex}
                allowDelete={allowDelete}
                deleteFunction={deleteFunction}
                enableCheckboxesForColumns={enableCheckboxesForColumns}
                customColumnFormatting={customColumnFormatting}
                customToggleFunctions={customToggleFunctions}
                idColumnName={idColumnName}
            />
        </Table>
    )
}


// Will take an array of arrays, with each array containing the data to fill in all columns in a row.
/* 
[
    ["Row Item 1", "Row Item 2", "Row Item 3", "Row Item 4"]

    But should also be able to receive a React element, so the Google Map can be integrated
]
*/

export const UITableBody = <sortType,>(props: TableBodyProps<sortType>): React.FC<TableBodyProps<sortType>>  => {
    const { 
        rowsData, 
        onRowClick, 
        activeRowIndex, 
        allowDelete, 
        deleteFunction, 
        enableCheckboxesForColumns, 
        customColumnFormatting, 
        customToggleFunctions,
        idColumnName
    } = props

    //@ts-ignore
    return (
        <Table.Body>
            { rowsData.map((dataRow, rowIndex) => {
                const thisRow: TableBodyDataItem[] = rowsData[rowIndex]

                //@ts-ignore
                const rowItemId: number = thisRow.filter(item => item.name === idColumnName)[0].item

                return (
                    <Table.Row                         
                        active={rowItemId === activeRowIndex}
                        onClick={() => onRowClick(rowIndex, rowItemId)}    
                    >
                        { dataRow.map(rowItem => {
                            const { name, item, negative, positive, error, collapsing, warning, textAlign } = rowItem
                            
                            const stringItem = typeof(item) === 'string'
                            const booleanItem = typeof(item) === 'boolean'
                            const emptyItem = stringItem ? item.length <= 0 : typeof(item) === 'undefined'

                            const columnHasCheckboxEnabled: boolean = enableCheckboxesForColumns ? enableCheckboxesForColumns[name] : false
                            const columnHasCustomFunction: boolean = customToggleFunctions ? typeof(customToggleFunctions[name]) !== 'undefined' : false

                            const itemHasCustomFormatting: boolean = customColumnFormatting ? typeof(customColumnFormatting[name]) !== 'undefined' : false

                            const cellContents = (() => {
                                if (!emptyItem) {
                                    if (booleanItem) {
                                        if (columnHasCheckboxEnabled) {
                                            return (
                                                <Checkbox
                                                    toggle
                                                    onChange={columnHasCustomFunction ? () => customToggleFunctions![name](rowItemId, rowIndex, item) : undefined}
                                                    checked={item}
                                                />
                                            )
                                        }
                                        else {
                                            return item ? 'Yes' : 'No'
                                        } 
                                    } else return itemHasCustomFormatting ? customColumnFormatting![name](item) : item
                                }
                                return ""
                            })()

                            return (
                                <Table.Cell 
                                    negative={negative} 
                                    positive={positive} 
                                    error={error} 
                                    collapsing={collapsing}
                                    warning={emptyItem || warning}
                                    textAlign={textAlign}
                                >
                                    { cellContents }
                                </Table.Cell>
                            )
                        })}
                        { allowDelete && deleteFunction &&
                            <Table.Cell>
                                <Button negative icon='trash' onClick={() => deleteFunction(rowItemId, rowIndex)} />
                            </Table.Cell>
                        }
                    </Table.Row>
                )
            }
        )}
        </Table.Body>
    )
}