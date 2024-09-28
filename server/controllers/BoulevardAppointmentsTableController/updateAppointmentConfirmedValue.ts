import { queries } from "./queries"

const db = require('../../db')

export const updateAppointmentConfirmedValue = async (id: number, confirmed: boolean): Promise<boolean> => {
    try {
        await db.query(queries.updateConfirmedValue(id, confirmed))

        return new Promise(resolve => resolve(true))
    } catch (error) {
        console.error(`Error updating confirmed value for id ${id}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}