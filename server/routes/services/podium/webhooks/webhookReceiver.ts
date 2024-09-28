import { createHmac } from "crypto";
import { asyncRoute } from "../../../../helpers/AsyncRouteHelper";
import { WebPathHelper } from "../../../../helpers/WebPathHelper";
import { ThirdPartyService } from "../../../../model/ThirdPartyService";
import { WebhookType } from "../../../../controllers/WebhooksController/model/WebhookType";
import { getWebhookSecret } from "../../../../controllers/WebhooksController/WebhookStateManager";
import { StatusCodes, respondWithStatusCode } from "../../../../helpers/HTTPResponseHelper";
import { WebhookMessage } from "../../../../ThirdPartyServices/Podium/model/WebhookMessage";
import { Contact } from "../../../../ThirdPartyServices/Podium/model/Contact";
import { GeneralContact } from "../../../../model/GeneralContact";
import { convertThirdPartyContactToGeneralContact, convertGeneralContactToThirdPartyContact, generateSyncedWithServiceObject, getGeneralContactPrimaryKeyWithServiceContactId, getGeneralContactWithOriginalID, getGeneralContactWithPrimaryKey, storeGeneralContactInDatabase, updateGeneralContactDeletedValue, updateGeneralContactInDatabase, updateGeneralContactServiceIdsValue, updateGeneralContactSyncedWithServicesValue } from "../../../../controllers/GeneralContactsController";
import { createOrUpdateClient, getClientInfoUsingId } from "../../../../ThirdPartyServices/Blvd/controllers/ClientController";
import { Client } from "../../../../ThirdPartyServices/Blvd/model/Client";
import { Maybe } from "../../../../model/Maybe";
import { CreateOrUpdate } from '../../../../model/CreateOrUpdate'
import { incrementServiceIdLock, reduceServiceLockValueByOne } from "../../../../controllers/WebhookLocksController";
import { hasWebhookLock } from "../../../../helpers/hasWebhookLock";
import { getContactIdentifier } from "../../../../ThirdPartyServices/Podium/controllers/ContactController/helpers/getContactIdentifier";
import { refreshTagTracker } from "../../../../ThirdPartyServices/Podium/tagTracker/refreshTagTracker";
import { removeTagFromContact } from "../../../../ThirdPartyServices/Podium/controllers/ContactTagsController/removeTagFromContact";
import { andReduction } from "../../../../helpers/ArrayFunctions";
import { ContactObjectTag } from "../../../../ThirdPartyServices/Podium/model/ContactObjectTag";
import { getTagTracker as getBoulevardTagTracker } from "../../../../ThirdPartyServices/Blvd/StateManager/BlvdStateManager";
import { removeTagFromClient } from "../../../../ThirdPartyServices/Blvd/controllers/TagsController/removeTagFromClient";
import { getTagTracker } from "../../../../ThirdPartyServices/Podium/tagTracker/getTagTracker";
import { TagTracker } from "../../../../controllers/StateManager/model/TagTracker";
import { verifyWebhookSignature } from "./helpers/verifyWebhookSignature";
import { addWebhookEntryToQueueAndAwaitProcessing } from "../../../helpers/webhooksQueueEntryHelper";
import { CreateOrUpdateContactCustomWebhookQueueData } from "../../../../ThirdPartyServices/Podium/webhooks/model/createOrUpdateContactCustomWebhookQueueData";

const routeRoot: string = "/services/podium/webhookReceiver"
const url: WebPathHelper = WebPathHelper(routeRoot)

const service = ThirdPartyService.Podium

// TODO -- Add part where it syncs the final contact object to the other service
// TODO -- The service syncing part should be its own thing that uses the ThirdPartyService enum
// TODO -- And I just call it up with these things below, and it'll add or update the new contact to the other place, 
// TODO -- And return a true / false promise
// const createOrUpdateContact = async (createOrUpdate: CreateOrUpdate, contactData, forceUpdate: boolean = false): Promise<boolean> => {
//     const isUpdate = createOrUpdate === CreateOrUpdate.Update || forceUpdate

