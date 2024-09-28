import { convertGeneralContactToThirdPartyContact, convertThirdPartyContactToGeneralContact, generateSyncedWithServiceObject, getGeneralContactPrimaryKeyWithServiceContactId, getGeneralContactWithPrimaryKey, storeGeneralContactInDatabase, updateGeneralContactInDatabase, updateGeneralContactServiceIdsValue, updateGeneralContactSyncedWithServicesValue } from "../../../../controllers/GeneralContactsController"
import { TagTracker } from "../../../../controllers/StateManager/model/TagTracker"
import { incrementServiceIdLock, reduceServiceLockValueByOne } from "../../../../controllers/WebhookLocksController"
import { WebhooksQueueTableRow } from "../../../../controllers/WebhooksQueue/model/WebhooksQueueTableRow"
import { updateWebhooksQueueEntryErrorValue } from "../../../../controllers/WebhooksQueue/tableController/updateWebhooksQueueEntryErrorValue"
import { updateWebhooksQueueEntrySuccessValue } from "../../../../controllers/WebhooksQueue/tableController/updateWebhooksQueueEntrySuccessValue"
import { CreateOrUpdate } from "../../../../model/CreateOrUpdate"
import { GeneralContact } from "../../../../model/GeneralContact"
import { Maybe } from "../../../../model/Maybe"
import { ThirdPartyService } from "../../../../model/ThirdPartyService"
import { createOrUpdateClient, getClientInfoUsingId } from "../../../Blvd/controllers/ClientController"
import { Client } from "../../../Blvd/model/Client"
import { getContactIdentifier } from "../../controllers/ContactController/helpers/getContactIdentifier"
import { Contact } from "../../model/Contact"
import { WebhookMessage } from "../../model/WebhookMessage"
import { getTagTracker } from "../../tagTracker/getTagTracker"
import { getTagTracker as getBoulevardTagTracker } from '../../../Blvd/StateManager/BlvdStateManager'
import { CreateOrUpdateContactCustomWebhookQueueData } from "../model/createOrUpdateContactCustomWebhookQueueData"
import { removeTagFromClient } from "../../../Blvd/controllers/TagsController/removeTagFromClient"
import { andReduction } from "../../../../helpers/ArrayFunctions"
import { hasWebhookLock } from "../../../../helpers/hasWebhookLock"
import { respondWithStatusCode } from "../../../../helpers/HTTPResponseHelper"

const service = ThirdPartyService.Podium

