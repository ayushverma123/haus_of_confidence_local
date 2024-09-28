import { queries } from "./queries"

const db = require('../../db')

export const updateAppointmentActiveValue = async (id: number, active: boolean): Promise<boolean> => {
    try {
        await db.query(queries.updateActiveValue(id, active))

        return new Promise(resolve => resolve(true))
    } catch (error) {
        console.error(`Error updating active value for id ${id}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}