import { AppointmentWebhookData, AppointmentWebhookEvent } from "../../../../../ThirdPartyServices/Blvd/model/Webhooks/Appointment/AppointmentWebhookData"
import { AutomatedMessageTrigger } from "../../../../../controllers/AutomatedMessagesController/model/AutomatedMessageTrigger"
import { updateAppointmentConfirmedValue } from "../../../../../controllers/BoulevardAppointmentsTableController/updateAppointmentConfirmedValue"
import { WebhookType } from "../../../../../controllers/WebhooksController/model/WebhookType"
import { asyncRoute } from "../../../../../helpers/AsyncRouteHelper"
import { respondWithStatusCode } from "../../../../../helpers/HTTPResponseHelper"
import { ThirdPartyService } from "../../../../../model/ThirdPartyService"
import { addWebhookEntryToQueueAndAwaitProcessing } from "../../../../helpers/webhooksQueueEntryHelper"
import { getStandardWebhookData } from "../common"
import { url } from "../webpath"
import { checkForAutomatedMessageConfigurationsForTrigger } from "./helpers/checkForAutomatedMessageConfigurationsForTrigger"
import { checkForClientInGeneralContactsAndCreateIfNonExistant } from "./helpers/checkForClientInGeneralContactsAndCreateIfNonExistant"
import { HandleBoulevardAppointmentWebhookReturn, handleBoulevardAppointmentWebhook } from "./helpers/handleBoulevardAppointmentWebhook"
import { verifyAndRetrieveAppointmentFromBoulevardServer } from "./helpers/verifyAndRetrieveAppointmentFromBoulevardServer"

// TODO
export const routes = (app) => {
    app.post(url('/appointmentConfirmed'), asyncRoute(async (req, res) => {
        console.log(`Received appointment confirmed webhook for Boulevard`)

        await addWebhookEntryToQueueAndAwaitProcessing(res, req, ThirdPartyService.Boulevard, WebhookType.AppointmentConfirmed)

        // try {

        //     const { appointment, appointmentRowId }: HandleBoulevardAppointmentWebhookReturn = await handleBoulevardAppointmentWebhook(req.body, AutomatedMessageTrigger.BoulevardAppointmentConfirmed)
            
        //     await updateAppointmentConfirmedValue(appointmentRowId, true)

        //     return respondWithStatusCode(res, 200)
        // } catch (error) {
        //     console.error(`Failed to process appointment confirmed webhook for Boulevard`)
        //     console.error(error)

        //     return respondWithStatusCode(res, 500)
        // }
    }))
}