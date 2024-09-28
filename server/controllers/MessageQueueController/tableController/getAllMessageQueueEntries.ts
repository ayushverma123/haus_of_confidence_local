import { MessageQueueTableRow } from "../model/MessageQueueTableRow";
import { getAllRows } from "./queries/getAllRows";

const db = require('../../../db')

export const getAllMessageQueueEntries = async (): Promise<MessageQueueTableRow[]> => {
    try {

        const { rows } = await db.query(getAllRows())

        if (Object.is(rows, null) || typeof(rows) === 'undefined') {
            throw new Error('Did not receive newly created row as response to query')
        }

        // if (rows.length === 0) {
        //     throw new Error('Response to newly created appointment row query was empty')
        // }

        return new Promise((resolve) => resolve(rows))

    } catch (error) {
        console.error(`Could not get all message queue entries`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}