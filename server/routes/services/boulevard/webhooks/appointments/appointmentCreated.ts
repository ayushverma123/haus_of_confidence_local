import { AppointmentWebhookData, AppointmentWebhookEvent } from "../../../../../ThirdPartyServices/Blvd/model/Webhooks/Appointment/AppointmentWebhookData"
import { asyncRoute } from "../../../../../helpers/AsyncRouteHelper"
import { url } from "../webpath"
import { getStandardWebhookData } from "../common"
import { respondWithStatusCode } from "../../../../../helpers/HTTPResponseHelper"
import { ThirdPartyService } from "../../../../../model/ThirdPartyService"
import { getGeneralContactPrimaryKeyWithServiceContactId } from "../../../../../controllers/GeneralContactsController"
import { createNewAppointmentRow } from "../../../../../controllers/BoulevardAppointmentsTableController/createNewAppointmentRow"
import { getAppointment } from "../../../../../ThirdPartyServices/Blvd/controllers/AppointmentsController/getAppointment"
import { Wait } from "../../../../../helpers/Wait"
import { secondsToMilliseconds } from "../../../../../helpers/UnitConversions"
import { Maybe } from "../../../../../model/Maybe"
import { checkForClientInGeneralContactsAndCreateIfNonExistant } from "./helpers/checkForClientInGeneralContactsAndCreateIfNonExistant"
import { AutomatedMessageConfigurationEntry } from "../../../../../controllers/AutomatedMessagesController/model/AutomatedMessageConfigurationEntry"
import { getAllAutomatedMessageConfigurationsForTriggerType } from "../../../../../controllers/AutomatedMessagesController/tableController/getAllAutomatedMessageConfigurationsForTriggerType"
import { AutomatedMessageTrigger } from "../../../../../controllers/AutomatedMessagesController/model/AutomatedMessageTrigger"
import { verifyAndRetrieveAppointmentFromBoulevardServer } from "./helpers/verifyAndRetrieveAppointmentFromBoulevardServer"
import { checkForAutomatedMessageConfigurationsForTrigger } from "./helpers/checkForAutomatedMessageConfigurationsForTrigger"
import { processAutomatedMessageConfigurationEntry } from "../../../../../controllers/AutomatedMessagesController/configurationProcessor"
import { generateDataObject } from "../../../../../controllers/AutomatedMessagesController/configurationProcessor/dataObjectGenerator"
import { HandleBoulevardAppointmentWebhookReturn, handleBoulevardAppointmentWebhook } from "./helpers/handleBoulevardAppointmentWebhook"
import { addWebhookEntryToQueueAndAwaitProcessing } from "../../../../helpers/webhooksQueueEntryHelper"
import { WebhookType } from "../../../../../controllers/WebhooksController/model/WebhookType"

//? This needs to associate a GeneralContact with an Appointment in the boulevard_appointments table

export const routes = (app) => {
    app.post(url('/appointmentCreated'), asyncRoute(async (req, res) => {
        console.log(`Received appointment created webhook for Boulevard`)

        await addWebhookEntryToQueueAndAwaitProcessing(res, req, ThirdPartyService.Boulevard, WebhookType.AppointmentCreated)

        // try {
        //     const result: HandleBoulevardAppointmentWebhookReturn = await handleBoulevardAppointmentWebhook(req.body, AutomatedMessageTrigger.BoulevardAppointmentCreated)

        //     return respondWithStatusCode(res, 200)
        // } catch (error) {
        //     console.error(`Failed to process appointment created webhook for Boulevard`)
        //     console.error(error)

        //     return respondWithStatusCode(res, 500)
        // }
    }))
}