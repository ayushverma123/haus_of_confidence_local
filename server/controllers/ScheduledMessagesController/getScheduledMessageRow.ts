import { checkForEmptyDatabaseResponse } from "../../db/checkForEmptyDatabaseResponse";
import { Maybe } from "../../model/Maybe";
import { ScheduledMessageType } from "./model/ScheduledMessageType";
import { ScheduledMessage } from "./model/ScheduledMessage";
import { getRow } from "./queries/getRow";

const db = require('../../db')

export const getScheduledMessageRow = async (
    contactId: number, 
    type: ScheduledMessageType
): Promise<Maybe<ScheduledMessage>> => {
    try {
        const { rows } = await db.query(getRow(contactId, type))

        checkForEmptyDatabaseResponse(rows)

        return new Promise((resolve) => resolve(rows[0]))

    } catch (error) {
        console.error(`Cannot get scheduled message with contact id: ${contactId} and type: ${type}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}