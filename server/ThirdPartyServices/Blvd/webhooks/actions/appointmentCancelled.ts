import { AutomatedMessageTrigger } from "../../../../controllers/AutomatedMessagesController/model/AutomatedMessageTrigger"
import { updateAppointmentActiveValue } from "../../../../controllers/BoulevardAppointmentsTableController/updateAppointmentActiveValue"
import { updateAppointmentCancelledValue } from "../../../../controllers/BoulevardAppointmentsTableController/updateAppointmentCancelledValue"
import { WebhooksQueueTableRow } from "../../../../controllers/WebhooksQueue/model/WebhooksQueueTableRow"
import { updateWebhooksQueueEntryErrorValue } from "../../../../controllers/WebhooksQueue/tableController/updateWebhooksQueueEntryErrorValue"
import { updateWebhooksQueueEntrySuccessValue } from "../../../../controllers/WebhooksQueue/tableController/updateWebhooksQueueEntrySuccessValue"
import { HandleBoulevardAppointmentWebhookReturn, handleBoulevardAppointmentWebhook } from "../../../../routes/services/boulevard/webhooks/appointments/helpers/handleBoulevardAppointmentWebhook"

const appointmentCancelled = async (queueEntry: WebhooksQueueTableRow): Promise<boolean> => {
    const { id: queueEntryId, webhook_data: requestBody } = queueEntry

    try {
        const { appointmentRowId } : HandleBoulevardAppointmentWebhookReturn = await handleBoulevardAppointmentWebhook(requestBody, AutomatedMessageTrigger.BoulevardAppointmentCancelled)

        await updateAppointmentCancelledValue(appointmentRowId, true)
        await updateAppointmentActiveValue(appointmentRowId, false)

    } catch (error) {
        console.error(`Failed to process appointment cancelled webhook for Boulevard`)
        console.error(error)

        await updateWebhooksQueueEntrySuccessValue(queueEntryId, false)
        await updateWebhooksQueueEntryErrorValue(queueEntryId, error as Error)

        return new Promise((resolve) => resolve(true))
    }

    await updateWebhooksQueueEntrySuccessValue(queueEntryId, true)

    return new Promise((resolve) => resolve(true))
}

export default appointmentCancelled