import React, { useState, useEffect, Fragment, ReactElement } from 'react'
import { io } from 'socket.io-client'
import { andReduction } from '../../helpers/arrayFunctions'
import { Dimmer, Loader } from 'semantic-ui-react'
import { storeContext as automatedMessagesStoreContext } from '../../stores/automatedMessagesStore'
import { UITableCustomColumnItemFormatObject } from '../../components/table/model/UITableCustomColumnItemFormatObject'
import { UITable } from '../../components/table/UITable'
import { AutomatedMessageSortType, headerTitleToAutomatedMessageSortType } from '../../model/automatedMessagesSortType'
import { SortDirection } from '../../model/sortDirection'
import { cycleSortDirection } from '../../components/table/cycleSortDirection'
import { useObserver } from 'mobx-react-lite'
import databaseColumnNames from './data/databaseColumnNames'
import { tableHeaders } from './data/tableHeaders'
import { automatedMessageTriggerTypeValueToTextUiMap } from './data/automatedMessageTriggerTypeValueToUIText'
import { ActionBar } from './actionBar'
import { UITableCustomColumnEnableCheckboxObject } from '../../components/table/model/UITableCustomColumnEnabledCheckboxObject'
import { format, formatDistance, formatRelative, parseISO, subDays } from 'date-fns'
import { UITableCustomColumnCheckboxFunctionObject } from '../../components/table/model/UITableCustomColumnCheckboxFunctionObject'
import { AddOrEdit } from '../../model/AddOrEdit'
import { Link, NavLink } from 'react-router-dom'
import { ContactInfoModal } from '../../components/modal/ContactInfo'
import { ModifyDefaultMessageTemplatesModal } from './modal/modifyDefaultMessageTemplatesModal'
import { AutomatedMessageConfigurationEntry } from '../../model/AutomatedMessages/AutomatedMessageConfigurationEntry'
import { toJS } from 'mobx'
import { automatedMessageContactCriteriaValueToTextUiMap } from './data/automatedMessageContactCriteriaValueToTextUiMap'
import { automatedMessageLockTypeValueToTextUiMap } from './data/automatedMessageLockTypeValueToTextUiMap'
import { AutomatedMessageTimeTriggerConfiguration } from '../../model/AutomatedMessages/AutomatedMessageTimeTriggerConfiguration'
import { AutomatedMessageTimeConfigEntry } from '../../model/AutomatedMessages/AutomatedMessageTimeConfigEntry'

const numberOfLoadingItems = 1

const dateFormatStringWithMonth: string = 'MMMM dd, yyyy hh:mm:ss aaa'
const shortDateFormatString: string = 'MM/dd/yyyy hh:mm:ss aaa'

const parseJSON = (value: any) => JSON.stringify(toJS(value))

const enableCheckboxesForColumns: UITableCustomColumnEnableCheckboxObject = {
    'enabled': true
}


enum _modals {
    none,
    messageEditor,
    contact,
    appointment,
    defaultsEditor
}

