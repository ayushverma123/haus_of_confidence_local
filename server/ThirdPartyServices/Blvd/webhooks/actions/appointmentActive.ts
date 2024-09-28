import { AutomatedMessageTrigger } from "../../../../controllers/AutomatedMessagesController/model/AutomatedMessageTrigger"
import { updateAppointmentActiveValue } from "../../../../controllers/BoulevardAppointmentsTableController/updateAppointmentActiveValue"
import { WebhooksQueueTableRow } from "../../../../controllers/WebhooksQueue/model/WebhooksQueueTableRow"
import { updateWebhooksQueueEntryErrorValue } from "../../../../controllers/WebhooksQueue/tableController/updateWebhooksQueueEntryErrorValue"
import { updateWebhooksQueueEntrySuccessValue } from "../../../../controllers/WebhooksQueue/tableController/updateWebhooksQueueEntrySuccessValue"
import { HandleBoulevardAppointmentWebhookReturn, handleBoulevardAppointmentWebhook } from "../../../../routes/services/boulevard/webhooks/appointments/helpers/handleBoulevardAppointmentWebhook"

const appointmentActive = async (queueEntry: WebhooksQueueTableRow<any>): Promise<boolean> => {
    const { id: queueEntryId, webhook_data: requestBody } = queueEntry
    try {
        const { appointmentRowId } : HandleBoulevardAppointmentWebhookReturn = await handleBoulevardAppointmentWebhook(requestBody, AutomatedMessageTrigger.BoulevardAppointmentActive)

        await updateAppointmentActiveValue(appointmentRowId, true)

    } catch (error) {
        console.error(`Failed to process appointmentActive webhook for Boulevard`)
        console.error(error)

        await updateWebhooksQueueEntrySuccessValue(queueEntryId, false)
        await updateWebhooksQueueEntryErrorValue(queueEntryId, error as Error)

        return new Promise((resolve) => resolve(true))
    }

    await updateWebhooksQueueEntrySuccessValue(queueEntryId, true)

    return new Promise((resolve) => resolve(true))
}

export default appointmentActive

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