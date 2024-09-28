import { queries } from "./queries"

const db = require('../../db')

export const updateAppointmentCancelledValue = async (id: number, cancelled: boolean): Promise<boolean> => {
    try {
        await db.query(queries.updateCancelledValue(id, cancelled))

        return new Promise(resolve => resolve(true))
    } catch (error) {
        console.error(`Error updating cancelled value for id ${id}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}