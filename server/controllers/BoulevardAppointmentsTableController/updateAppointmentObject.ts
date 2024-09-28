import { Appointment } from "../../ThirdPartyServices/Blvd/model/Appointment";
import { queries } from "./queries";

const db = require('../../db')

export const updateAppointmentObject = async (id: number, appointmentObject: Appointment): Promise<Appointment> => {
    try {
        await db.query(queries.updateAppointmentObject(id, appointmentObject))

        return new Promise((resolve) => resolve(appointmentObject))
    } catch (error) {
        console.error(`Could not update appointment ${id}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}