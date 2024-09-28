import { everyMinute, everyNSeconds, onNSecondsEveryMinute, onNSecondsEveryNMinutes } from "../../../constants/cronIntervals"
import { convertThirdPartyContactToGeneralContact, generateSyncedWithServiceObject, getAllGeneralContacts, storeGeneralContactInDatabase, updateGeneralContactServiceIdsValue, updateGeneralContactSyncedWithServicesValue } from "../../../controllers/GeneralContactsController"
import { ContactEqualityType } from "../../../controllers/GeneralContactsController/model/ContactEqualityType"
import { MutexTypes, getMutex, modifyMutex } from "../../../controllers/MutexController"
import { andReduction } from "../../../helpers/ArrayFunctions"
import { checkAllContactImportCompletedValues, getInitialContactImportCompletedValueFunction } from "../../../helpers/checkAllContactImportCompletedValues"
import { CronTask, announceToConsole as _announceToConsole, skippingTaskPrefix } from "../../../lib/CronTask"
import { GeneralContact } from "../../../model/GeneralContact"
import { Maybe } from "../../../model/Maybe"
import { ThirdPartyService } from "../../../model/ThirdPartyService"
import { getPodiumInitialContactSyncCompletedValue } from "../../Podium/stateManager"
import { getAllContacts } from "../../Podium/controllers/ContactController"
import { Contact } from "../../Podium/model/Contact"
import { getInitialContactImportCompletedValue, updateInitialContactImportCompletedValue } from "../StateManager/BlvdStateManager"
import { getAllClients } from "../controllers/ClientController"
import { Client } from "../model/Client"
import { Id } from "../model/Id"
import filterClientsWithNoEmailAndNoPhone from "../helpers/filterClientsWithNoEmailAndNoPhone"
import { generalContactEqualityCheck } from "../../../controllers/GeneralContactsController/generalContactEqualityCheck"


const taskName = "Import Boulevard Contacts"
const service = ThirdPartyService.Boulevard
const mutexType = MutexTypes.ContactImport
const filterForFailures = (item) => !item.success

