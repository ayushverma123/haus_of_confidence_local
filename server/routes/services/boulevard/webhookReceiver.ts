import { Base64 } from "js-base64"
import { asyncRoute } from "../../../helpers/AsyncRouteHelper"
import { WebPathHelper } from "../../../helpers/WebPathHelper"
import { respondWithStatusCode } from "../../../helpers/HTTPResponseHelper";
import { ClientModificationEvent } from "../../../ThirdPartyServices/Blvd/model/Webhooks/ClientModificationEvent";
import { 
    convertThirdPartyContactToGeneralContact, 
    generateSyncedWithServiceObject, 
    getGeneralContactPrimaryKeyWithServiceContactId, 
    getGeneralContactWithPrimaryKey, 
    storeGeneralContactInDatabase, 
    updateGeneralContactInDatabase, 
    updateGeneralContactServiceIdsValue, 
    updateGeneralContactSyncedWithServicesValue 
} from "../../../controllers/GeneralContactsController";
import { ThirdPartyService } from "../../../model/ThirdPartyService";
import { ClientWebhookData } from "../../../ThirdPartyServices/Blvd/model/Webhooks/ClientWebhookData";
import { GeneralContact } from "../../../model/GeneralContact";
import { Client } from "../../../ThirdPartyServices/Blvd/model/Client";
import { getClientInfoUsingId } from "../../../ThirdPartyServices/Blvd/controllers/ClientController";
import { Maybe } from "../../../model/Maybe";
import { incrementServiceIdLock, reduceServiceLockValueByOne } from "../../../controllers/WebhookLocksController";
import { refreshTagTracker } from "../../../ThirdPartyServices/Blvd/StateManager/TagTracker";
import { hasWebhookLock } from "../../../helpers/hasWebhookLock";
import { _newContactData } from "../../../ThirdPartyServices/Podium/controllers/ContactController";
import { syncContactToService } from "../../../controllers/GeneralContactsController/syncContactToService";
import { Contact } from "../../../ThirdPartyServices/Podium/model/Contact";
import { convertSyncedToServicesToThirdPartyServiceArray } from "../../../controllers/GeneralContactsController/convertSyncedToServicesToThirdPartyServiceArray";
import { url } from "./webhooks/webpath";
import { getStandardWebhookData } from "./webhooks/common";
import { getContactIdentifier } from "../../../ThirdPartyServices/Podium/controllers/ContactController/helpers/getContactIdentifier";
import { CreateOrUpdate } from "../../../model/CreateOrUpdate";
import { addWebhookEntryToQueueAndAwaitProcessing } from "../../helpers/webhooksQueueEntryHelper";
import { WebhookType } from "../../../controllers/WebhooksController/model/WebhookType";

const crypto = require("crypto");

const service: ThirdPartyService = ThirdPartyService.Boulevard


// const syncToPodium = async (clientObject: Client): Promise<boolean>  => {
//     const endpoint = `${serviceEndpoint[ThirdPartyService.Podium][EndpointType.AdminAPI]}/contacts`

//     const { id } = clientObject


//     try {
//         // Convert Client to GeneralContact
//         const generalContact = await convertContactToGeneralContact(ThirdPartyService.Boulevard, clientObject, generateSyncedWithServiceObject([ThirdPartyService.Boulevard]))

//         // Convert general contact to Contact
//         const convertedContact = convertGeneralContactToThirdPartyContact(ThirdPartyService.Podium, generalContact)

//         // Check for the existing Boulevard object in the database
//         const primaryKey: Maybe<string> = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Boulevard, `${id}`)

//         if (typeof(primaryKey) !== 'string') {
//             throw new Error(`primaryKey is not a string -- type is ${typeof(primaryKey)} -- meaning the GeneralContact that was created or updated via Boulevard webhooks cannot be found for some reason.`)
//         }

//         const existingGeneralContact: Maybe<GeneralContact> = await getGeneralContactWithPrimaryKey(primaryKey)

//         if (typeof(existingGeneralContact) === 'undefined') {
//             throw new Error(`For some reason, the primary key ${primaryKey} has produced an empty object despite the primary key being retrieved from the same object that is now empty supposedly. Weird stuff.`)
//         }

//         const { service_ids } = existingGeneralContact
//         const podiumId: Maybe<string> = service_ids[ThirdPartyService.Podium]

//         const shouldUpdate: boolean = typeof(podiumId) !== 'undefined'



//     } catch (error) {
//         console.error(`Could not get GeneralContact primary key from client id ${id}`)

//         return new Promise((_, reject) => reject(error))
//     }

// }

// TODO -- Doesn't work properly at the moment
const verifySignature = async (req): Promise<boolean> => {
    const [hmacSalt, hmacSha256] = [req.get('x-blvd-hmac-salt'), req.get('x-blvd-hmac-sha256')]

    console.log("HMAC SALT:", hmacSalt)

    //@ts-ignore
    const rawBody = Object.keys(req.body).reduce((acc, key) => ({
        ...acc,
        [key]: req.body[key]
    }), {})

    const payload = `${hmacSalt}:${JSON.stringify(req.body)}`

    console.log("PAYLOAD:")
    console.log(payload)

    const rawAppSecret = Base64.decode(process.env.BLVD_SECRET_KEY!)

    const signature = crypto
        .createHmac('sha256', rawAppSecret)
        .update(payload)
        .digest('base64')

    console.log("LOCAL:", signature)
    console.log("REMOTE:", hmacSha256)
    
    const isValid = hmacSha256 === signature

    return new Promise((resolve) => resolve(isValid))
}

