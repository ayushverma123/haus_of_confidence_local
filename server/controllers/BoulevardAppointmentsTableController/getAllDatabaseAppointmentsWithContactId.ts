import { BoulevardAppointmentsTableRow } from "./model/BoulevardAppointmentsTableRow"
import { queries } from "./queries"

const db = require('../../db')

export const getAllDatabaseAppointmentsWithContactId = async (contactId: number, excludeCancelled: boolean = false, onlyCompleted: boolean = false): Promise<Array<BoulevardAppointmentsTableRow>> => {
    try {
        const { rows } = await db.query(queries.getAllAppointmentsWithContactId(contactId, excludeCancelled, onlyCompleted))

        if (typeof(rows) === 'undefined' || Object.is(rows, null)) {
            throw new Error(`All Appointments query returned undefined or null `)
        }

        return new Promise((resolve) => resolve(rows))
    } catch (error) {
        console.error(`Error getting all appointments from database with contact id: ${contactId}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}