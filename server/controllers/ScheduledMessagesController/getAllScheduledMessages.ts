import { checkForEmptyDatabaseResponse } from "../../db/checkForEmptyDatabaseResponse";
import { ScheduledMessage } from "./model/ScheduledMessage";
import { getAllRows } from "./queries/getAllRows";

const db = require('../../db')

export const getAllScheduledMessages = async (): Promise<ScheduledMessage[]> => {
    try {
        const { rows } = await db.query(getAllRows) 

        checkForEmptyDatabaseResponse(rows)

        return new Promise((resolve) => resolve(rows))
        
    } catch (error) {
        console.error(`Could not get all scheduled messages`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}