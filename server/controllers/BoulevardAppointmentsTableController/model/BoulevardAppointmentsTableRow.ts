import { Appointment } from "../../../ThirdPartyServices/Blvd/model/Appointment";

export interface BoulevardAppointmentsTableRow {
    id: number,
    contact_id: number,
    appointment_id: string,
    appointment_object: Appointment,
    created_at: string,
    updated_at: string,
    cancelled: boolean,
    confirmed: boolean,
    active: boolean,
    completed: boolean,
    confirmed_at?: string,
    completed_at?: string,
    cancelled_at?: string
}