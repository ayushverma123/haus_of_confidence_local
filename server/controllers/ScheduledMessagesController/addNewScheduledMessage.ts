import { checkForEmptyDatabaseResponse } from "../../db/checkForEmptyDatabaseResponse";
import { ScheduledMessageType } from "./model/ScheduledMessageType";
import { ScheduledMessage } from "./model/ScheduledMessage";
import { insertRow } from "./queries/insertRow";


const db = require('../../db')

export const addNewScheduledMessage = async (
    contactId: number, 
    type: ScheduledMessageType,
    active: boolean,
    messageText: string,
    scheduled_time?: string,
    appointment_id?: number
): Promise<ScheduledMessage> => {
    try {
        const { rows } = await db.query(insertRow(contactId, type, messageText, active, scheduled_time, appointment_id));

        checkForEmptyDatabaseResponse(rows, 'Did not receive newly created row as response to query')

        if (rows.length === 0) {
            throw new Error('Response to newly created scheduled message row query was empty')
        }

        return new Promise(resolve => resolve(rows[0]))

    } catch (error) {
        console.error('Could not add new scheduled message')
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}