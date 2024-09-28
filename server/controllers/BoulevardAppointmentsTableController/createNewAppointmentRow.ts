import { Appointment } from "../../ThirdPartyServices/Blvd/model/Appointment";
import { BoulevardAppointmentsTableRow } from "./model/BoulevardAppointmentsTableRow";
import { queries } from "./queries";

const db = require('../../db')

// TODO - Test
export const createNewAppointmentRow = async (contactId: number, appointmentId: string, appointmentObject: Appointment): Promise<BoulevardAppointmentsTableRow> => {
    try {

        if (typeof(contactId) !== 'number' && typeof(contactId) !== 'string') {
            throw new Error('contactId must be a number or string')
        }

        const { rows } = await db.query(queries.insertRow(contactId, appointmentId, appointmentObject))

        if (Object.is(rows, null) || typeof(rows) === 'undefined') {
            throw new Error('Did not receive newly created row as response to query')
        }

        if (rows.length === 0) {
            throw new Error('Response to newly created appointment row query was empty')
        }

        return new Promise(resolve => resolve(rows[0]))

    } catch (error) {
        console.error(`Could not create new boulevard appointment row`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}