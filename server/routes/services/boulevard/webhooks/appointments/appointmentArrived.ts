import { AppointmentWebhookData, AppointmentWebhookEvent } from "../../../../../ThirdPartyServices/Blvd/model/Webhooks/Appointment/AppointmentWebhookData"
import { asyncRoute } from "../../../../../helpers/AsyncRouteHelper"
import { url } from "../webpath"
import { getStandardWebhookData } from "../common"
import { verifyAndRetrieveAppointmentFromBoulevardServer } from "./helpers/verifyAndRetrieveAppointmentFromBoulevardServer"
import { checkForClientInGeneralContactsAndCreateIfNonExistant } from "./helpers/checkForClientInGeneralContactsAndCreateIfNonExistant"
import { checkForAutomatedMessageConfigurationsForTrigger } from "./helpers/checkForAutomatedMessageConfigurationsForTrigger"
import { AutomatedMessageTrigger } from "../../../../../controllers/AutomatedMessagesController/model/AutomatedMessageTrigger"
import { respondWithStatusCode } from "../../../../../helpers/HTTPResponseHelper"
import { HandleBoulevardAppointmentWebhookReturn, handleBoulevardAppointmentWebhook } from "./helpers/handleBoulevardAppointmentWebhook"
import { addWebhookEntryToQueueAndAwaitProcessing } from "../../../../helpers/webhooksQueueEntryHelper"
import { ThirdPartyService } from "../../../../../model/ThirdPartyService"
import { WebhookType } from "../../../../../controllers/WebhooksController/model/WebhookType"

// TODO
export const routes = (app) => {
    app.post(url('/appointmentArrived'), asyncRoute(async (req, res) => {
        console.log(`Received appointment arrived webhook for Boulevard`)


        await addWebhookEntryToQueueAndAwaitProcessing(res, req, ThirdPartyService.Boulevard, WebhookType.AppointmentArrived)
        
        // try {
        //     const { appointment, appointmentRowId }: HandleBoulevardAppointmentWebhookReturn = await handleBoulevardAppointmentWebhook(req.body, AutomatedMessageTrigger.BoulevardAppointmentArrived)

        //     return respondWithStatusCode(res, 200)
        // } catch (error) {
        //     console.error(`Failed to process appointment arrived webhook for Boulevard`)
        //     console.error(error)

        //     return respondWithStatusCode(res, 500)
        // }


    }))
}