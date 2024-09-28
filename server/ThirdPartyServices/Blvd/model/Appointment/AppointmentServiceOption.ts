import { Id } from "../Id";

export interface AppointmentServiceOption {
    appointmentServiceId: Id,
    durationDelta: number,
    finishDurationDelta: number,
    id: Id,
    postClientDurationDelta: number,
    postStaffDurationDelta: number,
    priceDelta: number,
    serviceOptionId: Id,
}