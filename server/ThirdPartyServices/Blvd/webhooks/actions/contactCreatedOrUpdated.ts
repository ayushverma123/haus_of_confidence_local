import { convertThirdPartyContactToGeneralContact, generateSyncedWithServiceObject, getGeneralContactPrimaryKeyWithServiceContactId, getGeneralContactWithPrimaryKey, storeGeneralContactInDatabase, updateGeneralContactInDatabase, updateGeneralContactServiceIdsValue, updateGeneralContactSyncedWithServicesValue } from "../../../../controllers/GeneralContactsController"
import { convertSyncedToServicesToThirdPartyServiceArray } from "../../../../controllers/GeneralContactsController/convertSyncedToServicesToThirdPartyServiceArray"
import { syncContactToService } from "../../../../controllers/GeneralContactsController/syncContactToService"
import { incrementServiceIdLock, reduceServiceLockValueByOne } from "../../../../controllers/WebhookLocksController"
import { WebhooksQueueTableRow } from "../../../../controllers/WebhooksQueue/model/WebhooksQueueTableRow"
import { updateWebhooksQueueEntryErrorValue } from "../../../../controllers/WebhooksQueue/tableController/updateWebhooksQueueEntryErrorValue"
import { updateWebhooksQueueEntrySuccessValue } from "../../../../controllers/WebhooksQueue/tableController/updateWebhooksQueueEntrySuccessValue"
import { hasWebhookLock } from "../../../../helpers/hasWebhookLock"
import { CreateOrUpdate } from "../../../../model/CreateOrUpdate"
import { GeneralContact } from "../../../../model/GeneralContact"
import { Maybe } from "../../../../model/Maybe"
import { ThirdPartyService } from "../../../../model/ThirdPartyService"
import { getContactIdentifier } from "../../../Podium/controllers/ContactController/helpers/getContactIdentifier"
import { Contact } from "../../../Podium/model/Contact"
import { refreshTagTracker } from "../../StateManager/TagTracker"
import { getClientInfoUsingId } from "../../controllers/ClientController"
import { Client } from "../../model/Client"
import { ClientWebhookData } from "../../model/Webhooks/ClientWebhookData"

const service: ThirdPartyService = ThirdPartyService.Boulevard


type _CustomData = {
    // customData: any,
    node: ClientWebhookData
}

const intermediaryClient = (originalContact): Client => 
    Object.keys(originalContact).reduce((resultingContact, key: string) => ({
        ...resultingContact,
        [key]: Object.is(originalContact[key], null) ? undefined : originalContact[key]
    }), {}) as Client

const createOrUpdateContact = async (queueEntry: WebhooksQueueTableRow): Promise<boolean> => {
    const { id: queueEntryId, webhook_data: requestObject } = queueEntry
    const { node: originalClient } = requestObject.data as _CustomData

    const { id } = originalClient

        
    try {
        await refreshTagTracker()

        const pk: Maybe<string> = await getGeneralContactPrimaryKeyWithServiceContactId(service, id)
        
        // console.log("PRIMARY KEY FOR BOULEVARD WEBHOOK THING:", pk || "NONE!!!!!")
        
        const remainingClientDetails: Maybe<Client> = await getClientInfoUsingId(id)
        
        const shouldCreateInstead = typeof(pk) === 'undefined' || typeof(remainingClientDetails) === 'undefined'

        const oldContact: Maybe<GeneralContact> = shouldCreateInstead ? undefined : await getGeneralContactWithPrimaryKey(pk)
        const oldContactDoesNotExist = typeof(oldContact) === 'undefined'


        if (!shouldCreateInstead && typeof(oldContact) === 'undefined') {
            throw new Error(`Could not retrieve GeneralContact with primary key ${pk} when updating Boulevard client in response to webhook`)
        }

        const finalClient = {
            ...remainingClientDetails,
            ...intermediaryClient(originalClient)
        }

        // Converts the 
        const syncedWithServiceExistingOut: Maybe<ThirdPartyService[]> = oldContactDoesNotExist ? undefined : convertSyncedToServicesToThirdPartyServiceArray(oldContact!)

        const _finalContact = {
            ...await convertThirdPartyContactToGeneralContact(
                service, 
                finalClient, 
                generateSyncedWithServiceObject( 
                    shouldCreateInstead || oldContactDoesNotExist ? [service] : [ ...syncedWithServiceExistingOut!, service]
                )
            )
        }

        // console.log("_FINAL CONTACT")
        // console.log(_finalContact)

        const finalContact: GeneralContact = shouldCreateInstead ? _finalContact : {
            ..._finalContact,
            service_ids: oldContact!.service_ids,
            id: _finalContact.id
        }

        // console.log("FINAL CONTACT")
        // console.log(finalContact)

        const updatedContactObject: GeneralContact = await (async (): Promise<GeneralContact> => {
            let result: GeneralContact
            if (shouldCreateInstead) {
                result = await storeGeneralContactInDatabase(service, finalContact)
            } else {
                result = await updateGeneralContactInDatabase(pk!, finalContact)
            }

            return new Promise((resolve) => resolve(result))
        })()

        // const newContact = await convertGeneralContactToThirdPartyContact(ThirdPartyService.Podium, updatedContactObject)

        const oldTags = typeof(oldContact) !== 'undefined' || Object.is(oldContact, null) ? (Object.keys(oldContact!.tags).reduce((acc: string[], cv: string): string[] => [...acc, cv], [])) : undefined

        const newestContact: Contact = await syncContactToService[ThirdPartyService.Podium](shouldCreateInstead ? updatedContactObject : finalContact, oldTags) as Contact
        
        const newPk = (() => {
            if (typeof(pk) === 'undefined') return updatedContactObject.id
            return pk
        })()
        
        const podiumId = getContactIdentifier(newestContact)
        
        // await incrementServiceIdLock(ThirdPartyService.Podium, shouldCreateInstead ? CreateOrUpdate.Create : CreateOrUpdate.Update , podiumId)

        try {
            await updateGeneralContactServiceIdsValue(`${newPk}`, ThirdPartyService.Podium, podiumId)
        } catch (error) {
            console.error(`Unable to update GeneralContact serviceID for ${ThirdPartyService.Podium}`)
            console.error(error)
            // return new Promise((_, reject) => reject(error))
        }

        try {
            await updateGeneralContactSyncedWithServicesValue(`${newPk}`, ThirdPartyService.Podium, true)
        } catch (error) {
            console.error(`Unable to update GeneralContact synced_with_service for ${ThirdPartyService.Podium}`)
            console.error(error)
        }

        // console.log("ßßßßßßß New PK")
        // console.log(newPk)

        // console.log("¢¢¢¢¢¢¢¢¢¢¢¢¢¢¢¢ NEWEST CONTACT")
        // console.log(newestContact)

          // podiumId) //newestContact.service_ids[ThirdPartyService.Podium])

          // TODO ????
        return new Promise(resolve => resolve(true))

    } catch (error) {
        // TODO -- ?????
        return new Promise((_, reject) => reject(error))
        // return new Promise((_, reject) => reject(false))
    }
}