// const createOrUpdateContact = async (createOrUpdate: CreateOrUpdate, contactData, forceUpdate: boolean = false): Promise<boolean> => {
const createOrUpdateContact = async (queueEntry: WebhooksQueueTableRow): Promise<boolean> => {

    const { id: queueEntryId, webhook_data: requestObject } = queueEntry
    const { customData } = requestObject 
    const { createOrUpdate, contactData, forceUpdate, doNotAlterQueueEntry } = customData as CreateOrUpdateContactCustomWebhookQueueData

    const isUpdate = createOrUpdate === CreateOrUpdate.Update || forceUpdate

    const [ oldContact, newContact ] = [contactData.before as Contact, contactData.after as Contact]

    // const webhookLockContactId = getContactIdentifier(typeof(oldContact.name) !== 'undefined' ? oldContact : typeof(newContact.name) !== 'undefined'? newContact : oldContact)

    // if (await hasWebhookLock(service, CreateOrUpdate.Create, webhookLockContactId)) {
    //     console.log("Podium Contact Created HAS WEBHOOK LOCK")

    //     await reduceServiceLockValueByOne(service, CreateOrUpdate.Create, webhookLockContactId)

    //     return new Promise((resolve) => resolve(true))
    // }

    // const oldContactId = (isUpdate ? oldContact : newContact).uid
    const oldContactId = getContactIdentifier(isUpdate ? oldContact : newContact)

    try {
        const generalContact: GeneralContact = await convertThirdPartyContactToGeneralContact(
            ThirdPartyService.Podium, 
            newContact, 
            generateSyncedWithServiceObject([ThirdPartyService.Podium])
        )

        // console.log("General contact created")
        // console.log(generalContact)

        // Check if contact already exists in database
        // const primaryKey = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Podium, oldContactId)
        // const primaryKey = await getGeneralContactPrimaryKeyFromOriginalContactObjectID(ThirdPartyService.Podium, oldContactId)
        const primaryKey = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Podium, oldContactId)
        // getContactIdentifier(oldContact)
        
        
        // console.log("CREATE OR UPDATE?", createOrUpdate)
        // console.log("PRIMARY KEY: " + primaryKey)
        
        const primaryKeyEmpty = typeof(primaryKey) === 'undefined'
        // console.log("Primary Key is empty?", primaryKeyEmpty)

        const oldContactObject: Maybe<GeneralContact> = !primaryKeyEmpty ? await getGeneralContactWithPrimaryKey(primaryKey || "") : undefined

        const hasOldContactObject = typeof(oldContactObject) !== 'undefined'

        if (forceUpdate && !hasOldContactObject) {
            throw new Error(`Could not find old contact object while forcing update`)
        }

        const actionFunction = async (createOrUpdate: CreateOrUpdate): Promise<GeneralContact> => {
            try {

                const _contact: GeneralContact = hasOldContactObject ? {
                    ...generalContact,
                    synced_with_service: oldContactObject.synced_with_service
                } : generalContact
                
                // console.log("FINAL ACTION FUNCTION OBJECT")
                // console.log(_contact)

                if (forceUpdate && typeof(_contact.synced_with_service[ThirdPartyService.Boulevard]) === 'undefined' ) {
                    return new Promise((_, reject) => reject(new Error(`This piece of shit attempted to obliterate my Boulevard synced_with_service value. Not today, asshole!`)))
                }

                const result = await (createOrUpdate === CreateOrUpdate.Create ? storeGeneralContactInDatabase(ThirdPartyService.Podium, _contact) : updateGeneralContactInDatabase(primaryKey!, _contact))
                
                return new Promise((resolve) => resolve(result))
            } catch (error) {
                console.error('Error in createOrUpdateContact actionFunction for Podium') 
                console.error(error)

                return new Promise((_, reject) => reject(error))
            }

        }

        const action: CreateOrUpdate = forceUpdate ? CreateOrUpdate.Update : primaryKeyEmpty ? CreateOrUpdate.Create : CreateOrUpdate.Update
        
        //  - Now determine if I need to add or update a Boulevard client
        //  -- (Check the PrimaryKey object for a service_ids entry for boulevard)
        //  -- if there's an entry, update the boulevard client too
        //  -- if there's no entry, create a new client and then update the GeneralContact 
        //  --      with the contents of the generalContact and { ...generalContact.service_ids, [ThirdPartyService.Boulevard]: (new id)}
        //  --          and set synced_with_service to true for boulevard as well

        // Add / Update the new contact
        const addedContact: GeneralContact = await actionFunction(action)


        console.group("ADDED CONTACT")
            console.log(addedContact)
        console.groupEnd()

        // console.group("OLD CONTACT OBJECT")
        //     console.log(oldContactObject)
        // console.groupEnd()

        if (typeof(addedContact.id) === 'undefined') {
            throw new Error(`addedContact is undefined`)

        }

        const addedContactPrimaryKey = addedContact.id!


        // const blvdPrimaryKey = addedContact!.service_ids[ThirdPartyService.Boulevard]
        const blvdPrimaryKey = (hasOldContactObject ? oldContactObject! : addedContact).service_ids[ThirdPartyService.Boulevard]

        console.log("NEW CONTACT THINGY BLVD PRIMARY KEY")
        console.log(blvdPrimaryKey)

        if (typeof(blvdPrimaryKey) === 'undefined' && forceUpdate) {
            // Skip this call, it has no right to run
            return true
        }
    
        const createOrUpdateBlvd = ((): CreateOrUpdate => {
            if (forceUpdate) return CreateOrUpdate.Update
            if (typeof(blvdPrimaryKey) === 'undefined') {
                // Create New Client
                return CreateOrUpdate.Create
            } else {
                if (blvdPrimaryKey === "" || blvdPrimaryKey.length <= 0) {
                    // Create new Client
                    return CreateOrUpdate.Create
                } else {
                    // Update client
                    return CreateOrUpdate.Update
                }
            }
        })()

        const newBoulevardClient: Client = await convertGeneralContactToThirdPartyContact(ThirdPartyService.Boulevard, addedContact) as Client

        console.log("CREATE OR UPDATE BLVD CONTACT?")
        console.log(createOrUpdateBlvd)

        // if (createOrUpdateBlvd === CreateOrUpdate.Update) {
            // await incrementServiceIdLock(ThirdPartyService.Boulevard, createOrUpdateBlvd, blvdPrimaryKey)
        // }

        const blvdActions: {[key in CreateOrUpdate]: () => Promise<Maybe<string>>} = {
            [CreateOrUpdate.Create]: async (): Promise<Maybe<string>> => {
                try {
                    //@ts-ignore
                    const newClient: Maybe<Client> = await createOrUpdateClient(newBoulevardClient)

                    // console.group("CREATED NEW BLVD CLIENT FROM PODIUM")
                    // console.log(newClient)
                    // console.groupEnd()

                    const newId = newClient!.id as string
                    
                    await incrementServiceIdLock(ThirdPartyService.Boulevard, CreateOrUpdate.Create, newId)

                    return new Promise((resolve) => resolve(newId))

                } catch (error) {
                    console.error(`Could not create new Boulevard client from Podium contact`)
                    console.error(error)

                    return new Promise((_, reject) => reject(error))
                }
            },
            [CreateOrUpdate.Update]: async (): Promise<Maybe<string>> => {
                try {
                    const existingClient = await getClientInfoUsingId(blvdPrimaryKey!)

                    const finalData = {
                        ...existingClient,
                        ...newBoulevardClient
                    }

                    // console.group("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= BLVD DATA TO UPDATE FROM PODIUM")
                    // console.log(finalData)
                    // console.groupEnd()

                    const finalClient: Maybe<Client> = await createOrUpdateClient(finalData, blvdPrimaryKey!)

                    // console.group("UPDATED BLVD CLIENT FROM PODIUM")
                    // console.log(finalClient)
                    // console.groupEnd()

                    const newId = finalClient!.id as string

                    await incrementServiceIdLock(ThirdPartyService.Boulevard, CreateOrUpdate.Update, newId)

                    return new Promise((resolve) => resolve(newId))

                } catch (error) {
                    console.error(`Could not update Boulevard client with Podium contact`)
                    console.error(error)

                    return new Promise((_, reject) => reject(error))
                }
            }
        }
        
        const newBlvdPrimaryKey = await blvdActions[createOrUpdateBlvd]()

        if (typeof(newBlvdPrimaryKey) === 'undefined') {
            throw new Error("No primary key returned from BlvdActions")
        }

        // console.log("NEW BLVD primary key:", newBlvdPrimaryKey)

        // Now add the newBlvdPrimaryKey to the Webhooks lock
        // if (createOrUpdateBlvd === CreateOrUpdate.Create) {
        // await addServiceIdLock(ThirdPartyService.Boulevard, newBlvdPrimaryKey)
        // }

        // Update the GeneralContact with the new service_id for Boulevard and update the synced_with_service value
        // if (createOrUpdateBlvd === CreateOrUpdate.Create) {
            // console.log("UPDATE GENERAL CONTACT WITH NEW BLVD PRIMARY KEY")
        //! Needs to run every time or the Boulevard service ID will be removed for some reason
        await updateGeneralContactServiceIdsValue(`${addedContactPrimaryKey}`, ThirdPartyService.Boulevard, newBlvdPrimaryKey!)
        // }

        // Update synced_with_service value
        await updateGeneralContactSyncedWithServicesValue(`${addedContactPrimaryKey}`, ThirdPartyService.Boulevard, true)


        //! TODO -- Convert the generalContact object into a boulevard contact object 
        //! Now, run the contact sync check
        //! First step is to check if the newly added contact has a matching Boulevard contact in the database already
        //! If it does, update that with the new data from the new GeneralContact object
        //! and update the remote Boulevard client with that new GeneralContact object
        //! (It's an update but is really a complete replacement of the original object by combining the new data with the old data)
        //! If there is no existing contact entry, create the new client on Boulevard, and update the "synced_to_service" setting for Boulevard to true
        //! THIS WILL LIKELY NEED TO BE MORE IN-DEPTH THAN THIS 

        // return new Promise((resolve) => resolve(true))

        if (!doNotAlterQueueEntry) {
            await updateWebhooksQueueEntrySuccessValue(queueEntryId, true)
        }

        return new Promise((resolve) => resolve(true))
    }
     catch (error) {
        console.error(`ERROR: Could not create or update contact`)
        console.error(error)

        // return new Promise((resolve) => resolve(false))
        if (!doNotAlterQueueEntry) {

            await updateWebhooksQueueEntrySuccessValue(queueEntryId, false)
            await updateWebhooksQueueEntryErrorValue(queueEntryId, error as Error)

            return new Promise((resolve) => resolve(true))
        } 

        return new Promise((_, reject) => reject(error))
    }
}

