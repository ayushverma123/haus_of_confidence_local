import { PodiumMessage } from "../../../../../../ThirdPartyServices/Podium/controllers/MessagesController/model/PodiumMessage"
import { getGeneralContactPrimaryKeyWithServiceContactId } from "../../../../../../controllers/GeneralContactsController"
import { MessageQueueTableRow } from "../../../../../../controllers/MessageQueueController/model/MessageQueueTableRow"
import { removeMessageQueueEntry } from "../../../../../../controllers/MessageQueueController/tableController/removeMessageQueueEntry"
import { WebhookType } from "../../../../../../controllers/WebhooksController/model/WebhookType"
import { respondWithStatusCode } from "../../../../../../helpers/HTTPResponseHelper"
import { GeneralContact } from "../../../../../../model/GeneralContact"
import { ThirdPartyService } from "../../../../../../model/ThirdPartyService"
import { verifyWebhookSignature } from "../../helpers/verifyWebhookSignature"
import { getMessageQueueMatches } from "./getMessageQueueMatches"

// export type MessageWebhookHandlerFunctionResultsEntry = {
//     recipient: GeneralContact,
//     text: string,
//     success: boolean,
// } 

export const messageWebhookHandler = async (req: any, res: any = undefined, messageFunction: (id: number) => Promise<boolean>) => {
    const [ remoteTimestamp, remoteSignature  ] = [req.header('podium-timestamp'), req.header('podium-signature')]
    const { body: messageText, contact }: PodiumMessage = req.body

    console.log('-=-=-=-=-===-=- messageWebhookHandler body -=-=-=-=-=-=-=-=')
    console.log(req.body)

    const contactId = await getGeneralContactPrimaryKeyWithServiceContactId(ThirdPartyService.Podium, contact.uid)
    
    if (!await verifyWebhookSignature(WebhookType.MessageSent, remoteTimestamp, remoteSignature, req.body)) {
        if (typeof(res) !== 'undefined') {
            return respondWithStatusCode(res, 400)
        }
        
        return new Promise((_, reject) => reject(new Error('Invalid webhook signature')))
        
    }

    if (typeof(contactId) === 'undefined') {
        throw new Error(`Could not find contact ID in contact data for Podium message`)
    }


    try {
        const matches: MessageQueueTableRow[] = await getMessageQueueMatches(contactId, messageText)

        //@ts-ignore
        const results: Promise<boolean[]> = await matches.reduce(async (acc: Promise<boolean[]>, match: MessageQueueTableRow): Promise<boolean[]> => {
            const { id } = match
            const existing = await acc

            try {

                await messageFunction(id)

                return [
                    ...existing,
                    true
                ]
            } catch (error) {
                console.error(`Could not remove message queue entry with id ${id}`)
                console.error(error)

                return [
                    ...existing,
                    false
                ]
            }
        },[])

        return new Promise((resolve) => resolve(true))

    } catch (error) {

        return new Promise((_, reject) => reject(error))
    }
}