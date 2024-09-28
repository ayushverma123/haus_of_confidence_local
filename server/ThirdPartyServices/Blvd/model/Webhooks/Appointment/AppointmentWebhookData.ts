import { Tag } from "../../Tag";
import { DataNodeCommon } from "../DataNodeCommon";
import { WebhookCommon } from "../WebhookCommon";
import { AppointmentWebhookAppointmentService } from "./AppointmentWebhookAppointmentService";
import { AppointmentWebhookClient } from "./AppointmentWebhookClient";
import { AppointmentWebhookLocation } from "./AppointmentWebhookLocation";

export type AppointmentWebhookEvent = WebhookCommon<AppointmentWebhookData>

export type AppointmentWebhookData = DataNodeCommon & {
    appointmentServices: Array<AppointmentWebhookAppointmentService>,
    bookedByType: string,
    cancellation?: any,
    client: AppointmentWebhookClient,
    clientId: string,
    duration: number,
    endAt: string,
    id: string,
    location: AppointmentWebhookLocation,
    locationId: string,
    notes?: string, 
    orderId?: string,
    startAt: string,
    tags: Tag[]
}