export const podiumContactUpdated = async (queueEntry: WebhooksQueueTableRow): Promise<boolean> => {
    const { id: queueEntryId, webhook_data: requestObject } = queueEntry
    const { customData, data, metadata }: { customData: CreateOrUpdateContactCustomWebhookQueueData } & WebhookMessage<Contact> = requestObject 
    const { contactData } = customData

    let contactId
    try {

        const _contactId = getContactIdentifier(contactData.before)

        contactId = _contactId
    } catch (error) {
        console.error(error)

        // return respondWithStatusCode(res, 200)

        await updateWebhooksQueueEntrySuccessValue(queueEntryId, false)
        await updateWebhooksQueueEntryErrorValue(queueEntryId, error as Error)

        return new Promise((resolve) => resolve(true))
    }

    // if (await hasWebhookLock(service, CreateOrUpdate.Update, contactId)) {
    //     console.log("Podium Contact Updated HAS WEBHOOK LOCK")

    //     await reduceServiceLockValueByOne(service, CreateOrUpdate.Update, contactId)

    //     return new Promise((resolve) => resolve(true))
    // }

    try {

        // Need to get the Boulevard client ID for the contact
        const generalContactPrimaryKey = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Podium, contactId)

        if (typeof(generalContactPrimaryKey) === 'undefined') {
            throw new Error(`Could not find contact ${contactId} in database`)
        }

        const clientId = (await getGeneralContactWithPrimaryKey(generalContactPrimaryKey))!.service_ids[ThirdPartyService.Boulevard]

        // Iterate through old tags
        // If old tag doesn't exist in new tags, add that tag to the result
        // Final result will be tags to remove
        const oldTags = contactData.before.tags
        const newTags = contactData.after.tags

        const getUidMapFunc = (item) => item.uid

        const newTagsJustUid = newTags.map(getUidMapFunc)
        

        // const [ oldTagsLabels, newTagsLabels ] = 

        const tagsToRemove = oldTags
            .filter(item => !newTagsJustUid.includes(item.uid))
            .map(({uid}) => uid)

        // console.log("TAGS TO REMOVE")
        // console.log(tagsToRemove)

        // Add Contact
        // const addContactResult: boolean = await createOrUpdateContact(CreateOrUpdate.Update, data, true)
        const addContactResult: boolean = await createOrUpdateContact({
            ...queueEntry,
            webhook_data: {
                ...queueEntry.webhook_data,
                customData: {
                    ...queueEntry.webhook_data.customData,
                    createOrUpdate: CreateOrUpdate.Update,
                    forceUpdate: true,
                    doNotAlterQueueEntry: true
                } as CreateOrUpdateContactCustomWebhookQueueData
            }
        })
        

        // Remove any tags
        //@ts-ignore
        const removeTagsResult: boolean[] = await tagsToRemove.reduce(async (allResults: Promise<boolean[]>, podiumTagId: string): Promise<boolean[]> => {
            const existing = await allResults
            try {
                // await removeTagFromContact(contactId, tagObject.uid!)
                
                // I need to take the label of the tabObject and use that to get the Boulevard tag ID using the boulevard tag tracker
                const podiumTagTracker: TagTracker = await getTagTracker()
                const podiumTagLabel = Object.keys(podiumTagTracker).find((item) => podiumTagTracker[item] === podiumTagId)
                
                if (typeof(podiumTagLabel) === 'undefined') {
                    throw new Error(`Could not find tag ${podiumTagId} in Podium tag tracker for label retrieval`)
                }
                
                // console.log("TAG TO REMOVE FROM BOULEVARD")
                // console.log(podiumTagLabel)
               
                const boulevardTagId: string = await ( async () => {
                    const tagId = (await getBoulevardTagTracker())[podiumTagLabel]

                    if (typeof(tagId) === 'undefined') {
                        throw new Error(`Could not find tag ${podiumTagLabel} in Boulevard tag tracker`)
                    }

                    return new Promise((resolve) => resolve(tagId))
                })()
                                    
                await removeTagFromClient(clientId, boulevardTagId)

                return new Promise((resolve) => resolve([ ...existing, true ]))
            } catch (error) {
                console.error(error)
                return new Promise((resolve) => resolve([ ...existing, false ]))
            }
        }, [])

        const resultsAllGood = andReduction([addContactResult,...removeTagsResult])

        await updateWebhooksQueueEntrySuccessValue(queueEntryId, resultsAllGood)

        return new Promise((resolve) => resolve(true))
        // return respondWithStatusCode(res, resultsAllGood  ? 200 : 500)
    } catch (error) {
        console.error("Error updating Podium contact")
        console.error(error)

        // return respondWithStatusCode(res, 200)

        await updateWebhooksQueueEntrySuccessValue(queueEntryId, false)
        await updateWebhooksQueueEntryErrorValue(queueEntryId, error as Error)

        return new Promise((resolve) => resolve(true))
    }
}

export default createOrUpdateContact