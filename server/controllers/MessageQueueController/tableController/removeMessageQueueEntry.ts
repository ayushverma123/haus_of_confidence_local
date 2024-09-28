import { deleteRow } from "./queries/deleteRow"

const db = require('../../../db')

export const removeMessageQueueEntry = async (id: number): Promise<boolean> => {

    try {
        await db.query(deleteRow(id))

        return new Promise((resolve) => resolve(true))
    } catch (error) {
        console.error(`Error removing message queue entry`)
        console.error(error)
        return new Promise((_, reject) => reject(error))
    }
}