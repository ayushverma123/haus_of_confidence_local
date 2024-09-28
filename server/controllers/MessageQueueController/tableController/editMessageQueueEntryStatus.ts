import { MessageStatus } from "../model/MessageStatus";
import { updateRowStatus } from "./queries/updateRowStatus";

const db = require('../../../db')

export const editMessageQueueEntryStatus = async (id: number, status: MessageStatus): Promise<boolean> => {

    try {
        const { rows } = await db.query(updateRowStatus(id, status))

        if (Object.is(rows, null) || typeof(rows) === 'undefined') {
            throw new Error('Did not receive updated row as response to query')
        }

        if (rows.length === 0) {
            throw new Error('Response to update row query was empty')
        }

        return new Promise((resolve) => resolve(true))

    } catch (error) {
        console.error(`Unable to edit message queue entry status`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}