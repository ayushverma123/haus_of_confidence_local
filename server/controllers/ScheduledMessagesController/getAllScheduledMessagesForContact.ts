import { checkForEmptyDatabaseResponse } from "../../db/checkForEmptyDatabaseResponse";
import { ScheduledMessage } from "./model/ScheduledMessage";
import { getAllRowsForContactId } from "./queries/getAllRowsForContactId";

const db = require('../../db')

export const getAllScheduledMessagesForContact = async (contactId: number): Promise<ScheduledMessage[]> => {
    try {
        const { rows } = await db.query(getAllRowsForContactId(contactId))

        checkForEmptyDatabaseResponse(rows)

        return new Promise((resolve) => resolve(rows))

    } catch (error) {
        console.error(`Could not get all scheduled messages for contact: ${contactId}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}