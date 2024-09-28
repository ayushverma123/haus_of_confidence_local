import { removeRow } from "./queries/removeRow"

const db = require('../../../db')

export const removeWebhooksQueueEntry = async (id: number): Promise<boolean> => {
    try {
        await db.query(removeRow(id))

        return new Promise((resolve) => resolve(true))
    } catch (error) {
        console.error(`Could not remove webhooks queue entry with id ${id}.`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}