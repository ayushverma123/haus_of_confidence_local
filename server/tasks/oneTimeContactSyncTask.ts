import { getInitialContactImportCompletedValue as getBlvdInitialImportCompletedValue, getInitialContactImportCompletedValue } from "../ThirdPartyServices/Blvd/StateManager/BlvdStateManager";
import { getPodiumInitialContactSyncCompletedValue } from "../ThirdPartyServices/Podium/stateManager";
import { everyNMinutes, everyNSeconds, onNSecondsEveryNMinutes } from "../constants/cronIntervals";
import service from "../constants/systemServiceIdentifier";
import { MutexTypes, getMutex, modifyMutex } from "../controllers/MutexController";
import { StateStore } from "../controllers/StateManager";
import { andReduction } from "../helpers/ArrayFunctions";
import { CronTask, announceToConsole as _announceToConsole, skippingTaskPrefix} from "../lib/CronTask";
import { Maybe } from "../model/Maybe";
import { ThirdPartyService, ThirdPartyServiceMap } from "../model/ThirdPartyService";
import { checkAllContactImportCompletedValues } from "../helpers/checkAllContactImportCompletedValues";
import { StateProperties } from "./ContactSync/model/StateProperties";
import { InitialContactImportState } from "./ContactSync/model/InitialContactImportState";
import { GeneralContact } from "../model/GeneralContact";
import { convertGeneralContactToThirdPartyContact, getAllGeneralContacts, updateGeneralContactServiceIdsValue, updateGeneralContactSyncedWithServicesValue } from "../controllers/GeneralContactsController";
import { createOrUpdateClient } from "../ThirdPartyServices/Blvd/controllers/ClientController";
import { Client } from "../ThirdPartyServices/Blvd/model/Client";
import { Contact } from "../ThirdPartyServices/Podium/model/Contact";
import { Id } from "../ThirdPartyServices/Blvd/model/Id";
import { thirdPartyServiceContactIdKey } from "../constants/thirdPartyServiceContactIdKey";
import { ValidContactType } from "../controllers/GeneralContactsController/model/ValidContactType";
import { createOrUpdateContact } from "../ThirdPartyServices/Podium/controllers/ContactController";
import { getContactIdentifier } from "../ThirdPartyServices/Podium/controllers/ContactController/helpers/getContactIdentifier";
import { syncContactToService } from "../controllers/GeneralContactsController/syncContactToService";
import { SyncToServicesResultEntry } from "./ContactSync/model/SyncToServicesResultEntry";
import { getValue, modifyValue } from "./ContactSync/StateManager";
import { ImportReportEntry } from "./ContactSync/model/ImportReportEntry";
import { MatchTuple, generateStringFromTemplate } from "../helpers/TextReplacementHelper";
import { secondsToMilliseconds } from "../helpers/UnitConversions";
import { Wait } from "../helpers/Wait";
import { updateGHLWebhooksRegistrationStatus } from "../ThirdPartyServices/GoHighLevel/stateManager";
import { addInitialSyncReportEntry } from "../controllers/InitialSyncReportsTableController/addInitialSyncReportEntry";
import { reduceServiceLockValueByOne } from "../controllers/WebhookLocksController";
import { CreateOrUpdate } from "../model/CreateOrUpdate";
import { isInitialContactSyncCompleted } from "./WebhooksQueue/helpers/isInitialContactSyncCompleted";
// import { escapeSpecialCharacters } from "../helpers/StringHelper";


const excludeServicesFromSync: ThirdPartyService[] = [
    ThirdPartyService.GoHighLevel
]

const escapeSpecialCharacters = (text: string): string => { 
    const matchConfig: Array<MatchTuple> = [
        ["'", "$^"]
    ]

    return generateStringFromTemplate(text, matchConfig)
}

const taskName = "Initial Contact Sync Task"

const mutexType = MutexTypes.ContactImport

