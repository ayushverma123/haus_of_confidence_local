import { AutomatedMessageLockEntry } from "../model/AutomatedMessageLockEntry";
import { convertAutomatedMessageLockTableRowsToAutomatedMessageLocksEntries } from "./helpers/convertAutomatedMessageLockTableRowsToAutomatedMessageLocksEntries";
import { getAllRows } from "./queries/getAllRows";

const db = require('../../../db')

export const getAllAutomatedMessageLockEntries = async (): Promise<AutomatedMessageLockEntry[]> => {
    try {
        const { rows } = await db.query(getAllRows())

        if (typeof(rows) === 'undefined' || Object.is(rows, null)) {
            throw new Error(`Invalid response from database when retreiving all automated message lock entries.`)
        }

        const result = await convertAutomatedMessageLockTableRowsToAutomatedMessageLocksEntries(rows)
        return new Promise((resolve) => resolve(result))

    } catch (error) {
        console.error(`Unable to get all automated message locks entries`)
        console.error(error)

        return new Promise((resolve, reject) => reject(error))
    }
}