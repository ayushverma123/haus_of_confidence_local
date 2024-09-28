import { incrementRetries } from "./queries/incrementRetries"

const db = require('../../../db')

export const incrementMessageQueueEntryRetries = async (id: number): Promise<boolean> => {
    try {
        const { rows } = await db.query(incrementRetries(id))

        if (Object.is(rows, null) || typeof(rows) === 'undefined') {
            throw new Error('Did not receive updated row as response to query')
        }

        if (rows.length === 0) {
            throw new Error('Response to update row query was empty')
        }

        return new Promise((resolve) => resolve(true))
    } catch (error) {
        console.error(`Unable to increment message queue entry retries for id: ${id}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}