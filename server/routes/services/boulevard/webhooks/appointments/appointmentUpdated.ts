import { AppointmentWebhookData, AppointmentWebhookEvent } from "../../../../../ThirdPartyServices/Blvd/model/Webhooks/Appointment/AppointmentWebhookData"
import { AutomatedMessageTrigger } from "../../../../../controllers/AutomatedMessagesController/model/AutomatedMessageTrigger"
import { updateAppointmentObject } from "../../../../../controllers/BoulevardAppointmentsTableController/updateAppointmentObject"
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
    app.post(url('/appointmentUpdated'), asyncRoute(async (req, res) => {
        console.log(`Received appointment updated webhook for Boulevard`)

        // console.log(req.body)

        await addWebhookEntryToQueueAndAwaitProcessing(res, req, ThirdPartyService.Boulevard, WebhookType.AppointmentUpdated)

        // try {
        //     const { appointmentRowId, appointment } : HandleBoulevardAppointmentWebhookReturn = await handleBoulevardAppointmentWebhook(req.body, AutomatedMessageTrigger.BoulevardAppointmentUpdated)

        //     // Update appointment in database
        //     await updateAppointmentObject(appointmentRowId, appointment)

        //     console.log("APPOINTMENT UPDATED")

        //     return respondWithStatusCode(res, 200)
        // } catch (error) {
        //     console.error(`Failed to process appointmentUpdated webhook for Boulevard`)
        //     console.error(error)

        //     return respondWithStatusCode(res, 500)
        // }
    }))
}