export const contactCreated = async (queueEntry: WebhooksQueueTableRow): Promise<boolean> => {
    const { id: queueEntryId, webhook_data: requestObject } = queueEntry
    const { node: originalClient } = requestObject.data as _CustomData

    const { id } = originalClient

    // if (await hasWebhookLock(service, CreateOrUpdate.Create, id)) {
    //     console.log("HAS WEBHOOK LOCK")

    //     try {
    //         await reduceServiceLockValueByOne(service, CreateOrUpdate.Create, id)
    //     } catch (error) {
    //         console.error(`Unable to reduce service lock value for ${service}`)
    //     }

    //     return new Promise(resolve => resolve(true))
    // }

    
    try {
        await incrementServiceIdLock(service, CreateOrUpdate.Create, id)
        
        let result
        try {
            result = await createOrUpdateContact(queueEntry) 
        } catch (error) {
            console.error(`Unable to create Boulevard contact`)
            console.error(error)
        }
            
        await reduceServiceLockValueByOne(ThirdPartyService.Boulevard, CreateOrUpdate.Create, id)

        await updateWebhooksQueueEntrySuccessValue(queueEntryId, result)

        return new Promise((resolve) => resolve(result))
    } catch (error) {
        console.error(`Could not create new General contact for ${service}`)
        console.error(error) 

        await updateWebhooksQueueEntrySuccessValue(queueEntryId, false)
        await updateWebhooksQueueEntryErrorValue(queueEntryId, error as Error)

        return new Promise((resolve) => resolve(true))
    }
}

export const contactUpdated = async (queueEntry: WebhooksQueueTableRow): Promise<boolean> => {
    const { id: queueEntryId, webhook_data: requestObject } = queueEntry
    const { node: originalClient } = requestObject.data as _CustomData
    const { id } = originalClient

    // if (await hasWebhookLock(service, CreateOrUpdate.Update, id)) {
    //     console.log("HAS WEBHOOK LOCK")

    //     await reduceServiceLockValueByOne(service, CreateOrUpdate.Update, id)

    //     return new Promise(resolve => resolve(true))
    // }

    try {
        // Do the same as contactCreated, but first take the contact's ID, pull the original from the server,
        //      then apply the update to the original object, and store the results in the database 

        // const oldContact = await getClientInfoUsingId(id)

        // const shouldCreateInstead = typeof(primaryKey) === 'undefined' || typeof(oldContact) === 'undefined'

        // const newContact = {
        //     ...oldContact,
        //     ...intermediaryClient(originalContact)
        // }

        // const finalContact =  await convertContactToGeneralContact(service, newContact, generateSyncedWithServiceObject([service]))

        // if (shouldCreateInstead) {
        //     storeGeneralContactInDatabase(service, finalContact)
        // } else {
        //     updateGeneralContactInDatabase(primaryKey!, finalContact)
        // }



        let result 
        try {
            result = await createOrUpdateContact(queueEntry)

            await incrementServiceIdLock(service, CreateOrUpdate.Update, id)

        } catch (error) {
            console.error(`Unable to update Boulevard contact`)
            console.error(error)
        }
        
        await reduceServiceLockValueByOne(service, CreateOrUpdate.Update, id)

        await updateWebhooksQueueEntrySuccessValue(queueEntryId, result)

        return new Promise((resolve) => resolve(result))

    } catch (error) {
        console.error(`Could not update ${service} contact ${id}}`)
        console.error(error)


        await updateWebhooksQueueEntrySuccessValue(queueEntryId, false)
        await updateWebhooksQueueEntryErrorValue(queueEntryId, error as Error)

        return new Promise((resolve) => resolve(true))
    }


}
