import { PodiumMessage } from "../../../../../ThirdPartyServices/Podium/controllers/MessagesController/model/PodiumMessage"
import { getGeneralContactPrimaryKeyWithServiceContactId } from "../../../../../controllers/GeneralContactsController"
import { MessageQueueTableRow } from "../../../../../controllers/MessageQueueController/model/MessageQueueTableRow"
import { MessageStatus } from "../../../../../controllers/MessageQueueController/model/MessageStatus"
import { editMessageQueueEntryStatus } from "../../../../../controllers/MessageQueueController/tableController/editMessageQueueEntryStatus"
import { WebhookType } from "../../../../../controllers/WebhooksController/model/WebhookType"
import { asyncRoute } from "../../../../../helpers/AsyncRouteHelper"
import { respondWithStatusCode } from "../../../../../helpers/HTTPResponseHelper"
import { WebPathHelper } from "../../../../../helpers/WebPathHelper"
import { ThirdPartyService } from "../../../../../model/ThirdPartyService"
import { addWebhookEntryToQueueAndAwaitProcessing } from "../../../../helpers/webhooksQueueEntryHelper"
import { messageWebhookHandler } from "./helpers/messageWebhookHandler"

const url: WebPathHelper = WebPathHelper('/services/podium/webhookReceiver')

export const routes = (app: any) => {
    app.post(url('/messageFailed'), asyncRoute( async (req, res) => {
        console.log('Received message failed webhook for Podium')

        await addWebhookEntryToQueueAndAwaitProcessing(res, req, ThirdPartyService.Podium, WebhookType.MessageFailed, true)

        // try {
        //     await messageWebhookHandler(req, res, (id: number): Promise<boolean> => editMessageQueueEntryStatus(id, MessageStatus.Failed))

        //     return respondWithStatusCode(res, 200)
        // } catch (error) {
        //     console.error(`Could not process message sent webhook for Podium`)
        //     console.error(error)

        //     return respondWithStatusCode(res, 500)
        // }
    }))
}