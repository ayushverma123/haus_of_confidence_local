import { WebhookType } from "../../controllers/WebhooksController/model/WebhookType"
import { waitForQueueEntryToProcess } from "../../controllers/WebhooksQueue/helpers/waitForQueueEntryToProcess"
import { createNewWebhooksQueueEntry } from "../../controllers/WebhooksQueue/tableController/createNewWebhooksQueueEntry"
import { removeWebhooksQueueEntry } from "../../controllers/WebhooksQueue/tableController/removeWebhooksQueueEntry"
import { StatusCodes, respondWithStatusCode } from "../../helpers/HTTPResponseHelper"
import { ThirdPartyService } from "../../model/ThirdPartyService"

export const addWebhookEntryToQueueAndAwaitProcessing = async (res, req, service: ThirdPartyService, webhookType: WebhookType, storeBodyAndHeader: boolean = false, customData?: {[key: string]: any}) => {
    // const hasCustomData = typeof(customData) !== 'undefined'

    try {
        const { id } = await createNewWebhooksQueueEntry(webhookType, service, 
            {
                // customData: hasCustomData ? customData : undefined,
                customData,
                ...(storeBodyAndHeader ? 
                    { 
                        body: req.body, 
                        header: req.header 
                    } 
                    : req.body
                )
            }
        , new Date())

        const { success, error } = await waitForQueueEntryToProcess(id)

        if (success) await removeWebhooksQueueEntry(id)

        respondWithStatusCode(res, success ? StatusCodes.OK : StatusCodes.Internal_Server_Error, !success ? error.message : undefined)
    } catch (error) {
        respondWithStatusCode(res, StatusCodes.Internal_Server_Error, error)
    }
}