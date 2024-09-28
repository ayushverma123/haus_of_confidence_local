import { BoulevardAppointmentsTableRow } from "./model/BoulevardAppointmentsTableRow"
import { queries } from "./queries"

const db = require('../../db')

export const getDatabaseAppointmentWithId = async (id: number): Promise<BoulevardAppointmentsTableRow> => {
    try {
        const { rows } = await db.query(queries.getRowWithId(id))

        if (typeof(rows) === 'undefined' || Object.is(rows, null)) {
            throw new Error(`Get appointment with ID query returned undefined or null `)
        }

        return new Promise((resolve) => resolve(rows[0]))
    } catch (error) {
        console.error(`Error getting appointment from database with ID: ${id}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}