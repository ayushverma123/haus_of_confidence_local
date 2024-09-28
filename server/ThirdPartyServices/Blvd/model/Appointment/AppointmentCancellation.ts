import { AppointmentCancellationReason } from "./AppointmentCancellationReason";

export interface AppointmentCancellation {
    cancelledAt: string,
    notes?: string,
    reason: AppointmentCancellationReason,
}