//     const [ oldContact, newContact ] = [contactData.before as Contact, contactData.after as Contact]

//     // const oldContactId = (isUpdate ? oldContact : newContact).uid
//     const oldContactId = getContactIdentifier(isUpdate ? oldContact : newContact)

//     try {
//         const generalContact: GeneralContact = await convertThirdPartyContactToGeneralContact(
//             ThirdPartyService.Podium, 
//             newContact, 
//             generateSyncedWithServiceObject([ThirdPartyService.Podium])
//         )

//         // console.log("General contact created")
//         // console.log(generalContact)

//         // Check if contact already exists in database
//         // const primaryKey = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Podium, oldContactId)
//         // const primaryKey = await getGeneralContactPrimaryKeyFromOriginalContactObjectID(ThirdPartyService.Podium, oldContactId)
//         const primaryKey = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Podium, oldContactId)
//         // getContactIdentifier(oldContact)
        
        
//         // console.log("CREATE OR UPDATE?", createOrUpdate)
//         // console.log("PRIMARY KEY: " + primaryKey)
        
//         const primaryKeyEmpty = typeof(primaryKey) === 'undefined'
//         // console.log("Primary Key is empty?", primaryKeyEmpty)

//         const oldContactObject: Maybe<GeneralContact> = !primaryKeyEmpty ? await getGeneralContactWithPrimaryKey(primaryKey || "") : undefined

//         const hasOldContactObject = typeof(oldContactObject) !== 'undefined'

//         if (forceUpdate && !hasOldContactObject) {
//             throw new Error(`Could not find old contact object while forcing update`)
//         }

//         const actionFunction = async (createOrUpdate: CreateOrUpdate): Promise<GeneralContact> => {
//             try {

//                 const _contact: GeneralContact = hasOldContactObject ? {
//                     ...generalContact,
//                     synced_with_service: oldContactObject.synced_with_service
//                 } : generalContact
                
//                 // console.log("FINAL ACTION FUNCTION OBJECT")
//                 // console.log(_contact)

//                 if (forceUpdate && typeof(_contact.synced_with_service[ThirdPartyService.Boulevard]) === 'undefined' ) {
//                     return new Promise((_, reject) => reject(new Error(`This piece of shit attempted to obliterate my Boulevard synced_with_service value. Not today, asshole!`)))
//                 }

//                 const result = await (createOrUpdate === CreateOrUpdate.Create ? storeGeneralContactInDatabase(ThirdPartyService.Podium, _contact) : updateGeneralContactInDatabase(primaryKey!, _contact))
                
//                 return new Promise((resolve) => resolve(result))
//             } catch (error) {
//                 console.error('Error in createOrUpdateContact actionFunction for Podium') 
//                 console.error(error)

//                 return new Promise((_, reject) => reject(error))
//             }

//         }

//         const action: CreateOrUpdate = forceUpdate ? CreateOrUpdate.Update : primaryKeyEmpty ? CreateOrUpdate.Create : CreateOrUpdate.Update
        
//         //  - Now determine if I need to add or update a Boulevard client
//         //  -- (Check the PrimaryKey object for a service_ids entry for boulevard)
//         //  -- if there's an entry, update the boulevard client too
//         //  -- if there's no entry, create a new client and then update the GeneralContact 
//         //  --      with the contents of the generalContact and { ...generalContact.service_ids, [ThirdPartyService.Boulevard]: (new id)}
//         //  --          and set synced_with_service to true for boulevard as well

//         // Add / Update the new contact
//         const addedContact: GeneralContact = await actionFunction(action)


//         console.group("ADDED CONTACT")
//             console.log(addedContact)
//         console.groupEnd()

//         // console.group("OLD CONTACT OBJECT")
//         //     console.log(oldContactObject)
//         // console.groupEnd()

