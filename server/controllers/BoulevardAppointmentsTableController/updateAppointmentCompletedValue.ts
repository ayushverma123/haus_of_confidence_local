import { queries } from "./queries"

const db = require('../../db')

export const updateAppointmentCompletedValue = async (id: number, completed: boolean): Promise<boolean> => {
    try {
        await db.query(queries.updateCompletedValue(id, completed))

        return new Promise(resolve => resolve(true))
    } catch (error) {
        console.error(`Error updating completed value for id ${id}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}