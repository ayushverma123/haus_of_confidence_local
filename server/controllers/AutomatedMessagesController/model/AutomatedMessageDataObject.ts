import { Appointment } from "../../../ThirdPartyServices/Blvd/model/Appointment"
import { GeneralContact } from "../../../model/GeneralContact"
import { AutomatedMessageTimeConfigEntry } from "./AutomatedMessageTimeConfigEntry"
// import { BoulevardAppointmentsTableRow } from "../../BoulevardAppointmentsTableController/model/BoulevardAppointmentsTableRow"

export interface AutomatedMessageDataObject {
    hasData: {
        contact: boolean,
        appointment: boolean,
    },
    currentTime: Date,
    data: {
        contact?: GeneralContact,
        appointment?: Appointment,
        numberOfAppointments?: number,
        timeAsCustomer?: AutomatedMessageTimeConfigEntry,
        birthdate?: Date
    },
}