//         if (typeof(addedContact.id) === 'undefined') {
//             throw new Error(`addedContact is undefined`)
//         }

//         const addedContactPrimaryKey = addedContact.id!


//         // const blvdPrimaryKey = addedContact!.service_ids[ThirdPartyService.Boulevard]
//         const blvdPrimaryKey = (hasOldContactObject ? oldContactObject! : addedContact).service_ids[ThirdPartyService.Boulevard]

//         console.log("NEW CONTACT THINGY BLVD PRIMARY KEY")
//         console.log(blvdPrimaryKey)

//         if (typeof(blvdPrimaryKey) === 'undefined' && forceUpdate) {
//             // Skip this call, it has no right to run
//             return true
//         }
    
//         const createOrUpdateBlvd = ((): CreateOrUpdate => {
//             if (forceUpdate) return CreateOrUpdate.Update
//             if (typeof(blvdPrimaryKey) === 'undefined') {
//                 // Create New Client
//                 return CreateOrUpdate.Create
//             } else {
//                 if (blvdPrimaryKey === "" || blvdPrimaryKey.length <= 0) {
//                     // Create new Client
//                     return CreateOrUpdate.Create
//                 } else {
//                     // Update client
//                     return CreateOrUpdate.Update
//                 }
//             }
//         })()

//         const newBoulevardClient: Client = await convertGeneralContactToThirdPartyContact(ThirdPartyService.Boulevard, addedContact) as Client

//         console.log("CREATE OR UPDATE BLVD CONTACT?")
//         console.log(createOrUpdateBlvd)

//         // if (createOrUpdateBlvd === CreateOrUpdate.Update) {
//             // await incrementServiceIdLock(ThirdPartyService.Boulevard, createOrUpdateBlvd, blvdPrimaryKey)
//         // }

//         const blvdActions: {[key in CreateOrUpdate]: () => Promise<Maybe<string>>} = {
//             [CreateOrUpdate.Create]: async (): Promise<Maybe<string>> => {
//                 try {
//                     //@ts-ignore
//                     const newClient: Maybe<Client> = await createOrUpdateClient(newBoulevardClient)

//                     // console.group("CREATED NEW BLVD CLIENT FROM PODIUM")
//                     // console.log(newClient)
//                     // console.groupEnd()

//                     const newId = newClient!.id as string
                    
//                     await incrementServiceIdLock(ThirdPartyService.Boulevard, CreateOrUpdate.Create, newId)

//                     return new Promise((resolve) => resolve(newId))

//                 } catch (error) {
//                     console.error(`Could not create new Boulevard client from Podium contact`)
//                     console.error(error)

//                     return new Promise((_, reject) => reject(error))
//                 }
//             },
//             [CreateOrUpdate.Update]: async (): Promise<Maybe<string>> => {
//                 try {
//                     const existingClient = await getClientInfoUsingId(blvdPrimaryKey!)

//                     const finalData = {
//                         ...existingClient,
//                         ...newBoulevardClient
//                     }

//                     // console.group("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= BLVD DATA TO UPDATE FROM PODIUM")
//                     // console.log(finalData)
//                     // console.groupEnd()

//                     const finalClient: Maybe<Client> = await createOrUpdateClient(finalData, blvdPrimaryKey!)

//                     // console.group("UPDATED BLVD CLIENT FROM PODIUM")
//                     // console.log(finalClient)
//                     // console.groupEnd()

//                     const newId = finalClient!.id as string

//                     await incrementServiceIdLock(ThirdPartyService.Boulevard, CreateOrUpdate.Update, newId)

//                     return new Promise((resolve) => resolve(newId))

//                 } catch (error) {
//                     console.error(`Could not update Boulevard client with Podium contact`)
//                     console.error(error)

//                     return new Promise((_, reject) => reject(error))
//                 }
//             }
//         }
        
//         const newBlvdPrimaryKey = await blvdActions[createOrUpdateBlvd]()

