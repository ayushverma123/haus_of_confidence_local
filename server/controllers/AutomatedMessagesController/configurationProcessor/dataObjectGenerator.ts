import { utcToZonedTime } from "date-fns-tz";
import { getAppointment } from "../../../ThirdPartyServices/Blvd/controllers/AppointmentsController/getAppointment";
import { Appointment } from "../../../ThirdPartyServices/Blvd/model/Appointment";
import { Id } from "../../../ThirdPartyServices/Blvd/model/Id";
import { GeneralContact } from "../../../model/GeneralContact";
import { Maybe } from "../../../model/Maybe";
import { getDatabaseAppointmentWithAppointmentId } from "../../BoulevardAppointmentsTableController/getDatabaseAppointmentWithAppointmentId";
import { BoulevardAppointmentsTableRow } from "../../BoulevardAppointmentsTableController/model/BoulevardAppointmentsTableRow";
import { getGeneralContactWithPrimaryKey } from "../../GeneralContactsController";
import { AutomatedMessageDataObject } from "../model/AutomatedMessageDataObject";

// TODO
// ! Always update the appointment_object with the latest data before calling this function
export const generateDataObject = async (appointmentId?: Id, contactId?: string): Promise<AutomatedMessageDataObject> => {
    const hasAppointmentId = typeof(appointmentId) !== "undefined"
    const hasContactId = typeof(contactId) !== "undefined"
    
    try {
        // const appointmentData: Maybe<Appointment> = hasAppointmentId ? await getAppointment(appointmentId) : undefined
        const appointmentData: Maybe<BoulevardAppointmentsTableRow> = hasAppointmentId ? await getDatabaseAppointmentWithAppointmentId(appointmentId as string) : undefined
        const contactData: Maybe<GeneralContact> = hasContactId? await getGeneralContactWithPrimaryKey(contactId) : undefined
    
        const hasAppointmentData = typeof(appointmentData) !== "undefined"
        const hasContactData = typeof(contactData) !== "undefined"

        return new Promise((resolve) => resolve({
            hasData: {
                contact: hasContactData,
                appointment: hasAppointmentData
            },
            currentTime: utcToZonedTime(new Date(), process.env.LOCAL_TIMEZONE!),
            data: {
                contact: contactData,
                appointment: appointmentData?.appointment_object
            }
        }))

    } catch (error) {
        console.error(`Unable to generate AutomatedMessageDataObject`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}