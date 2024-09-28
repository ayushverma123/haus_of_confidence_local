import { checkForEmptyDatabaseResponse } from "../../db/checkForEmptyDatabaseResponse"
import { ScheduledMessageType } from "./model/ScheduledMessageType"
import { alterAlertTimeValueForRow } from "./queries/alterAlertTimeValueForRow"

const db = require('../../db')

export const updateAlertTimeValue = async (contactId: number, type: ScheduledMessageType, alertTime: string): Promise<boolean> => {
    try {
        const { rows } = await db.query(alterAlertTimeValueForRow(contactId, type, alertTime))

        checkForEmptyDatabaseResponse(rows)

        return new Promise((resolve, reject) => resolve(true))

    } catch (error) {
        console.error(`Unable to update alert time value for contact ${contactId} and type ${type}.`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}