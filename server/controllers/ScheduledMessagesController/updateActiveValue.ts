import { checkForEmptyDatabaseResponse } from "../../db/checkForEmptyDatabaseResponse"
import { ScheduledMessage } from "./model/ScheduledMessage"
import { ScheduledMessageType } from "./model/ScheduledMessageType"
import { alterActiveValueForRow } from "./queries/alterActiveValueForRow"

const db = require('../../db')

export const updateScheduledMessageActiveValue = async (contactId: number, type: ScheduledMessageType, active: boolean): Promise<boolean> => {
    try {
        const { rows } = await db.query(alterActiveValueForRow(contactId, type, active))

        checkForEmptyDatabaseResponse(rows)

        // if (rows.length <= 0) throw new Error("Query response has length of 0 when it should not")

        return new Promise((resolve) => resolve(true))
    } catch (error) {
        console.error(`Unable to update active value for row ${contactId}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}