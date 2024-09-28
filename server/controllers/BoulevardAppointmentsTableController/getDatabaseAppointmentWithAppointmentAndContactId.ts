import { BoulevardAppointmentsTableRow } from "./model/BoulevardAppointmentsTableRow"
import { queries } from "./queries"

const db = require('../../db')

export const getDatabaseAppointmentWithAppointmentAndContactId = async (contactId: number, appointmentId: string): Promise<BoulevardAppointmentsTableRow> => {
    try {
        const { rows } = await db.query(queries.getRowWithContactIdAndAppointmentId(contactId, appointmentId))

        if (typeof(rows) === 'undefined' || Object.is(rows, null)) {
            throw new Error(`Get appointment with contact and appointment IDs returned undefined or null `)
        }

        return new Promise((resolve) => resolve(rows[0]))
    } catch (error) {
        console.error(`Error getting appointment from database with contact id: ${contactId} and appointment id: ${appointmentId}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}