import { AppointmentWebhookData, AppointmentWebhookEvent } from "../../../../../ThirdPartyServices/Blvd/model/Webhooks/Appointment/AppointmentWebhookData"
import { asyncRoute } from "../../../../../helpers/AsyncRouteHelper"
import { url } from "../webpath"
import { getStandardWebhookData } from "../common"
import { respondWithStatusCode } from "../../../../../helpers/HTTPResponseHelper"
import { updateAppointmentCompletedValue } from "../../../../../controllers/BoulevardAppointmentsTableController/updateAppointmentCompletedValue"
import { checkForClientInGeneralContactsAndCreateIfNonExistant } from "./helpers/checkForClientInGeneralContactsAndCreateIfNonExistant"
import { getAppointment } from "../../../../../ThirdPartyServices/Blvd/controllers/AppointmentsController/getAppointment"
import { Maybe } from "../../../../../model/Maybe"
import { AutomatedMessageConfigurationEntry } from "../../../../../controllers/AutomatedMessagesController/model/AutomatedMessageConfigurationEntry"
import { getAllAutomatedMessageConfigurationsForTriggerType } from "../../../../../controllers/AutomatedMessagesController/tableController/getAllAutomatedMessageConfigurationsForTriggerType"
import { AutomatedMessageTrigger } from "../../../../../controllers/AutomatedMessagesController/model/AutomatedMessageTrigger"
import { verifyAndRetrieveAppointmentFromBoulevardServer } from "./helpers/verifyAndRetrieveAppointmentFromBoulevardServer"
import { checkForAutomatedMessageConfigurationsForTrigger } from "./helpers/checkForAutomatedMessageConfigurationsForTrigger"
import { HandleBoulevardAppointmentWebhookReturn, handleBoulevardAppointmentWebhook } from "./helpers/handleBoulevardAppointmentWebhook"
import { updateAppointmentActiveValue } from "../../../../../controllers/BoulevardAppointmentsTableController/updateAppointmentActiveValue"
import { addWebhookEntryToQueueAndAwaitProcessing } from "../../../../helpers/webhooksQueueEntryHelper"
import { ThirdPartyService } from "../../../../../model/ThirdPartyService"
import { WebhookType } from "../../../../../controllers/WebhooksController/model/WebhookType"

export const routes = (app) => {
    app.post(url('/appointmentCompleted'), asyncRoute(async (req, res) => {
        console.log(`Received appointment completed webhook for Boulevard`)

        await addWebhookEntryToQueueAndAwaitProcessing(res, req, ThirdPartyService.Boulevard, WebhookType.AppointmentCompleted)

        // try {
        //     const { appointmentRowId } : HandleBoulevardAppointmentWebhookReturn = await handleBoulevardAppointmentWebhook(req.body, AutomatedMessageTrigger.BoulevardAppointmentCompleted)

        //     await updateAppointmentCompletedValue(appointmentRowId, true)
        //     await updateAppointmentActiveValue(appointmentRowId, false)

        //     return respondWithStatusCode(res, 200)
        // } catch (error) {
        //     console.error(`Failed to process appointment completed webhook for Boulevard`)
        //     console.error(error)

        //     return respondWithStatusCode(res, 500)
        // }
    }))
}