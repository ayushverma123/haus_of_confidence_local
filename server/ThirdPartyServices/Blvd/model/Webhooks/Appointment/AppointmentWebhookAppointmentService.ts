import { AppointmentWebhookAppointmentServiceServiceEntry } from "./AppointmentWebhookAppointmentServiceServiceEntry"
import { AppointmentWebhookAppointmentServiceStaff } from "./AppointmentWebhookAppointmentServiceStaff"

export type AppointmentWebhookAppointmentService = {
    baseAppointmentServiceId?: string,
    id: string,
    service: AppointmentWebhookAppointmentServiceServiceEntry,
    serviceId: string,
    staff: Array<AppointmentWebhookAppointmentServiceStaff>,
    staffId: string,
    staffRequested: boolean,
    startAt: string,
    startTimeOffset: number
}
