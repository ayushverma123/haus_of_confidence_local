import { BookedBy } from "../BookedBy";
import { CalendarLinks } from "../CalendarLinks";
import { Client } from "../Client";
import { Id } from "../Id";
import { NativeObjectMeta } from "../NativeObjectMeta";
import { AppointmentCancellation } from "./AppointmentCancellation";
import { AppointmentService } from "./AppointmentService";
import { AppointmentServiceOption } from "./AppointmentServiceOption";
import { Location } from '../Location'
import { AppointmentRating } from "./AppointmentRating";
import { RemotePlatforms } from "./RemotePlatforms";
import { Tag } from "../Tag";
import { AppointmentState } from "./AppointmentState";

// TODO
export interface Appointment {
    appointmentServiceOptions: Array<AppointmentServiceOption>,
    appointmentServices: Array<AppointmentService>,
    bookedByType: BookedBy,
    calendarLinks: CalendarLinks,
    cancellation?: AppointmentCancellation,
    cancelled: boolean,
    client: Client,
    clientId: Id,
    createdAt: string,
    custom?: NativeObjectMeta,
    customFields: {[key: string]: string},
    duration: number,
    endAt: string,
    id?: Id,
    isRemote: boolean,
    location: Location,
    locationId: Id,
    manageUrl: string,
    notes?: string,
    notifyClientCancel: boolean,
    notifyClientCreate: boolean,
    orderId?: Id,
    pendingFormCount: number,
    rating?: AppointmentRating,
    remotePlatforms: RemotePlatforms,
    startAt: string,
    state: AppointmentState,
    tags: Array<Tag>
}

export const graphQlBody: string = `
    id
    appointmentServiceOptions {
        appointmentServiceId
    }
    appointmentServices {
        service {
            name
            description
        }
        staff {
            name
            firstName
            lastName
        }
    }
    bookedByType
    cancellation {
        cancelledAt
        notes
        reason
    }
    cancelled
    clientId
    createdAt
    duration
    endAt
    isRemote
    locationId
    manageUrl
    notes
    notifyClientCancel
    notifyClientCreate
    orderId
    pendingFormCount
    startAt
    state
    tags {
        id
        name
    }
`