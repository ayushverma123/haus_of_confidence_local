import { getAppointment } from "../../../../../../ThirdPartyServices/Blvd/controllers/AppointmentsController/getAppointment";
import { Appointment } from "../../../../../../ThirdPartyServices/Blvd/model/Appointment";
import { Maybe } from "../../../../../../model/Maybe";

export const verifyAndRetrieveAppointmentFromBoulevardServer = async (appointmentId: string): Promise<Appointment> => {
    try {
        const appointment: Maybe<Appointment> = await getAppointment(appointmentId)

        if (typeof(appointment) === 'undefined' || Object.is(appointment, null)) {
            throw new Error(`Could not get appointment information from Boulevard using id ${appointmentId}`)
        }

        return new Promise((resolve) => resolve(appointment))
    } catch (error) {
        console.error(`Failed to retrieve appointment from Boulevard server with id ${appointmentId}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}