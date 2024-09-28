import { AutomatedMessageTrigger } from "../../../../controllers/AutomatedMessagesController/model/AutomatedMessageTrigger"
import { WebhooksQueueTableRow } from "../../../../controllers/WebhooksQueue/model/WebhooksQueueTableRow"
import { updateWebhooksQueueEntryErrorValue } from "../../../../controllers/WebhooksQueue/tableController/updateWebhooksQueueEntryErrorValue"
import { updateWebhooksQueueEntrySuccessValue } from "../../../../controllers/WebhooksQueue/tableController/updateWebhooksQueueEntrySuccessValue"
import { HandleBoulevardAppointmentWebhookReturn, handleBoulevardAppointmentWebhook } from "../../../../routes/services/boulevard/webhooks/appointments/helpers/handleBoulevardAppointmentWebhook"

const appointmentArrived = async(queueEntry: WebhooksQueueTableRow<any>): Promise<boolean> => {
    const { id: queueEntryId, webhook_data: requestBody } = queueEntry

    try {
        const { appointment, appointmentRowId }: HandleBoulevardAppointmentWebhookReturn = await handleBoulevardAppointmentWebhook(requestBody, AutomatedMessageTrigger.BoulevardAppointmentArrived)

    } catch (error) {
        console.error(`Failed to process appointment arrived webhook for Boulevard`)
        console.error(error)

        await updateWebhooksQueueEntrySuccessValue(queueEntryId, false)
        await updateWebhooksQueueEntryErrorValue(queueEntryId, error as Error)

        return new Promise((resolve) => resolve(true))
    }


    await updateWebhooksQueueEntrySuccessValue(queueEntryId, true)

    return new Promise((resolve) => resolve(true))
}

export default appointmentArrived