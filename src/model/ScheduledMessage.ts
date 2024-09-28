import { ScheduledMessageType } from "./ScheduledMessageType";

export interface ScheduledMessage {
    contact_id: number,
    type: ScheduledMessageType,
    message_text: string,
    scheduled_time?: string,
    created_at: string,
    updated_at: string,
    active: boolean,
    phone_numbers: string[],
    first_name?: string,
    last_name?: string,
    emails: string[],
    appointment_id?: number,
    // alert_time?: string
}