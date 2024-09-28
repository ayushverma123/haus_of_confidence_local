import { deleteRow } from "./queries/deleteRow"

const db = require('../../../db')

export const removeAutomatedMessageConfigurationEntry = async (id: number): Promise<boolean> => {
    try {
        await db.query(deleteRow(id))

        return new Promise<boolean>((resolve) => resolve(true))
    } catch (error) {
        console.error(`Unable to remove automated message configuration entry with id: ${id}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}