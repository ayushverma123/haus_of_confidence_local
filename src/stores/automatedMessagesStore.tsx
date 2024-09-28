import { observable } from 'mobx'
import { useLocalStore } from 'mobx-react-lite'
import { io } from 'socket.io-client'
import React from 'react'
import { TableBodyData } from '../components/table/model/TableBodyData'
import { generateItemFromTableBodyDataRow } from '../components/table/generateItemFromTableBodyDataRow'
import { sortItemsFunction } from '../components/table/sortItemsFunction'
import { itemSearchFunction } from '../components/table/itemSearchFunction'
import { generateRowsObjectForTable } from '../components/table/generateRowsObjectForTable'
import { SearchType } from '../model/searchType'
import { SortDirection } from '../model/sortDirection'
import { AutomatedMessageSortType } from '../model/automatedMessagesSortType'
import databaseColumnNames from '../pages/automatedMessagesPage/data/databaseColumnNames'
import { AutomatedMessageConfigurationEntry } from '../model/AutomatedMessages/AutomatedMessageConfigurationEntry'
import { automatedMessageSortTypeToAutomatedMessagePropertiesMap } from '../model/automatedMessageSortTypeToAutomatedMessagePropertiesMap'
// import { ScheduledMessage } from '../model/ScheduledMessage'

const socket = io()

const allAutomatedMessages_request = 'REQUEST_getAllAutomatedMessages'
const allAutomatedMessages_response = 'RESPONSE_getAllAutomatedMessages'

const alterAutomatedMessageActiveValue_request = 'REQUEST_updateAutomatedMessageActiveValue'
const alterAutomatedMessageActiveValue_response = 'RESPONSE_updateAutomatedMessageActiveValue'

const timezoneRequestCallString = 'REQUEST_serverTimezone'
const timezoneResponseCallString = 'RESPONSE_serverTimezone'

// //? Mapping that converts Database column names to the UI column names
// export const columnNameToTableHeaderMapping: { [key: string]: string } = {
//     'contact_id': 'Contact ID',
//     'first_name': 'First Name',
//     'last_name': 'Last Name',
//     'emails': 'Email',
//     'phone_numbers': 'Phone',
//     'type': 'Type',
//     'message_text': 'Message Text',
//     'scheduled_time': 'Scheduled Time',
//     'active': 'Active',
//     'created_at': 'Created At',
//     'updated_at': 'Updated At'
// }

const createStore = () => {

    socket.on(allAutomatedMessages_response, (_messages: string) => {
        // const allMessages: ScheduledMessage[] = JSON.parse(_messages)
        const allMessages: AutomatedMessageConfigurationEntry[] = JSON.parse(_messages)

        // console.group('allScheduledMessages_response')
        // console.log(allMessages.length > 0 ? allMessages : 'no messages')
        // console.groupEnd()

        store.replaceAutomatedMessages(allMessages)

        store.refreshRowsData(allMessages)

        store._isReloading.set(false)
    })

    socket.on(alterAutomatedMessageActiveValue_response, (response: string) => {
        const result: boolean = JSON.parse(response)

        store.getAutomatedMessagesFromServer()
    })

    socket.on(timezoneResponseCallString, (response: string) => {
        const timezone = JSON.parse(response)
        
        store.setTimezone(timezone)
    })

    const store = {

        //#region Timezone
        _timezone: observable.box<string>(''),
        get timezone() {
            return store._timezone.get()
        },

        setTimezone: (value: string) => {
            store._timezone.set(value)
        },

        refreshTimezone: () => {
            socket.emit(timezoneRequestCallString, JSON.stringify({
                formatted: true
            }))
        },
        //#endregion

        //#region Loading State
        _isReloading: observable.box(false),
        get isReloading() {
            return store._isReloading.get()
        },
        //#endregion

        //#region Scheduled Messages State

        _automatedMessages: observable.array<AutomatedMessageConfigurationEntry>([]),
        
        get automatedMessages() {
            return store._automatedMessages
        },

        getAutomatedMessagesFromServer: () => {
            store._isReloading.set(true)
            socket.emit(allAutomatedMessages_request)
        },

        replaceAutomatedMessages: (automatedMessages: AutomatedMessageConfigurationEntry[]) => {
            store._automatedMessages.replace(automatedMessages)
        },

        clearAutomatedMessages: () => {
            store._isReloading.set(true)
            
            store._automatedMessages.replace([])

            store._isReloading.set(false)
        },
        //#endregion

        //#region Search 
        _searchTerms: observable.box<string>(""),
        get searchTerms() {
            return store._searchTerms.get()
        },
        setSearchTerms: (newSearchTerms: string) => {
            store._searchTerms.set(newSearchTerms)
            store.refreshRowsData(store.automatedMessages)
        },

        _searchType: observable.box<SearchType>(SearchType.allTermsMustMatch),
        get searchType() {
            return store._searchType.get()
        },
        setSearchType: (newSearchType: SearchType) => {
            store._searchType.set(newSearchType)
            store.refreshRowsData(store.automatedMessages)
        },
        //#endregion

        //#region Sort
        // _sortingType: observable.box<ScheduledMessageSortType>(ScheduledMessageSortType.ContactId),
        _sortingType: observable.box<AutomatedMessageSortType>(AutomatedMessageSortType.ID),
        get sortingType() {
            return store._sortingType.get()
        },
        setSortingType: (newSortingType: AutomatedMessageSortType) => {
            store._sortingType.set(newSortingType)

            store.refreshRowsData(store.automatedMessages)
        },

        _sortingDirection: observable.box<SortDirection>(SortDirection.Descending),
        get sortingDirection() {
            return store._sortingDirection.get()
        },
        setSortingDirection: (newSortingDirection: SortDirection) => {
            store._sortingDirection.set(newSortingDirection)

            store.refreshRowsData(store.automatedMessages)
        },
        //#endregion


        //#region Formatted Row Data
        _rowsData: observable.box<TableBodyData>([]),

        get rowsData() {
            return store._rowsData.get()
        },

        refreshRowsData: (messages: AutomatedMessageConfigurationEntry[]): TableBodyData  => {
            store._isReloading.set(true)
            
            const rowsData = generateRowsObjectForTable<AutomatedMessageConfigurationEntry>(messages, store.searchType, store.searchTerms.split(' '), databaseColumnNames, itemSearchFunction)
            .sort((a, b) => sortItemsFunction<AutomatedMessageSortType>(Object.values(AutomatedMessageSortType),databaseColumnNames, automatedMessageSortTypeToAutomatedMessagePropertiesMap, store.sortingType, store.sortingDirection, a, b))

            
            store._rowsData.set(rowsData)

            store._isReloading.set(false)

            return rowsData
        },
        //#endregion

        //#region Calculated Values

        getItemFromIndex: (index: number): AutomatedMessageConfigurationEntry => {
            const rowData = store.rowsData[index]

            return generateItemFromTableBodyDataRow(rowData)
        },
        
        //#endregion

        //#region Database Actions
        updateAutomatedMessageActive: (id: number, active: boolean) => {
            // console.log("SOCKET VALUE THING:", type)

            socket.emit(alterAutomatedMessageActiveValue_request, JSON.stringify({ id, active }))
        }
        //#endregion

    }

    return store
}


type TStore = ReturnType<typeof createStore>

export const storeContext = React.createContext<TStore | null>(null)

export const StoreProvider: React.FC = ({ children }) => {
    const store = useLocalStore(createStore)

    return (
        <storeContext.Provider value={store}>
            {children}
        </storeContext.Provider>
    )
}

export default StoreProvider