export const AutomatedMessagesPage: React.FC = () => {
    const automatedMessagesStore = React.useContext(automatedMessagesStoreContext)
    if (!automatedMessagesStore) throw Error("automatedMessagesStore shouldn't be null")

    const [selectedTableIndex, setSelectedTableIndex] = useState<number>(-1)

    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [modalType, setModalType] = useState<_modals>(_modals.none)
    // const [modalMode, setModalMode] = useState<AddOrEdit>(AddOrEdit.Add)




    // const [pageLoading, setPageLoading] = useState<boolean[]>(Array(numberOfLoadingItems).fill(true))
    /*
        0: Messages Loading

    */
    useEffect(() => {
        // Get Server Timezone
        automatedMessagesStore.refreshTimezone()
        // Load Messages on Start
        automatedMessagesStore.getAutomatedMessagesFromServer()

    }, [])

    // useEffect(() => {
    //     console.log("Modal Type Changed")
    // }, [modalType])

    // useEffect(() => {
    //     console.log("Modal Open Changed")
    // }, [modalOpen])

    const customTableColumnItemFormatting: UITableCustomColumnItemFormatObject = {
        // 'contact_id': (value: number): ReactElement => (<Link to={`/contact/${value}`}>{value}</Link>),
        //@ts-ignore
        'triggerType': (value: string): string => automatedMessageTriggerTypeValueToTextUiMap[value],
        'timeTrigger': (value: AutomatedMessageTimeTriggerConfiguration): string => {
            const { timeTriggers } = value
    
            if (typeof(timeTriggers) === 'undefined' || Object.is(timeTriggers, null)) {
                return "N/A"
            }
    
            if (timeTriggers.length === 0) {
                return "N/A"
            }
            
            const results = timeTriggers.reduce((acc: string, timeTrigger: AutomatedMessageTimeConfigEntry, index: number): string => {
                const isFirst = index === 0
                const { hour, minutes } = timeTrigger
    
                const amOrPm = hour <= 11 ? 'AM' : 'PM'
                const humanHour = hour
                const formattedHour = humanHour <= 12 ? humanHour : humanHour - 12
                const timezone = automatedMessagesStore.timezone

                return `${acc}${isFirst ? '' : ', '}${formattedHour}:${minutes} ${amOrPm} ${timezone}`
            }, '')
    
            return results
            // parseJSON(value)
        },
        //@ts-ignore
        'contactCriteria': (value: string): string => automatedMessageContactCriteriaValueToTextUiMap[value],
        //@ts-ignore
        'lockType': (value: string): string => automatedMessageLockTypeValueToTextUiMap[value],
        'customTriggerConfig': parseJSON,
        'contactCriteriaConfig': parseJSON,
        'restrictToHours': parseJSON,
        // 'emails': (value: string[]): ReactElement => { 
        //     return (
        //         <Fragment>
        //             { value.map((email) => {
        //                 return <a href={`mailto://${email}`}>{email}</a>
        //             })}
        //         </Fragment>
        //     )
        // },
    
        'created_at': (value: string): string => format(parseISO(value), shortDateFormatString),
        'updated_at': (value: string): string => format(parseISO(value), shortDateFormatString),
        
    
        // ! UNUSUED FROM OLD
        // 'scheduled_time': (value: string): string => format(parseISO(value), dateFormatStringWithMonth) //formatDistance(parseISO(value), new Date(), { addSuffix: true }),
    }

    const customToggleFunctions: UITableCustomColumnCheckboxFunctionObject = {
        'enabled': (rowId: number, rowIndex: number, currentValue: boolean) => {

            const { id } : AutomatedMessageConfigurationEntry = automatedMessagesStore.getItemFromIndex(rowIndex)
            
            //@ts-ignore
            automatedMessagesStore.updateAutomatedMessageActive(id, !currentValue)
        }
    }

    const handleTableRowClick = (index: number, id: number) => {
        setSelectedTableIndex(id)

        const message = automatedMessagesStore.getItemFromIndex(index)

        // console.group(`SELECTED ITEM: ${index}`)
        //     console.log(item)
        // console.groupEnd()
    }

    const handleHeaderCellClick = (sortType: AutomatedMessageSortType, sortDirection: SortDirection) => {        
        const sortTypeAlreadySelected = sortType === automatedMessagesStore.sortingType

        if (!sortTypeAlreadySelected) {
            automatedMessagesStore.setSortingType(sortType)
        }
        
        automatedMessagesStore.setSortingDirection(sortTypeAlreadySelected ? 
            cycleSortDirection(sortDirection) : sortDirection === SortDirection.None ? 
                SortDirection.Descending : sortDirection )
    }

    const handleSearchTermsInputChange = (newValue: string) => {
        const newSearchTerms: string = newValue

        automatedMessagesStore.setSearchTerms(newSearchTerms)
    }

    const handleRefreshButtonClick = () => {
        automatedMessagesStore.getAutomatedMessagesFromServer()
    }

    const handleOpenDefaultsEditorModalClick = () => {
        setModalType(_modals.defaultsEditor)
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
    }

    // const pageLoaded = andReduction(pageLoading.map(value => !value))
    const pageLoaded = () => !automatedMessagesStore.isReloading

    return useObserver(() => (
        <div style={{
            // display: 'flex',
            // flexDirection: 'column',
            // margin: 'auto',
            // width: '80vw',
            width: '100%',
            // minWidth: '200px',
            // maxWidth: '500px'
            marginTop: '50px',
            paddingLeft: '8px',
            paddingRight: '8px',
        }}>
            {/* <Fragment>
                <ContactInfoModal
                    isOpen={modalOpen && modalType === _modals.contact}
                    onClose={() => {}} // TODO
                    closeModal={() => {}} // TODO
                    contactId={0} //TODO -- Link to another state thing
                    //@ts-ignore
                    contactData={{}} // TODO 
                />
                <ModifyDefaultMessageTemplatesModal
                    isOpen={modalOpen && modalType === _modals.defaultsEditor}
                    onClose={() => {}}      // TODO
                    closeModal={() => {}}   // TODO
                />
            </Fragment> */}
            <Fragment>
                <ActionBar 
                    searchTerms={automatedMessagesStore.searchTerms}
                    onSearchTermsChange={handleSearchTermsInputChange}
                    onAddButtonPress={() => {}} // TODO
                    reloadItems={handleRefreshButtonClick}
                    openDefaultsEditorModal={handleOpenDefaultsEditorModalClick}
                    />
                <Dimmer.Dimmable dimmed={!pageLoaded()}>
                    <Dimmer inverted active={!pageLoaded()} style={{height: '100vh'}}>
                        <Loader />
                    </Dimmer>
                    {/* @ts-ignore */}
                    <UITable
                        celled
                        padded
                        headerTitles={tableHeaders}
                        databaseColumns={databaseColumnNames}
                        headerTitleToSortTypeMap={headerTitleToAutomatedMessageSortType}
                        //@ts-ignore
                        rowsData={automatedMessagesStore.rowsData}
                        activeRowIndex={selectedTableIndex}
                        sortDirection={automatedMessagesStore.sortingDirection}
                        sortType={automatedMessagesStore.sortingType}
                        allowDelete={false}
                        onRowClick={handleTableRowClick}
                        onHeaderCellClick={handleHeaderCellClick}
                        idColumnName='id'
                        customColumnFormatting={customTableColumnItemFormatting}
                        enableCheckboxesForColumns={enableCheckboxesForColumns}
                        customToggleFunctions={customToggleFunctions}
                        />
                </Dimmer.Dimmable>
            </Fragment>
        </div>
    ))
}