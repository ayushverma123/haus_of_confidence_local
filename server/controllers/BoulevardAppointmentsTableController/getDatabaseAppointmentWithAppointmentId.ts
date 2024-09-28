import { BoulevardAppointmentsTableRow } from "./model/BoulevardAppointmentsTableRow"
import { queries } from "./queries"

const db = require('../../db')

export const getDatabaseAppointmentWithAppointmentId = async (appointmentId: string): Promise<BoulevardAppointmentsTableRow> => {
    try {
        const { rows } = await db.query(queries.getRowWithAppointmentId(appointmentId))

        if (typeof(rows) === 'undefined' || Object.is(rows, null)) {
            throw new Error(`Get appointment with appointment ID query returned undefined or null `)
        }

        return new Promise((resolve) => resolve(rows[0]))
    } catch (error) {
        console.error(`Error getting appointment from database with appointment id: ${appointmentId}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}