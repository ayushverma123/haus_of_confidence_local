import { Request, Response } from "express"
import { opportunityCreated } from "../../../ThirdPartyServices/GoHighLevel/webhooks/actions/opportunityCreated"
import { WebhookType } from "../../../controllers/WebhooksController/model/WebhookType"
import { createNewWebhooksQueueEntry } from "../../../controllers/WebhooksQueue/tableController/createNewWebhooksQueueEntry"
import { asyncRoute } from "../../../helpers/AsyncRouteHelper"
import { StatusCodes, respondWithStatusCode } from "../../../helpers/HTTPResponseHelper"
import { WebPathHelper } from "../../../helpers/WebPathHelper"
import { ThirdPartyService } from "../../../model/ThirdPartyService"
import { getWebhookQueueEntryWithId } from "../../../controllers/WebhooksQueue/tableController/getWebhookQueueEntryWithId"
import { Wait } from "../../../helpers/Wait"
import { secondsToMilliseconds } from "date-fns"
import { waitForQueueEntryToProcess } from "../../../controllers/WebhooksQueue/helpers/waitForQueueEntryToProcess"
import { removeWebhooksQueueEntry } from "../../../controllers/WebhooksQueue/tableController/removeWebhooksQueueEntry"


const routeRoot: string = '/services/gohighlevel/webhookReceiver'
const url: WebPathHelper = WebPathHelper(routeRoot)

const service = ThirdPartyService.GoHighLevel // TODO - Replace with ThirdPartyService.GHL when implemented

// TODO
export const routes = (app) => {
    app.post(url('/OpportunityCreated'), asyncRoute(async (req: Request, res: Response) => {
        console.log("Received opportunity created webhook for GoHighLevel")

        // Add to webhooks queue and wait for it to be processed
        try {
            const { id } = await createNewWebhooksQueueEntry(WebhookType.OpportunityCreated, ThirdPartyService.GoHighLevel, req.body, new Date())

            const { success, error } = await waitForQueueEntryToProcess(id)

            if (success) await removeWebhooksQueueEntry(id)

            respondWithStatusCode(res, success ? StatusCodes.OK : StatusCodes.Internal_Server_Error, !success ? error.message : undefined)
            
        } catch (error) {
            respondWithStatusCode(res, StatusCodes.Internal_Server_Error, error)
        }

    }))
}