import { Id } from "../Id";
import { Service } from "../Service";
import { Staff } from "../Staff";

export interface AppointmentService {
    baseAppointmentServiceId?: Id,
    duration: number,
    endAt: string,
    id: Id,
    price: number,
    service: Service,
    serviceId: Id,
    staff: Staff,
    staffId: Id,
    staffRequested: boolean,
    startAt: string,
    startTimeOffset: number,
    totalDuration: number
}