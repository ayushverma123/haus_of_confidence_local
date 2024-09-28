import { convertThirdPartyContactToGeneralContact, generateSyncedWithServiceObject, getGeneralContactPrimaryKeyWithServiceContactId, storeGeneralContactInDatabase, updateGeneralContactDeletedValue } from "../../../../controllers/GeneralContactsController";
import { WebhookType } from "../../../../controllers/WebhooksController/model/WebhookType";
import { WebhooksQueueTableRow } from "../../../../controllers/WebhooksQueue/model/WebhooksQueueTableRow";
import { updateWebhooksQueueEntryErrorValue } from "../../../../controllers/WebhooksQueue/tableController/updateWebhooksQueueEntryErrorValue";
import { updateWebhooksQueueEntrySuccessValue } from "../../../../controllers/WebhooksQueue/tableController/updateWebhooksQueueEntrySuccessValue";
import { GeneralContact } from "../../../../model/GeneralContact";
import { ThirdPartyService } from "../../../../model/ThirdPartyService";
import { verifyWebhookSignature } from "../../../../routes/services/podium/webhooks/helpers/verifyWebhookSignature";
import { getContactIdentifier } from "../../controllers/ContactController/helpers/getContactIdentifier";
import { Contact } from "../../model/Contact";
import { WebhookMessage } from "../../model/WebhookMessage";

const contactDeleted = async (queueEntry: WebhooksQueueTableRow): Promise<boolean> => {
    const { id: queueEntryId, webhook_data: req } = queueEntry

    const [ remoteTimestamp, remoteSignature  ] = [req.header('podium-timestamp'), req.header('podium-signature')]

    const { data, metadata }: WebhookMessage<Contact> = req.body
    
    if (!await verifyWebhookSignature(WebhookType.ContactDeleted, remoteTimestamp, remoteSignature, req.body)) {

        await updateWebhooksQueueEntrySuccessValue(queueEntryId, false)
        await updateWebhooksQueueEntryErrorValue(queueEntryId, new Error("Could not verify webhook signature"))

        return new Promise((resolve) => resolve(true))

        // return respondWithStatusCode(res, 400)
    }

    // console.group("REQUEST BODY:")
    // console.log(req.body)
    // console.groupEnd()
    
    const [ oldContact, newContact ] = [data.before as Contact, data.after as Contact]
    const oldContactId = oldContact.uid

    // Get the primary key for the contact with the oldContactId
    // Change that contact's deleted value to true
    try {
        // const primaryKey = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Podium, oldContactId)
        // const primaryKey = await getGeneralContactPrimaryKeyFromOriginalContactObjectID(ThirdPartyService.Podium, oldContactId)

        const primaryKey = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Podium, getContactIdentifier(oldContact))

        const primaryKeyEmpty = typeof(primaryKey) === 'undefined'

        let newContactPrimaryKey
        if (primaryKeyEmpty) {
            const newGeneralContact: GeneralContact = await convertThirdPartyContactToGeneralContact(
                ThirdPartyService.Podium,
                oldContact, 
                generateSyncedWithServiceObject([ThirdPartyService.Podium])
            )

            const newDatabaseObject = await storeGeneralContactInDatabase(ThirdPartyService.Podium, newGeneralContact)

            newContactPrimaryKey = newDatabaseObject.id
        }

        await updateGeneralContactDeletedValue(primaryKeyEmpty ? newContactPrimaryKey : primaryKey!, true)

        // return respondWithStatusCode(res, 200)

    } catch (error) {
        console.error(`Error setting ${ThirdPartyService.Podium} contact with old contact id ${oldContactId} as deleted`)
        console.error(error)

        // return respondWithStatusCode(res, 500)
        // return respondWithStatusCode(res, 200)
        await updateWebhooksQueueEntrySuccessValue(queueEntryId, false)
        await updateWebhooksQueueEntryErrorValue(queueEntryId, error as Error)

        return new Promise((resolve) => resolve(true))
    }

    await updateWebhooksQueueEntrySuccessValue(queueEntryId, true)

    return new Promise((resolve) => resolve(true))
}

export default contactDeleted