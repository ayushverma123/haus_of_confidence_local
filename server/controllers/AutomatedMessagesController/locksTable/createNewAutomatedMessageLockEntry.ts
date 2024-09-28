import { getCorrectLockDate } from "./helpers/getCorrectLockDate";
import { AutomatedMessageLockEntry } from "../model/AutomatedMessageLockEntry";
import { AutomatedMessageLockType } from "../model/AutomatedMessageLockType";
import { convertAutomatedMessageLockTableRowsToAutomatedMessageLocksEntries } from "./helpers/convertAutomatedMessageLockTableRowsToAutomatedMessageLocksEntries";
import { insertRow } from "./queries/insertRow";

const db = require('../../../db')

export const createNewAutomatedMessageLockEntry = async (automatedMessageScheduleId: number, lockType: AutomatedMessageLockType, _lockDate: Date, locks: string[] = []): Promise<AutomatedMessageLockEntry> => {
    const lockDate = await getCorrectLockDate(lockType, _lockDate)

    try {
        const { rows } = await db.query(insertRow(automatedMessageScheduleId, lockType, lockDate, locks))

        if (typeof(rows) === 'undefined' || Object.is(rows, null)) {
            throw new Error(`Query to create new automated message lock entry returned undefined.`)
        }

        if (rows.length === 0) {
            throw new Error(`Query to create new automated message lock entry returned no rows.`)
        }

        const result = await convertAutomatedMessageLockTableRowsToAutomatedMessageLocksEntries(rows)

        return new Promise((resolve) => resolve(result[0]))

    } catch (error) {
        console.error(`Could not create new automated message lock entry with automatedMessageScheduleId=${automatedMessageScheduleId}, lockType=${lockType}, and lockDate=${lockDate}.`)
        console.error(error)

        return new Promise((resolve, reject) => reject(error))
    }
}