const importBoulevardContactsTask = CronTask(onNSecondsEveryMinute(35), taskName, async () => {
    const announceToConsole = (text) => _announceToConsole(taskName, text)

    const lockMutex = async () => await modifyMutex(service, mutexType, true)
    const unlockMutex = async () => await modifyMutex(service, mutexType, false)

    if (!await getPodiumInitialContactSyncCompletedValue()) {
        announceToConsole(`${skippingTaskPrefix} Podium initial contact sync has not completed`)
        announceToConsole(`${skippingTaskPrefix} Boulevard client import requires Podium contact sync be completed first`)

        return
    }

    if (await getInitialContactImportCompletedValue()) {
        announceToConsole(`${skippingTaskPrefix} Boulevard clients have already been imported`)

        return
    }

    if (!await getMutex(service, mutexType)) {
        try {
            await lockMutex()

            announceToConsole('Importing Boulevard Clients...')

            // Get all clients from server
            // Convert all clients to GeneralContact
            // Compare all clients with existing Podium contacts
            // TODO - TEST - Clients that do not match need to be added to the database
            // TODO: Clients that match existing contacts need their 
            // TODO:    Boulevard ID added to the serviceIDs column of the existing contact,
            // TODO:    and the synced_to_service value for Boulevard needs to be set to true

            let allClients: Client[]
            try {
                const _allClients = await getAllClients()
                console.log(`## ALL CLIENTS: ${_allClients.length}`)
                
                allClients = _allClients.filter(filterClientsWithNoEmailAndNoPhone)

                console.log(`############### IMPORTING ${allClients.length} Boulevard Clients #################`)
            } catch(error) {
                console.error("Could not get all Boulevard clients from remote server")
                console.error(error)

                throw error
            }
            announceToConsole('Boulevard clients retrieved from server...')

            announceToConsole('Converting Boulevard clients to common format...')
            let allBlvdGeneralContacts: GeneralContact[]
            try {
                //@ts-ignore
                const _allContacts: GeneralContact[] = await allClients.reduce(async (_allClients: Promise<GeneralContact[]>, client: Client): Promise<GeneralContact[]> => {
                    const existingContacts: GeneralContact[] = await _allClients

                    const _contact: GeneralContact = await convertThirdPartyContactToGeneralContact(service, client, generateSyncedWithServiceObject([service]))

                    const returnValue: GeneralContact[] = [
                        ...existingContacts,
                        _contact
                    ]

                    return new Promise((resolve) => resolve(returnValue))
                }, []) 

                allBlvdGeneralContacts = _allContacts
            } catch (error) {
                console.error("Could not convert Boulevard Client to GeneralContact")
                console.error(error)

                throw error
            }

            announceToConsole("Finished converting Boulevard clients to common format...")


            announceToConsole('Retrieving contacts from local database')
            let allGeneralContacts: GeneralContact[] 
            try {
                //? Only check GeneralContacts that don't have a Boulevard service ID already
                allGeneralContacts = (await getAllGeneralContacts())
                    // .filter(contact => typeof(contact.service_ids[service]) === 'undefined')
            } catch (error) {
                console.error("Could not get all Boulevard contacts from remote server")
                console.error(error)

                throw error
            }
            announceToConsole('Finished retrieving contacts from local database')

            // console.log(allPodiumGeneralContacts)

            // console.log("PODIUM CONTACTS")
            // console.log(allPodiumGeneralContacts.filter(({ last_name } => last_name === "Onwuhai"))
            type _mergeObject = {
                generalContactId: string,
                databaseContact: GeneralContact,
                boulevardContact: GeneralContact
            }

            // TODO
            type _ContactSyncMergeObject = {
                create: Set<GeneralContact>, //! Creates also need to be synced to Podium!
                merge: Set<_mergeObject>
            }

            type _MatchObject = {
                match: boolean,
                databaseContact: GeneralContact | undefined
            }

            announceToConsole('Comparing contacts, please wait...')
            //@ts-ignore
            const contactSyncObject: _ContactSyncMergeObject = await allBlvdGeneralContacts.reduce(async (allResults: Promise<_ContactSyncMergeObject>, boulevardContact: GeneralContact): Promise<_ContactSyncMergeObject> => {
                const existingEntries: _ContactSyncMergeObject = await allResults

                // const existingCreateSet: Set<GeneralContact> = await

                // const { service_ids } = currentBoulevardContact

                // const id = service_ids.Boulevard!

                //@ts-ignore
                const contactMatchResult: _MatchObject = await allGeneralContacts.reduce(async (allMatches: Promise<_MatchObject>, databaseContact: GeneralContact): Promise<_MatchObject> => {
                    const existingData: _MatchObject = await allMatches

                    if (existingData.match) {
                        return new Promise((resolve) => resolve(existingData))
                    }

                    const match: boolean = await generalContactEqualityCheck(boulevardContact, databaseContact, ContactEqualityType.Fuzzy)

                    const returnValue: _MatchObject = match ? {
                        match,
                        databaseContact,
                    } : existingData

                    return new Promise((resolve) => resolve(returnValue))

                }, { match: false,})

                const { match: contactMatchFound, databaseContact: existingContact }: _MatchObject = contactMatchResult

                // if (contactMatchFound && typeof(existingContact) === 'undefined') {
                //     return new Promise((resolve) => resolve({
                //         create: existingEntries.create.add(boulevardContact),
                //         merge: existingEntries.merge,
                //     }))
                // }

                // if (!contactMatchFound)

                const createSection = {
                    create: contactMatchFound ? existingEntries.create : existingEntries.create.add(boulevardContact)
                }

                const mergeSection = {
                    merge: contactMatchFound ? existingEntries.merge.add({
                        generalContactId: `${existingContact!.id}`,
                        databaseContact: existingContact!,
                        boulevardContact
                    }) : existingEntries.merge
                }

                const returnValue: _ContactSyncMergeObject= {
                    ...createSection,
                    ...mergeSection
                }  as _ContactSyncMergeObject

                return new Promise((resolve) => resolve(returnValue))
            }, {
                create: new Set<GeneralContact>(),
                merge: new Set<_mergeObject>(),
            })


            announceToConsole(`Finished comparing contacts`)


            // console.log("Create Entries:", Array.from(contactSyncObject.create).length)
            // console.log("Merge Entries:" , Array.from(contactSyncObject.merge).length)
            // console.log(contactSyncObject.merge[0].generalContactId)
            // console.log(contactSyncObject.create[0])

            // console.log("©©©©©©©©©©©©©©©©©©©MERGE")
            // console.log(Array.from(contactSyncObject.merge))

            // TODO

            const { create: contactsToCreate, merge: contactsToMerge } = contactSyncObject
            // Contacts to create should ALL be Boulevard origin GeneralContacts
            // Each create contact needs to go through the typical thing that creates the contact and assigns it to a new object with the required data
            // So basically the create contact thing from Boulevard's webhook receiver
            
            type _createResultEntry = {
                success: boolean,
                contact: GeneralContact,
                error?: Error
            }

            //@ts-ignore
            const createResults: _createResultEntry[] = Array.from(await Array.from(contactsToCreate).reduce( async (allResults: Promise<Set<_createResultEntry>>, currentContact: GeneralContact): Promise<Set<_createResultEntry>> => {
                const existingSet: Set<_createResultEntry> = await allResults

                try {
                    const createdContact = await storeGeneralContactInDatabase(currentContact.original_service, currentContact)

                    const returnValue = existingSet.add({
                        success: true,
                        contact: createdContact,
                    })

                    return new Promise((resolve) => resolve(returnValue))

                } catch (error) {
                    console.error("ERROR COMPILING CONTACT CREATE LIST")
                    console.error(error)

                    const returnValue = existingSet.add({
                        success: false,
                        contact: currentContact,
                        error: (error as Error)
                    })

                    return new Promise((resolve) => resolve(returnValue))
                }
            }, new Set<_createResultEntry>()))

            // console.log("CREATE RESULTS")
            // console.log(createResults)

            if (!andReduction(createResults.map(({ success }) => success))) {
                const errors = createResults.filter(filterForFailures)


                console.group("ERRORS while storing new GeneralContacts")
                errors.forEach(({ success, contact, error}) => {
                    if (success) return

                    const { id } = contact
                    console.error(`Failed creating contact ID: ${typeof(id) === 'undefined' ? '(No ID)' : 'id'}`)
                    console.error(error)
                })

                throw new Error(`Failed creating new contacts`)
            }


            type _mergeResultEntry = {
                success: boolean,
                id: string,
                boulevardId: string,
                error?: Error
            }

            //Contacts to merge need to have the service_id value for boulevard updated with the id contained in the boulevardContact property for each object
            //@ts-ignore
            const mergeResults: _mergeResultEntry[] = await Array.from(contactsToMerge).reduce(async(allResults: Promise<_mergeResultEntry[]>, currentEntry: _mergeObject): Promise<_mergeResultEntry[]> => {
                const existingResults = await allResults
                const { generalContactId: id, boulevardContact, databaseContact } = currentEntry

                // console.log("ORIGINAL SERVICE", databaseContact.original_service)
                // console.log("TEST", ThirdPartyService.Boulevard.toLowerCase())
                // console.log("ORIGINAL SERVICE:", databaseContact.original_service)

                //@ts-ignore
                if (databaseContact.original_service === 'boulevard') {
                    // console.log("THE CODE ABSOLUTELY SHOULD NOT BE MODIFYING CONTACT ID", id)
                    return new Promise((resolve) => resolve(existingResults))
                }

                // console.log(currentEntry)

                const boulevardId = boulevardContact.original_contact_object['id']

                const _returnValue = (success, error: Maybe<Error> = undefined) => (
                    [
                        ...existingResults,
                        {
                            success,
                            id,
                            boulevardId: `${boulevardId}`,
                            error
                        }
                    ]
                )

                try {
                    await updateGeneralContactServiceIdsValue(id, ThirdPartyService.Boulevard, `${boulevardId}`)
                    await updateGeneralContactSyncedWithServicesValue(id, ThirdPartyService.Boulevard, true)

                    return new Promise((resolve) => resolve(_returnValue(true)))

                } catch (error) {
                    console.error("ERROR COMPILING CONTACT MERGE LIST")
                    console.error(error)

                    return new Promise((resolve) => resolve(_returnValue(false, error as Error)))
                }
            }, [])

            if (!andReduction(mergeResults.map(({ success }) => success))) {
                const errors = mergeResults.filter(filterForFailures)

                console.group("ERRORS while merging GeneralContacts")
                errors.forEach(({ success, id, error, boulevardId }) => {
                    if (success) return

                    console.error(`Failed updating contact ID: ${typeof(id) === 'undefined' ? '(No ID)' : 'id'} with Boulevard service ID of ${boulevardId}`)
                    console.error(error)
                })

                throw new Error(`Failed merging contacts`)
            }

            try {
                await updateInitialContactImportCompletedValue(true)
            } catch (error) {
                console.error("Unable to update initial contact import completed state value for Boulevard")
                console.error(error)
                
                throw error
            }         

            await unlockMutex()
        } catch (error) {
            console.error(new Date().toLocaleString(), "--- Error importing Boulevard contacts")
            console.error(error)

            await unlockMutex()
        }
    } else {
        announceToConsole(`${skippingTaskPrefix} Boulevard Contact Import Locked`)
    }
})

module.exports = importBoulevardContactsTask