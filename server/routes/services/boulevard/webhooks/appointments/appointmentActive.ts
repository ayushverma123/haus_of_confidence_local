import { AppointmentWebhookData, AppointmentWebhookEvent } from "../../../../../ThirdPartyServices/Blvd/model/Webhooks/Appointment/AppointmentWebhookData"
import { asyncRoute } from "../../../../../helpers/AsyncRouteHelper"
import { url } from "../webpath"
import { getStandardWebhookData } from "../common"
import { StatusCodes, respondWithStatusCode } from "../../../../../helpers/HTTPResponseHelper"
import { verifyAndRetrieveAppointmentFromBoulevardServer } from "./helpers/verifyAndRetrieveAppointmentFromBoulevardServer"
import { checkForClientInGeneralContactsAndCreateIfNonExistant } from "./helpers/checkForClientInGeneralContactsAndCreateIfNonExistant"
import { checkForAutomatedMessageConfigurationsForTrigger } from "./helpers/checkForAutomatedMessageConfigurationsForTrigger"
import { AutomatedMessageTrigger } from "../../../../../controllers/AutomatedMessagesController/model/AutomatedMessageTrigger"
import { HandleBoulevardAppointmentWebhookReturn, handleBoulevardAppointmentWebhook } from "./helpers/handleBoulevardAppointmentWebhook"
import { updateAppointmentActiveValue } from "../../../../../controllers/BoulevardAppointmentsTableController/updateAppointmentActiveValue"
import { createNewWebhooksQueueEntry } from "../../../../../controllers/WebhooksQueue/tableController/createNewWebhooksQueueEntry"
import { WebhookType } from "../../../../../controllers/WebhooksController/model/WebhookType"
import { ThirdPartyService } from "../../../../../model/ThirdPartyService"
import { waitForQueueEntryToProcess } from "../../../../../controllers/WebhooksQueue/helpers/waitForQueueEntryToProcess"
import { removeWebhooksQueueEntry } from "../../../../../controllers/WebhooksQueue/tableController/removeWebhooksQueueEntry"
import { addWebhookEntryToQueueAndAwaitProcessing } from "../../../../helpers/webhooksQueueEntryHelper"

// TODO
export const routes = (app) => {
    //? Non-queue version
    // app.post(url('/appointmentActive'), asyncRoute(async (req, res) => {
    //     console.log(`Received appointmentActive webhook for Boulevard`)

    //     try {
    //         const { appointmentRowId } : HandleBoulevardAppointmentWebhookReturn = await handleBoulevardAppointmentWebhook(req, res, AutomatedMessageTrigger.BoulevardAppointmentActive)

    //         await updateAppointmentActiveValue(appointmentRowId, true)

    //         return respondWithStatusCode(res, 200)
    //     } catch (error) {
    //         console.error(`Failed to process appointmentActive webhook for Boulevard`)
    //         console.error(error)

    //         return respondWithStatusCode(res, 500)
    //     }
    // }))

    //? Queue version
    app.post(url('/appointmentActive'), asyncRoute(async (req, res) => {
        console.log(`Received appointmentActive webhook for Boulevard`)

        await addWebhookEntryToQueueAndAwaitProcessing(res, req, ThirdPartyService.Boulevard, WebhookType.AppointmentActive)

        // try {
        //     const { id } = await createNewWebhooksQueueEntry(WebhookType.AppointmentActive, ThirdPartyService.Boulevard, req.body, new Date())

        //     const { success, error } = await waitForQueueEntryToProcess(id)

        //     if (success) await removeWebhooksQueueEntry(id)

        //     respondWithStatusCode(res, success ? StatusCodes.OK : StatusCodes.Internal_Server_Error, !success ? error.message : undefined)
        // } catch (error) {
        //     respondWithStatusCode(res, StatusCodes.Internal_Server_Error, error)
        // }

    }))
}