import { MessageQueueTableRow } from "../../MessageQueueController/model/MessageQueueTableRow";
import { MessageStatus } from "../../MessageQueueController/model/MessageStatus";
import { updateRowStatus } from "./queries/updateRowStatus";

const db = require('../../../db')

export const updateAutomatedMessageEntryStatus = async (id: number, rowEnabled: boolean): Promise<MessageQueueTableRow> => {
    try {
        const { rows } = await db.query(updateRowStatus(id, rowEnabled))

        if (typeof(rows) === 'undefined' || Object.is(rows, null)) {
            // return new Promise(resolve => resolve(undefined))
            throw new Error(`Error updating message entry status -- received empty response from database`)
        }

        if (rows.length !== 1) {
            throw new Error(`Expected 1 row, got ${rows.length}`)
        }

        return new Promise(resolve => resolve(rows[0]))

    } catch (error) {
        console.error(`Unable to update row status`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}