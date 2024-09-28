import { PodiumMessage } from "../../../../../ThirdPartyServices/Podium/controllers/MessagesController/model/PodiumMessage"
import { WebhookMessage } from "../../../../../ThirdPartyServices/Podium/model/WebhookMessage"
import { getGeneralContactPrimaryKeyWithServiceContactId } from "../../../../../controllers/GeneralContactsController"
import { MessageQueueTableRow } from "../../../../../controllers/MessageQueueController/model/MessageQueueTableRow"
import { MessageStatus } from "../../../../../controllers/MessageQueueController/model/MessageStatus"
import { removeMessageQueueEntry } from "../../../../../controllers/MessageQueueController/tableController/removeMessageQueueEntry"
import { WebhookType } from "../../../../../controllers/WebhooksController/model/WebhookType"
import { asyncRoute } from "../../../../../helpers/AsyncRouteHelper"
import { respondWithStatusCode } from "../../../../../helpers/HTTPResponseHelper"
import { WebPathHelper } from "../../../../../helpers/WebPathHelper"
import { ThirdPartyService } from "../../../../../model/ThirdPartyService"
import { addWebhookEntryToQueueAndAwaitProcessing } from "../../../../helpers/webhooksQueueEntryHelper"
import { verifyWebhookSignature } from "../helpers/verifyWebhookSignature"
import { getMessageQueueMatches } from "./helpers/getMessageQueueMatches"
import { messageWebhookHandler } from "./helpers/messageWebhookHandler"

const url: WebPathHelper = WebPathHelper('/services/podium/webhookReceiver')

export const routes = (app) => {
    app.post(url('/messageSent'), asyncRoute( async (req, res) => {
        console.log('Received message sent webhook for Podium')

        await addWebhookEntryToQueueAndAwaitProcessing(res, req, ThirdPartyService.Podium, WebhookType.MessageSent, true)

        // try {
        //     await messageWebhookHandler(req, res, (id: number): Promise<boolean> => removeMessageQueueEntry(id))

        //     return respondWithStatusCode(res, 200)
        // } catch (error) {
        //     console.error(`Could not process message sent webhook for Podium`)
        //     console.error(error)

        //     return respondWithStatusCode(res, 500)
        // }
    }))

}