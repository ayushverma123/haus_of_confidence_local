import { BoulevardAppointmentsTableRow } from "./model/BoulevardAppointmentsTableRow"
import { queries } from "./queries"

const db = require('../../db')

export const getAllDatabaseAppointments = async (onlyCurrent: boolean = false): Promise<Array<BoulevardAppointmentsTableRow>> => {
    try {
        const { rows } = await db.query(onlyCurrent ? queries.getAllCurrentAppointments : queries.getAllAppointments)

        if (typeof(rows) === 'undefined' || Object.is(rows, null)) {
            throw new Error(`All Appointments query returned undefined or null `)
        }

        return new Promise((resolve) => resolve(rows))
    } catch (error) {
        console.error(`Error getting all appointments from database`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}