//         if (typeof(newBlvdPrimaryKey) === 'undefined') {
//             throw new Error("No primary key returned from BlvdActions")
//         }

//         // console.log("NEW BLVD primary key:", newBlvdPrimaryKey)

//         // Now add the newBlvdPrimaryKey to the Webhooks lock
//         // if (createOrUpdateBlvd === CreateOrUpdate.Create) {
//         // await addServiceIdLock(ThirdPartyService.Boulevard, newBlvdPrimaryKey)
//         // }

//         // Update the GeneralContact with the new service_id for Boulevard and update the synced_with_service value
//         // if (createOrUpdateBlvd === CreateOrUpdate.Create) {
//             // console.log("UPDATE GENERAL CONTACT WITH NEW BLVD PRIMARY KEY")
//         //! Needs to run every time or the Boulevard service ID will be removed for some reason
//         await updateGeneralContactServiceIdsValue(`${addedContactPrimaryKey}`, ThirdPartyService.Boulevard, newBlvdPrimaryKey!)
//         // }

//         // Update synced_with_service value
//         await updateGeneralContactSyncedWithServicesValue(`${addedContactPrimaryKey}`, ThirdPartyService.Boulevard, true)


//         //! TODO -- Convert the generalContact object into a boulevard contact object 
//         //! Now, run the contact sync check
//         //! First step is to check if the newly added contact has a matching Boulevard contact in the database already
//         //! If it does, update that with the new data from the new GeneralContact object
//         //! and update the remote Boulevard client with that new GeneralContact object
//         //! (It's an update but is really a complete replacement of the original object by combining the new data with the old data)
//         //! If there is no existing contact entry, create the new client on Boulevard, and update the "synced_to_service" setting for Boulevard to true
//         //! THIS WILL LIKELY NEED TO BE MORE IN-DEPTH THAN THIS 

//         return new Promise((resolve) => resolve(true))
//     }
//      catch (error) {
//         console.error(`ERROR: Could not create or update contact`)
//         console.error(error)

//         return new Promise((resolve) => resolve(false))
//     }
// }

// export const processContactId = (res, data) => {
//     let contactId
//     try {

//         const _contactId = getContactIdentifier(data.before)

//         contactId = _contactId
//     } catch (error) {
//         console.error(error)

//         return respondWithStatusCode(res, 200)
//     }
//     return contactId
// }

