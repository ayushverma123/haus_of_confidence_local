import { Maybe } from "../../../../model/Maybe";
import { Appointment } from "../../model/Appointment";
import { Id } from "../../model/Id";

export type NewAppointmentInput = {

}

// TODO
export const createOrUpdateAppointment = async (appointment: Appointment, appointmentId: Maybe<string> = undefined) => {
    const shouldUpdate: boolean = typeof(appointmentId) !== 'undefined'

    let newAppointment: Appointment


}
//TODO -- Definitely will need to change the input parameters, appointment won't work
//@ts-ignore
const createAppointment = async (appointment: Appointment): Promise<Appointment> => {
    try {

    } catch (error) {
        console.error(`Error creating Boulevard appointment`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

// TODO
//@ts-ignore
const updateAppointment = async (appointment: Appointment, appointmentId: string): Promise<Appointment> => {
    try {

    } catch (error) {
        console.error(`Error updating Boulevard appointment: ${appointmentId}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}