// const stateId = `${service}_CONTACT_IMPORT`
// export const _stateStore = StateStore<InitialContactImportState>(stateId)

// export const isInitialContactSyncCompleted = async (): Promise<boolean> => {
//     const result = await getValue<boolean>(StateProperties.syncCompleted)
//     // const result = checkAllContactImportCompletedValues(_stateStore)
//     return new Promise((resolve) => resolve(result || false))
// }


export type SortedContacts = ThirdPartyServiceMap<GeneralContact[]>
type _syncToServicesMap = ThirdPartyServiceMap<ThirdPartyService[]>

export type _syncToServicesResultObject = ThirdPartyServiceMap<SyncToServicesResultEntry[]>

const syncToServicesMap: _syncToServicesMap = {
    [ThirdPartyService.Boulevard]: [ThirdPartyService.Podium],
    [ThirdPartyService.Podium]: [ThirdPartyService.Boulevard],
    [ThirdPartyService.GoHighLevel]: []
}



// TODO
//@ts-ignore
// export const syncContactToService = async <T,>(_contact: GeneralContact, _service: ThirdPartyService): Promise<T> => {
//     const { id } = _contact //? Primary Key for database contact

//     let newObject: T
//     try {
//         const _newObject = await convertGeneralContactToThirdPartyContact(_service, _contact) as T

//         if (typeof(_newObject) === 'undefined') {
//             throw new Error(`GeneralContact ID: ${id} produced an undefined contact/client when converted to ${_service}`)
//         }

//         newObject = _newObject

//         // console.log("NEW Object")
//         // console.log(newObject) //

//         // TODO -- Now sync it to one of the services
//         const syncFunction: ThirdPartyServiceMap<(arg0: T) => Promise<T>> = {
//             [ThirdPartyService.Boulevard]: async (client: T): Promise<T> => {
//                 const result: Client = await createOrUpdateClient(client as Client)    

//                 // console.log("RESULT!!!")
//                 // console.log(result)

//                 return new Promise<T>(resolve => resolve(result as T))
//             },

//             // TODO - TEST
//             [ThirdPartyService.Podium]: async (contact: T) => {
//                 const result: Maybe<Contact> = await createOrUpdateContact(contact as Contact)

//                 if (typeof(result) === 'undefined') throw new Error('Could not find Podium Contact for update for some reason')

//                 return new Promise<T>(resolve => resolve(result! as T))
//             }
//         }

//         const syncedObject = await syncFunction[_service](newObject)

//         // console.log("NEW OBJECT")
//         // console.log(syncedObject)
//         // // console.log(syncedObject[thirdPartyServiceContactIdKey[_service]])

//         const newIdKey = (): string => syncedObject[thirdPartyServiceContactIdKey[_service]] 

//         try {
//             await updateGeneralContactServiceIdsValue(`${id!}`, _service, newIdKey())
//         } catch (error) {
//             console.error(`Unable to update GeneralContact serviceID for ${_service}`)
//             console.error(error)
//             // return new Promise((_, reject) => reject(error))
//         }

//         try {
//             await updateGeneralContactSyncedWithServicesValue(`${id!}`, _service, true)
//         } catch (error) {
//             console.error(`Unable to update GeneralContact synced_with_service for ${_service}`)
//             console.error(error)
//         }

//         return new Promise<T>(resolve => resolve(syncedObject as T))

//     } catch (error) {
//         console.error("Could not sync contact to third party service")
//         console.error(error)
//     }
// }

