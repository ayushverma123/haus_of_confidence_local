import { AppointmentWebhookData, AppointmentWebhookEvent } from "../../../../../ThirdPartyServices/Blvd/model/Webhooks/Appointment/AppointmentWebhookData"
import { asyncRoute } from "../../../../../helpers/AsyncRouteHelper"
import { url } from "../webpath"
import { getStandardWebhookData } from "../common"
import { respondWithStatusCode } from "../../../../../helpers/HTTPResponseHelper"
import { verifyAndRetrieveAppointmentFromBoulevardServer } from "./helpers/verifyAndRetrieveAppointmentFromBoulevardServer"
import { checkForClientInGeneralContactsAndCreateIfNonExistant } from "./helpers/checkForClientInGeneralContactsAndCreateIfNonExistant"
import { checkForAutomatedMessageConfigurationsForTrigger } from "./helpers/checkForAutomatedMessageConfigurationsForTrigger"
import { AutomatedMessageTrigger } from "../../../../../controllers/AutomatedMessagesController/model/AutomatedMessageTrigger"
import { HandleBoulevardAppointmentWebhookReturn, handleBoulevardAppointmentWebhook } from "./helpers/handleBoulevardAppointmentWebhook"
import { updateAppointmentObject } from "../../../../../controllers/BoulevardAppointmentsTableController/updateAppointmentObject"
import { addWebhookEntryToQueueAndAwaitProcessing } from "../../../../helpers/webhooksQueueEntryHelper"
import { WebhookType } from "../../../../../controllers/WebhooksController/model/WebhookType"
import { ThirdPartyService } from "../../../../../model/ThirdPartyService"

// TODO
export const routes = (app) => {
    app.post(url('/appointmentRescheduled'), asyncRoute(async (req, res) => {
        console.log(`Received appointment rescheduled webhook for Boulevard`)

        // console.log(req.body)

        await addWebhookEntryToQueueAndAwaitProcessing(res, req, ThirdPartyService.Boulevard, WebhookType.AppointmentRescheduled)

        // try {
        //     const { appointmentRowId, appointment } : HandleBoulevardAppointmentWebhookReturn = await handleBoulevardAppointmentWebhook(req.body, AutomatedMessageTrigger.BoulevardAppointmentRescheduled)

        //     // TODO -- Update appointment in database
        //     // Update appointment in database
        //     await updateAppointmentObject(appointmentRowId, appointment)

        //     console.log("APPOINTMENT RESCHEDULED")
            

        //     return respondWithStatusCode(res, 200)
        // } catch (error) {
        //     console.error(`Failed to process appointment rescheduled webhook for Boulevard`)
        //     console.error(error)

        //     return respondWithStatusCode(res, 500)
        // }
    }))
}