export const routes = (app) => {
    //TODO - TEST
    //? Contact Created
    // Check if contact exists by using data.after
    app.post(url("/contactCreated"), asyncRoute(async (req, res, _) => {
        console.log("Received contact created webhook for Podium")

        // await refreshTagTracker()

        const [ remoteTimestamp, remoteSignature  ] = [req.header('podium-timestamp'), req.header('podium-signature')]
        const { data, metadata }: WebhookMessage<Contact> = req.body

        console.group(`============================================ Contact Created ============================================`)
        console.log(data)
        console.groupEnd()

        // console.group(`============================================ Contact Created Tags ============================================`)
        // data.after.tags.forEach(tag => console.log(tag))

        // const contactId = getContactIdentifier(data.after)
        
        let contactId
        try {
    
            const _contactId = getContactIdentifier(data.after)
    
            contactId = _contactId
        } catch (error) {
            console.error(error)
    
            return respondWithStatusCode(res, 200)
        }

        // if (await hasWebhookLock(service, getUid(data))) {
        if (await hasWebhookLock(service, CreateOrUpdate.Create, contactId)) {
            console.log("Podium Contact Created HAS WEBHOOK LOCK")

            await reduceServiceLockValueByOne(service, CreateOrUpdate.Create, contactId)

            return respondWithStatusCode(res, 200)
        }

        // await incrementServiceIdLock(service, CreateOrUpdate.Create, contactId)

        if (!await verifyWebhookSignature(WebhookType.ContactCreated, remoteTimestamp, remoteSignature, req.body)) 
            return respondWithStatusCode(res, 400)        

            
        try {
            // await reduceServiceLockValueByOne(ThirdPartyService.Boulevard, CreateOrUpdate.Create, contactId)

            // return respondWithStatusCode(res, await createOrUpdateContact(CreateOrUpdate.Create, data) ? 200 : 500)
            await addWebhookEntryToQueueAndAwaitProcessing(res, req, ThirdPartyService.Podium, WebhookType.ContactCreated, true, {
                contactData: data,
                createOrUpdate: CreateOrUpdate.Create
            } as CreateOrUpdateContactCustomWebhookQueueData)
        } catch (error) {
            console.error("Unable to create contact in database")
            console.error(error)

            return respondWithStatusCode(res, 200)
            // return respondWithStatusCode(res, 500)
        }
    }))

    // TODO - TEST
    //? Contact Updated
    // Check if contact exists by using data.before
    app.post(url("/contactUpdated"), asyncRoute(async (req, res, next) => {
        console.log("Received contact updated webhook for Podium")
        // await refreshTagTracker()


        const [ remoteTimestamp, remoteSignature  ] = [req.header('podium-timestamp'), req.header('podium-signature')]
        const { data, metadata }: WebhookMessage<Contact> = req.body

        console.group(`============================================ Contact Updated ============================================`)
        console.log(data)
        console.log("BEFORE ATTRIBUTES")
        console.log(req.body.data.before.attributes)
        console.log("AFTER ATTRIBUTES")
        console.log(req.body.data.after.attributes)
        console.groupEnd()

        // const contactId = getContactIdentifier(data.after)
        let contactId
        try {
    
            const _contactId = getContactIdentifier(data.before)
    
            contactId = _contactId
        } catch (error) {
            console.error(error)
    
            return respondWithStatusCode(res, 200)
        }
        
        // if (await hasWebhookLock(service, getUid(data))) {
        if (await hasWebhookLock(service, CreateOrUpdate.Update, contactId)) {
            console.log("Podium Contact Updated HAS WEBHOOK LOCK")

            await reduceServiceLockValueByOne(service, CreateOrUpdate.Update, contactId)

            return respondWithStatusCode(res, 200)
        }

        if (!await verifyWebhookSignature(WebhookType.ContactUpdated, remoteTimestamp, remoteSignature, req.body)) 
            return respondWithStatusCode(res, 400)

        try {
            await addWebhookEntryToQueueAndAwaitProcessing(res, req, ThirdPartyService.Podium, WebhookType.ContactUpdated, true, {
                contactData: data,
                createOrUpdate: CreateOrUpdate.Update,
            })
            
        } catch (error) {
                console.error("Error updating Podium contact")
                console.error(error)

                return respondWithStatusCode(res, 200)
        }


        // try {

        //     // Need to get the Boulevard client ID for the contact
        //     const generalContactPrimaryKey = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Podium, contactId)

        //     if (typeof(generalContactPrimaryKey) === 'undefined') {
        //         throw new Error(`Could not find contact ${contactId} in database`)
        //     }

        //     const clientId = (await getGeneralContactWithPrimaryKey(generalContactPrimaryKey))!.service_ids[ThirdPartyService.Boulevard]

        //     // Iterate through old tags
        //     // If old tag doesn't exist in new tags, add that tag to the result
        //     // Final result will be tags to remove
        //     const oldTags = data.before.tags
        //     const newTags = data.after.tags

        //     const getUidMapFunc = (item) => item.uid

        //     const newTagsJustUid = newTags.map(getUidMapFunc)
            

        //     // const [ oldTagsLabels, newTagsLabels ] = 

        //     const tagsToRemove = oldTags
        //         .filter(item => !newTagsJustUid.includes(item.uid))
        //         .map(({uid}) => uid)

        //     // console.log("TAGS TO REMOVE")
        //     // console.log(tagsToRemove)

        //     // Add Contact
        //     const addContactResult: boolean = await createOrUpdateContact(CreateOrUpdate.Update, data, true)
            

        //     // Remove any tags
        //     //@ts-ignore
        //     const removeTagsResult: boolean[] = await tagsToRemove.reduce(async (allResults: Promise<boolean[]>, podiumTagId: string): Promise<boolean[]> => {
        //         const existing = await allResults
        //         try {
        //             // await removeTagFromContact(contactId, tagObject.uid!)
                    
        //             // I need to take the label of the tabObject and use that to get the Boulevard tag ID using the boulevard tag tracker
        //             const podiumTagTracker: TagTracker = await getTagTracker()
        //             const podiumTagLabel = Object.keys(podiumTagTracker).find((item) => podiumTagTracker[item] === podiumTagId)
                    
        //             if (typeof(podiumTagLabel) === 'undefined') {
        //                 throw new Error(`Could not find tag ${podiumTagId} in Podium tag tracker for label retrieval`)
        //             }
                    
        //             // console.log("TAG TO REMOVE FROM BOULEVARD")
        //             // console.log(podiumTagLabel)
                   
        //             const boulevardTagId: string = await ( async () => {
        //                 const tagId = (await getBoulevardTagTracker())[podiumTagLabel]

        //                 if (typeof(tagId) === 'undefined') {
        //                     throw new Error(`Could not find tag ${podiumTagLabel} in Boulevard tag tracker`)
        //                 }

        //                 return new Promise((resolve) => resolve(tagId))
        //             })()
                                        
        //             await removeTagFromClient(clientId, boulevardTagId)

        //             return new Promise((resolve) => resolve([ ...existing, true ]))
        //         } catch (error) {
        //             console.error(error)
        //             return new Promise((resolve) => resolve([ ...existing, false ]))
        //         }
        //     }, [])

        //     const resultsAllGood = andReduction([addContactResult,...removeTagsResult])

        //     return respondWithStatusCode(res, resultsAllGood  ? 200 : 500)
        // } catch (error) {
        //     console.error("Error updating Podium contact")
        //     console.error(error)

        //     return respondWithStatusCode(res, 200)
        //     // return respondWithStatusCode(res, 500)
        // }

    }))

    //TODO
    //? Contact Merged
    // Check if contact exists by using data.before 
    app.post(url("/contactMerged"), asyncRoute(async (req, res, next) => {
        console.log("Received contact merged webhook for Podium")

            return respondWithStatusCode(res, 200)


        const [ remoteTimestamp, remoteSignature  ] = [req.header('podium-timestamp'), req.header('podium-signature')]
        const { data, metadata }: WebhookMessage<Contact> = req.body

        if (!await verifyWebhookSignature(WebhookType.ContactMerged, remoteTimestamp, remoteSignature, req.body)) 
            return respondWithStatusCode(res, 400)

        // console.group("REQUEST BODY:")
        // console.log(req.body)
        // console.groupEnd()
        
        const [oldContact, newContact ] = [data.before as Contact, data.after as Contact]
        const [oldContactId, newContactId ] = [getContactIdentifier(oldContact), getContactIdentifier(newContact)]

        // Need current generalContact from oldContactId
        const oldPk = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Podium, oldContactId)
        const newPk = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Podium, newContactId)

        const oldPkFound = typeof(oldPk) !== 'undefined'

        // if (typeof(oldPk) === 'undefined') {
            // throw new Error(`Could not find contact ID in old contact data for Podium merge`)
        // }

        if (typeof(newPk) === 'undefined') {
            throw new Error(`Podium has not provided any contact information for the new contact that can be identified as an ID, and cannot get the Primary Key for the GeneralContact entry`)
        }

        let existingOldGeneralContact: Maybe<GeneralContact>
        try {
            if (oldPkFound) {
                const _existing = await getGeneralContactWithPrimaryKey(oldPk!)
                existingOldGeneralContact = _existing
            }
        } catch (error) {
            console.error(error)
        }

        const hasExistingOldGeneralContact: boolean = typeof(existingOldGeneralContact) !== 'undefined' && !Object.is(existingOldGeneralContact, null)

        //! If there's no existing contact, just create a new one lol
        //! The old contact, if it exists, need to be set as deleted in the database

        if (hasExistingOldGeneralContact) {
            try {
                await updateGeneralContactDeletedValue(oldPk!, true)
            } catch (error) {
                console.error(`Unable to set contact ${oldPk} as deleted in database`)
            }
        }

        // Now add the new one
        const newGeneralContact: GeneralContact = await convertThirdPartyContactToGeneralContact(
            ThirdPartyService.Podium,
            newContact, 
            generateSyncedWithServiceObject([ThirdPartyService.Podium]),
        )

        try {
            await storeGeneralContactInDatabase(ThirdPartyService.Podium, newGeneralContact)
        } catch (error) {
            console.error(`Unable to store new contact in database`)
        }

        //  Now update the service_id value for Podium
        try {
            await updateGeneralContactServiceIdsValue(newPk!, ThirdPartyService.Podium, newContactId)
        } catch (error) {
            console.error(`Unable to update service_ids value for Podium in contact ${newPk} in database`)
        }

        // Now how the hell do I sync this with Boulevard?
        
        respondWithStatusCode(res, 200)
    }))

    //TODO - TEST -- Has new functionality where, if the contact does not exist already, add it and set it as deleted 
    //? Contact Deleted
    // Check that contact exists by using data.before
    app.post(url("/contactDeleted"), asyncRoute(async (req, res, next) => {
        console.log("Received contact deleted webhook for Podium")

        await addWebhookEntryToQueueAndAwaitProcessing(res, req, ThirdPartyService.Podium, WebhookType.ContactDeleted, true)
        
        // const [ remoteTimestamp, remoteSignature  ] = [req.header('podium-timestamp'), req.header('podium-signature')]
        // const { data, metadata }: WebhookMessage<Contact> = req.body
        
        // if (!await verifyWebhookSignature(WebhookType.ContactDeleted, remoteTimestamp, remoteSignature, req.body)) 
        //     return respondWithStatusCode(res, 400)

        // // console.group("REQUEST BODY:")
        // // console.log(req.body)
        // // console.groupEnd()
        
        // const [ oldContact, newContact ] = [data.before as Contact, data.after as Contact]
        // const oldContactId = oldContact.uid

        // // Get the primary key for the contact with the oldContactId
        // // Change that contact's deleted value to true
        // try {
        //     // const primaryKey = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Podium, oldContactId)
        //     // const primaryKey = await getGeneralContactPrimaryKeyFromOriginalContactObjectID(ThirdPartyService.Podium, oldContactId)

        //     const primaryKey = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Podium, getContactIdentifier(oldContact))

        //     const primaryKeyEmpty = typeof(primaryKey) === 'undefined'

        //     let newContactPrimaryKey
        //     if (primaryKeyEmpty) {
        //         const newGeneralContact: GeneralContact = await convertThirdPartyContactToGeneralContact(
        //             ThirdPartyService.Podium,
        //             oldContact, 
        //             generateSyncedWithServiceObject([ThirdPartyService.Podium])
        //         )

        //         const newDatabaseObject = await storeGeneralContactInDatabase(ThirdPartyService.Podium, newGeneralContact)

        //         newContactPrimaryKey = newDatabaseObject.id
        //     }

        //     await updateGeneralContactDeletedValue(primaryKeyEmpty ? newContactPrimaryKey : primaryKey!, true)

        //     return respondWithStatusCode(res, 200)

        // } catch (error) {
        //     console.error(`Error setting ${ThirdPartyService.Podium} contact with old contact id ${oldContactId} as deleted`)
        //     console.error(error)

        //     // return respondWithStatusCode(res, 500)
        //     return respondWithStatusCode(res, 200)
        // }
    }))


}