// TODO - TEST
const contactSyncTask = CronTask(everyNSeconds(10), taskName, async () => {
    const announceToConsole = (text) => _announceToConsole(taskName, text)

    const lockMutex = async () => await modifyMutex(service, mutexType, true)

    const unlockMutex = async () => await modifyMutex(service, mutexType, false)
    const setSyncCompletedValue = async (value: boolean) => await modifyValue<boolean>(StateProperties.syncCompleted, value)
 
    if (await isInitialContactSyncCompleted()) {
        announceToConsole(`${skippingTaskPrefix} One Time Contact Sync already completed`)
        return
    }
    // TODO - in the future, make the thing below work with a reduce on ThirdPartyValue so it can be expanded easily
    // if (!checkAllContactImportCompletedValues(_stateStore)) {
    if (!(await getInitialContactImportCompletedValue() && await getPodiumInitialContactSyncCompletedValue())) {
        announceToConsole(`${skippingTaskPrefix}Initial Contact Imports have not all been completed -- skipping One Time Contact Sync`)
        return
    } 

    if (!await getMutex(service, mutexType)) {
        try {
            await lockMutex()

            const allContacts: GeneralContact[] = await getAllGeneralContacts()

            if (allContacts.length <= 0) {
                announceToConsole("No Contacts were found")
                
                await unlockMutex()
                await setSyncCompletedValue(true)
                return
            }

            //@ts-ignore
            const sortedContacts: SortedContacts = await Object.values(ThirdPartyService).filter(item => !excludeServicesFromSync.includes(item))
                .reduce(async (acc: Promise<SortedContacts>, serviceKey: string):Promise<SortedContacts> => {
                    const existingContacts: SortedContacts = await acc
                    const currentService: ThirdPartyService = ThirdPartyService[serviceKey]

                    const isNotSyncedWithCurrentService = ({ synced_with_service}) => {
                        
                        const value = synced_with_service[currentService]

                        // console.log("SYNCED WITH SERVICE?")
                        // console.log(value)

                        return typeof(value) === 'undefined' ? false : !value
                    } 
                    return new Promise((resolve) => resolve({
                        ...existingContacts,
                        [currentService]: allContacts.filter(isNotSyncedWithCurrentService)
                        // (({ synced_with_service }) => typeof(synced_with_service[currentService]) === 'undefined' || synced_with_service[currentService] === false
                    }))
                }, {})

            
    
            //@ts-ignore
            // await modifyValue<SortedContacts>(StateProperties.syncObject, Object.keys(sortedContacts).reduce((acc: SortedContacts, serviceKey: string): SortedContacts => {
            //     const currentService: ThirdPartyService = ThirdPartyService[serviceKey]
            //     const currentContacts: GeneralContact[] = sortedContacts[currentService]

            //     const escapedContacts = currentContacts.map(item => ({
            //         ...item,
            //         first_name: typeof(item.first_name) === 'string'? escapeSpecialCharacters(item.first_name) : undefined,
            //         last_name: typeof(item.last_name) === 'string'? escapeSpecialCharacters(item.last_name) : undefined,
            //         emails: typeof(item.emails) === 'object' ? item.emails.map(email => escapeSpecialCharacters(email)) : undefined,
            //         original_contact_object: {
            //             ...item.original_contact_object,
            //             name: typeof(item.original_contact_object.name) === 'string' ? escapeSpecialCharacters(item.original_contact_object.name) : undefined,
            //             //@ts-ignore
            //             firstName: typeof(item.original_contact_object.firstName) === 'string'? escapeSpecialCharacters(item.original_contact_object.firstName) : undefined,
            //             //@ts-ignore
            //             lastName: typeof(item.original_contact_object.lastName) ==='string' ? escapeSpecialCharacters(item.original_contact_object.lastName) : undefined,
            //             //@ts-ignore
            //             email: typeof(item.original_contact_object.email) ==='string' ? escapeSpecialCharacters(item.original_contact_object.email) : undefined,
            //             //@ts-ignore
            //             emails: typeof(item.original_contact_object.emails) !== 'undefined' ? item.original_contact_object.emails.map((email) => escapeSpecialCharacters(email)) : undefined,
            //         },
            //     }))

            //     return {
            //         ...acc,
            //         [currentService]: escapedContacts
            //     }
            // }, {}))

            // console.log("SORTED CONTACTS")
            // console.log(Object.keys(sortedContacts))

            // const preImportReport: ImportReportEntry[] = await Object.keys(sortedContacts).reduce(async (acc: Promise<ImportReportEntry[]>, serviceKey: string): Promise<ImportReportEntry[]> => {
            //     const existingEntries = await acc
            //     const currentService: ThirdPartyService = ThirdPartyService[serviceKey]

            //     try {
            //         const returnValue = [
            //             ...existingEntries,
            //             //@ts-ignore
            //             ...await sortedContacts[currentService].reduce(async (allReportEntries: Promise<ImportReportEntry[]>, contact: GeneralContact): Promise<ImportReportEntry[]> => {
            //                 const existingEntries = await allReportEntries
            //                 try {

            //                     const returnValue = [ ...existingEntries, {
            //                         generalContactId: contact.id,
            //                         originalService: contact.original_service,
            //                         targetService: currentService,
            //                         originalContactObject: contact.original_contact_object,
            //                         targetContactObject: await convertGeneralContactToThirdPartyContact(currentService, contact),
            //                     }]

            //                     return new Promise((resolve) => resolve(returnValue as ImportReportEntry[]))
            //                 } catch (error) {
            //                     console.error(`Unable to convert Contact to ImportReportEntry for ${currentService} and Contact ID: ${contact.id}`)
            //                     return new Promise((_, reject) => reject(error))
            //                 }
                        
            //             }, [])
            //         ]

            //         return new Promise((resolve) => resolve(returnValue as ImportReportEntry[]))
            //     } catch (error) {
            //         console.error("Unable to compile Before-import report")
            //         console.error(error)
            //         return new Promise((_, reject) => reject(error))
            //     }
                
            // }, new Promise((resolve) => resolve([])))

            // console.log("BEFORE-IMPORT REPORT")
            // console.log(JSON.stringify(preImportReport))

            //@ts-ignore
            // const escapedReport = preImportReport.reduce((all, cv) => {
            //     return [
            //         //@ts-ignore
            //         ...all,
            //         {
            //             ...cv,
            //             originalContactObject: {
            //                 ...cv.originalContactObject,
            //                 name: typeof(cv.originalContactObject.name) === 'string' ? escapeSpecialCharacters(cv.originalContactObject.name) : undefined,
            //                 //@ts-ignore
            //                 firstName: typeof(cv.originalContactObject.firstName) === 'string'? escapeSpecialCharacters(cv.originalContactObject.firstName) : undefined,
            //                 //@ts-ignore
            //                 lastName: typeof(cv.originalContactObject.lastName) ==='string' ? escapeSpecialCharacters(cv.originalContactObject.lastName) : undefined,
            //                 //@ts-ignore
            //                 email: typeof(cv.originalContactObject.email) ==='string' ? escapeSpecialCharacters(cv.originalContactObject.email) : undefined,
            //                 //@ts-ignore
            //                 emails: typeof(cv.originalContactObject.emails) !== 'undefined' ? cv.originalContactObject.emails.map((email) => escapeSpecialCharacters(email)) : undefined,
            //             },
            //             targetContactObject: {
            //                 ...cv.targetContactObject,
            //                 name: typeof(cv.targetContactObject.name) === 'string' ? escapeSpecialCharacters(cv.targetContactObject.name) : undefined,
            //                 //@ts-ignore
            //                 firstName: typeof(cv.targetContactObject.firstName) === 'string'? escapeSpecialCharacters(cv.targetContactObject.firstName) : undefined,
            //                 //@ts-ignore
            //                 lastName: typeof(cv.targetContactObject.lastName) ==='string' ? escapeSpecialCharacters(cv.targetContactObject.lastName) : undefined,
            //                 //@ts-ignore
            //                 email: typeof(cv.targetContactObject.email) ==='string' ? escapeSpecialCharacters(cv.targetContactObject.email) : undefined,
            //                 //@ts-ignore
            //                 emails: typeof(cv.targetContactObject.emails) !== 'undefined' ? cv.targetContactObject.emails.map((email) => escapeSpecialCharacters(email)) : undefined,
            //             }

            //         }
            //     ]
            // }, [])

            // console.log(JSON.stringify(escapedReport))

            // await modifyValue(StateProperties.beforeImportReport, escapedReport)

            // Check that import allowed flag is set
            if (await getValue<boolean>(StateProperties.allowImport)) {
                // Will only show successes
                //@ts-ignore 
                const syncResults: _syncToServicesResultObject = await Object.keys(sortedContacts).reduce(async (allSyncResults: Promise<SyncToServicesResultEntry[]>, serviceKey: string): Promise<SyncToServicesResultEntry[]> => {
                    const existingResults: SyncToServicesResultEntry[] = await allSyncResults
                    const currentService: ThirdPartyService = ThirdPartyService[serviceKey]

                    const _allContacts: GeneralContact[] = sortedContacts[currentService]

                    // Needs to sync to the key's service, update the general contact's service ID and synced_with_service setting for that service
                    //@ts-ignore
                    const results: SyncToServicesResultEntry[] = await _allContacts.reduce(
                        async (acc: Promise<SyncToServicesResultEntry[]>, currentContact: GeneralContact): Promise<SyncToServicesResultEntry[]> => {
                            const _existing: SyncToServicesResultEntry[] = await acc

                            if (typeof(currentContact) === 'undefined') {
                                console.error(`What in the actual FUCK, why is the contact empty?`)
                                console.error(currentContact)

                                return new Promise(resolve => resolve(_existing))
                            }


                            const _base = {
                                id: `${currentContact.id}`,
                                contact: currentContact,
                                source: currentContact.original_service,
                                target: currentService,
                            }

                            const resultsOutput = (success: boolean, error?: Maybe<Error>) => ({
                                ..._base,
                                success,
                                error
                            })


                            // const servicesToSyncTo: ThirdPartyService[] = syncToServicesMap[currentService] 
                            // const newResults: _syncToServicesResultEntry[] = servicesToSyncTo.reduce(async (_all: Promise<_syncToServicesResultEntry[]>, targetService:): Promise<_syncToServicesResultEntry[]> => {

                            try {
                                // if (currentService === ThirdPartyService.Podium) {
                                //     console.group(`================================================================`)
                                //         console.log("INCOMING PODIUM CONTACT FOR SYNC")
                                //         console.log(currentContact)
                                //     console.groupEnd()
                                // }

                                // await Wait(75)

                                // TODO -- For Boulevard, need rate limiting awareness

                                const addedContact = await syncContactToService[currentService](currentContact)
                                const { id } = currentContact

                                if (typeof(id) === 'undefined') {
                                    throw new Error('GeneralContact id is undefined')
                                }

                                // I need to actually add the service_id now, since I forgot to for some reason

                                const newServiceId = (() => {
                                    const data: ThirdPartyServiceMap<() => string> = {
                                        [ThirdPartyService.Boulevard]: () => ((addedContact as Client).id as string),
                                        [ThirdPartyService.Podium]: () => getContactIdentifier(addedContact as Contact),
                                        [ThirdPartyService.GoHighLevel]: () => {
                                            throw new Error("Not implemented")
                                        }
                                    }

                                    return data[currentService]()
                                })()

                                if (typeof(newServiceId) === 'undefined') {
                                    throw new Error("Could not get service ID from addedContact / client")
                                }

                                await updateGeneralContactServiceIdsValue(`${id}`, currentService, newServiceId)

                                await updateGeneralContactSyncedWithServicesValue(`${id}`, currentService, true)

                                // const getLockId = (destinationService: ThirdPartyService, contact: GeneralContact): string => {
                                //     const _tree: ThirdPartyServiceMap<() => string> = {
                                //         [ThirdPartyService.Boulevard]: () => contact.uid,
                                //         [ThirdPartyService.Podium]: () => {
                                //             getContactIdentifier()
                                //         },
                                //         [ThirdPartyService.GoHighLevel]: () => {
                                //             throw new Error("Not Implemented")
                                //         },
                                //     }
                                // }

                                // await reduceServiceLockValueByOne(currentService, CreateOrUpdate.Create, currentContact.original_service)

                                // Wait before proceeding to reduce chances of rate limiting issues
                                await Wait(50)

                                return new Promise(resolve => resolve([
                                    ..._existing,
                                    resultsOutput(true)
                                ]))
                            } catch (error) {
                                return new Promise((resolve) => resolve([
                                    ..._existing,
                                    resultsOutput(false, error as Error)
                                ]))
                            }
                        }, [])

                    const newResult = {
                        ...existingResults,
                        [currentService]: results
                    }
                    
                    return new Promise(resolve => resolve(newResult))
                }, [])
                try {

                    //! Now I need to wipe all service lock values that have accumulated from this operation

                    console.group("++++++++++++++++++++++++++++++++++++++++") 
                    console.log("SYNC RESULTS")
                    Object.keys(syncResults).forEach((serviceKey) => {
                        const serviceItems: SyncToServicesResultEntry[] = syncResults[serviceKey]
                        
                        console.group(`${serviceKey}`)
                        serviceItems.forEach((item) => {
                            console.log(item)
                        })
                        console.groupEnd()
                        // const item: SyncToServicesResultEntry = syncResults[serviceKey]
                    })
                    console.groupEnd()
                } catch (error) { 
                    console.error("lol something went wrong with the import.") // Wait this isn't a lol, this is an absolute disaster")
                    // Nah, it depends on the syncedToService values, and can just be run again if it fails
                }

                // await modifyValue(StateProperties.beforeImportReport, {})
                // await modifyValue(StateProperties.afterImportReport, syncResults)

                await setSyncCompletedValue(true)
            }
            else {
                // console.group("#=#=#=#= SORTED CONTACTS FOR SYNC =#=#=#=#")
                // Object.keys(sortedContacts).forEach((serviceKey) => {
                //     const serviceItems: GeneralContact[] = sortedContacts[serviceKey]

                //     console.group(`!@!@!@!@@!@!@!@! ${serviceKey}: ${serviceItems.length} @!@!@!@!@@!@!@!@!`)
                //     serviceItems.forEach((item) => {
                //         console.log(item)
                //     })
                //     console.log('\n')
                //     console.groupEnd()
                // })
                // console.log("#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#")

                // const { Boulevard, Podium } = sortedContacts

                Object.keys(sortedContacts).forEach(async (serviceKey) => {
                    const serviceItems: GeneralContact[] = sortedContacts[serviceKey]

                    //@ts-ignore
                    await serviceItems.reduce(async (acc: Promise<boolean>, item: GeneralContact): Promise<boolean> => {
                        await acc
                        
                        //@ts-ignore
                        const destination: ThirdPartyService = serviceKey
                        const source: ThirdPartyService = item.original_service


                        try {
                            await addInitialSyncReportEntry(source, destination, item.original_contact_object)

                            return new Promise((resolve) => resolve(true))
                        } catch (error) {
                            console.error(error)

                            return new Promise((resolve) => resolve(false))
                        }
                    }, [])
                })

                announceToConsole(`${skippingTaskPrefix} Import not allowed`)
                await setSyncCompletedValue(true)
            }

            await unlockMutex()
            
        } catch (error) {
            console.error("Could not perform one-time sync")
            console.error(error)

            await unlockMutex()
        }


    } else {
        announceToConsole(`${skippingTaskPrefix} One Time Contact Sync already running`)
    }
})

module.exports = { contactSyncTask, isSyncCompleted: isInitialContactSyncCompleted }