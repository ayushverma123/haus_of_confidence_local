import { AppointmentWebhookData, AppointmentWebhookEvent } from "../../../../../ThirdPartyServices/Blvd/model/Webhooks/Appointment/AppointmentWebhookData"
import { asyncRoute } from "../../../../../helpers/AsyncRouteHelper"
import { url } from "../webpath"
import { getStandardWebhookData } from "../common"
import { updateAppointmentCancelledValue } from "../../../../../controllers/BoulevardAppointmentsTableController/updateAppointmentCancelledValue"
import { respondWithStatusCode } from "../../../../../helpers/HTTPResponseHelper"
import { verifyAndRetrieveAppointmentFromBoulevardServer } from "./helpers/verifyAndRetrieveAppointmentFromBoulevardServer"
import { checkForClientInGeneralContactsAndCreateIfNonExistant } from "./helpers/checkForClientInGeneralContactsAndCreateIfNonExistant"
import { checkForAutomatedMessageConfigurationsForTrigger } from "./helpers/checkForAutomatedMessageConfigurationsForTrigger"
import { AutomatedMessageTrigger } from "../../../../../controllers/AutomatedMessagesController/model/AutomatedMessageTrigger"
import { HandleBoulevardAppointmentWebhookReturn, handleBoulevardAppointmentWebhook } from "./helpers/handleBoulevardAppointmentWebhook"
import { updateAppointmentActiveValue } from "../../../../../controllers/BoulevardAppointmentsTableController/updateAppointmentActiveValue"
import { addWebhookEntryToQueueAndAwaitProcessing } from "../../../../helpers/webhooksQueueEntryHelper"
import { ThirdPartyService } from "../../../../../model/ThirdPartyService"
import { WebhookType } from "../../../../../controllers/WebhooksController/model/WebhookType"

export const routes = (app) => {
    app.post(url('/appointmentCancelled'), asyncRoute(async (req, res) => {
        console.log(`Received appointment cancelled webhook for Boulevard`)

        await addWebhookEntryToQueueAndAwaitProcessing(res, req, ThirdPartyService.Boulevard, WebhookType.AppointmentCancelled)
        
        // try {
        //     const { appointmentRowId } : HandleBoulevardAppointmentWebhookReturn = await handleBoulevardAppointmentWebhook(req.body, AutomatedMessageTrigger.BoulevardAppointmentCancelled)

        //     await updateAppointmentCancelledValue(appointmentRowId, true)
        //     await updateAppointmentActiveValue(appointmentRowId, false)

        //     return respondWithStatusCode(res, 200)
        // } catch (error) {
        //     console.error(`Failed to process appointment cancelled webhook for Boulevard`)
        //     console.error(error)

        //     return respondWithStatusCode(res, 500)
        // }
    }))
}