const intermediaryClient = (originalContact): Client => 
    Object.keys(originalContact).reduce((resultingContact, key: string) => ({
        ...resultingContact,
        [key]: Object.is(originalContact[key], null) ? undefined : originalContact[key]
    }), {}) as Client

const clientHasPhoneOrEmail = (originalClient: ClientWebhookData): boolean => {
    const { email, mobilePhone } = originalClient

    return !((typeof(email) === 'undefined' || (email || '').length === 0) &&
        (typeof(mobilePhone) === 'undefined' || (mobilePhone || '').length === 0))
     
} 

const createOrUpdate = async (eventData: ClientModificationEvent): Promise<boolean> => {
    const originalClient: ClientWebhookData = eventData.data.node

    // console.log("CLIENT WEBHOOK DATA")
    // console.log(eventData)

    const { id } = originalClient

    /* //TODO -- TO SYNC TO PODIUM
        • Get the primary key of the GeneralContact using the ID of the incoming client
        • Get the Podium ID from the service_ids column of the GeneralContact object at the primary key
        • Call up createOrUpdateContact from Podium's ContactController
            • Include the service_ids key for Podium if it is not undefined: createOrUpdateContact(contact, podiumId) 
            • If the above value is undefined, simply createOrUpdateContact(contact) 
        • Once the Contact is created, store the returned ID if the service_id was undefined
        • Set the "synced_to_service" value for Podium to true
    */
    
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

        return new Promise(resolve => resolve(true))

    } catch (error) {
        return new Promise((_, reject) => reject(error))
        // return new Promise((_, reject) => reject(false))
    }
}

export const routes = (app) => {

    app.post(url('/contactCreated'), asyncRoute(async (req, res) => {
        console.log("Received contact created webhook for Boulevard")
        // console.log(req.body)

        const { event, data: originalClient } = getStandardWebhookData<ClientModificationEvent, ClientWebhookData>(req.body)
        const { id } = originalClient

        //! Skip contacts with no phone or email
        if (!clientHasPhoneOrEmail(originalClient)) {
            return respondWithStatusCode(res, 200)
        }

        // const pk = await getGeneralContactPrimaryKeyWithServiceContactId(service, id)

        // if (typeof(pk) !== 'undefined') {
        //     //! Already Exists for some reason
        //     // Probably don't need this
        // }

        //! FIGURE THIS OUT AND RE-ENABLE IT
        // if (!await verifySignature(req)) {
        //     console.error(`Invalid signature for webhook request Boulevard.CONTACT_CREATED`)
        //     return respondWithStatusCode(res, 200)
        // }

        if (await hasWebhookLock(service, CreateOrUpdate.Create, id)) {
            console.log("HAS WEBHOOK LOCK")

            try {
                await reduceServiceLockValueByOne(service, CreateOrUpdate.Create, id)
            } catch (error) {
                console.error(`Unable to reduce service lock value for ${service}`)
            }

            return respondWithStatusCode(res, 200)
        }

        await addWebhookEntryToQueueAndAwaitProcessing(res, req, ThirdPartyService.Boulevard, WebhookType.ContactCreated, false, {
            contactData: originalClient
        })

    }))

    app.post(url('/contactUpdated'), asyncRoute(async (req, res) => {
        console.log("Received contact updated webhook for Boulevard")
        // console.log(req.body)

        const { event, data: originalClient } = getStandardWebhookData<ClientModificationEvent, ClientWebhookData>(req.body)
        const { id } = originalClient

        //! Skip contacts with no phone or email
        if (!clientHasPhoneOrEmail(originalClient)) {
            return respondWithStatusCode(res, 200)
        }

        // const primaryKey = await getGeneralContactPrimaryKeyWithServiceContactId(service, id)

        // TODO !!
        // if (!await verifySignature(req)) {
        //     console.error(`Invalid signature for webhook request Boulevard.CONTACT_UPDATED`)
        //     return respondWithStatusCode(res, 200)
        // }

        if (await hasWebhookLock(service, CreateOrUpdate.Update, id)) {
            console.log("HAS WEBHOOK LOCK")

            await reduceServiceLockValueByOne(service, CreateOrUpdate.Update, id)

            return respondWithStatusCode(res, 200)
        }

        await addWebhookEntryToQueueAndAwaitProcessing(res, req, ThirdPartyService.Boulevard, WebhookType.ContactCreated, false, {
            contactData: originalClient
        })
        

    }))

    // TODO
    app.post(url('/contactMerged'), asyncRoute(async (req, res) => {
        console.log("Received contact merged webhook for Boulevard")
        console.log(req.body)

        return respondWithStatusCode(res, 200)

        const event: ClientModificationEvent = req.body
        

        // console.log(req.body)

        // Create the new contact
        // mark the two that were merged into the new one as 'deleted' 

        if (!await verifySignature(req)) {
            console.error(`Invalid signature for webhook request Boulevard.CONTACT_MERGED`)
            return respondWithStatusCode(res, 400)
        }     

        return respondWithStatusCode(res, 200)

    }))

    // TODO - lol this doesn't have one
    app.post(url('/contactDeleted'), asyncRoute(async (req, res) => {
        console.log("Received contact created deleted for Boulevard")
        console.log(req.body)

        const event: ClientModificationEvent = req.body

        if (!await verifySignature(req)) {
            console.error(`Invalid signature for webhook request Boulevard.CONTACT_DELETED`)
            return respondWithStatusCode(res, 400)
        }   

        return respondWithStatusCode(res, 200)

    }))
}