import { MessageStatus } from "../../../../controllers/MessageQueueController/model/MessageStatus";
import { editMessageQueueEntryStatus } from "../../../../controllers/MessageQueueController/tableController/editMessageQueueEntryStatus";
import { WebhooksQueueTableRow } from "../../../../controllers/WebhooksQueue/model/WebhooksQueueTableRow";
import { updateWebhooksQueueEntryErrorValue } from "../../../../controllers/WebhooksQueue/tableController/updateWebhooksQueueEntryErrorValue";
import { updateWebhooksQueueEntrySuccessValue } from "../../../../controllers/WebhooksQueue/tableController/updateWebhooksQueueEntrySuccessValue";
import { messageWebhookHandler } from "../../../../routes/services/podium/webhooks/messages/helpers/messageWebhookHandler";

const messageFailed = async (queueEntry: WebhooksQueueTableRow): Promise<boolean> => {
    const { id: queueEntryId, webhook_data: requestObject } = queueEntry

    try {
        await messageWebhookHandler(requestObject, undefined, 
            (id: number): Promise<boolean> => editMessageQueueEntryStatus(id, MessageStatus.Failed)
        )

        // return respondWithStatusCode(res, 200)
    } catch (error) {
        console.error(`Could not process message sent webhook for Podium`)
        console.error(error)

        await updateWebhooksQueueEntrySuccessValue(queueEntryId, false)
        await updateWebhooksQueueEntryErrorValue(queueEntryId, error as Error)

        return new Promise((resolve) => resolve(true))
    }

    await updateWebhooksQueueEntrySuccessValue(queueEntryId, true)

    return new Promise((resolve) => resolve(true))
}

export default messageFailed