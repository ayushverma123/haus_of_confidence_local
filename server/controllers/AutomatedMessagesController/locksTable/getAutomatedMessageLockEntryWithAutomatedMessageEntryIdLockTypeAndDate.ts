import { setDateTimeToStartOfDay } from "../../../helpers/setDateTimeToStartOfDay";
import { Maybe } from "../../../model/Maybe";
import { AutomatedMessageLockEntry } from "../model/AutomatedMessageLockEntry";
import { AutomatedMessageLockType } from "../model/AutomatedMessageLockType";
import { createNewAutomatedMessageLockEntry } from "./createNewAutomatedMessageLockEntry";
import { convertAutomatedMessageLockTableRowsToAutomatedMessageLocksEntries } from "./helpers/convertAutomatedMessageLockTableRowsToAutomatedMessageLocksEntries";
import { getCorrectLockDate } from "./helpers/getCorrectLockDate";
import { getRowWithAutomatedMessageEntryIdLockTypeAndDate } from "./queries/getRowWithAutomatedMessageEntryIdLockTypeAndDate";

const db = require('../../../db')

export const getAutomatedMessageLockEntryWithAutomatedMessageEntryIdLockTypeAndDate = async (automatedMessageId: number, lockType: AutomatedMessageLockType, _lockDate: Date): Promise<Maybe<AutomatedMessageLockEntry>> => {    
    const lockDate = await getCorrectLockDate(lockType, _lockDate)

    try {

        const { rows } = await db.query(getRowWithAutomatedMessageEntryIdLockTypeAndDate(automatedMessageId, lockType, lockDate))

        if (typeof(rows) === 'undefined' || Object.is(rows, null)) {
            throw new Error(`There is no automated message lock entry with id: ${automatedMessageId}`)
        }
        if (rows.length === 0) {
            const newRow: AutomatedMessageLockEntry = await createNewAutomatedMessageLockEntry(automatedMessageId, lockType, lockDate)
            return new Promise((resolve) => resolve(newRow))
        }
        
        const result = await convertAutomatedMessageLockTableRowsToAutomatedMessageLocksEntries(rows)
        return new Promise((resolve) => resolve(result[0]))

    } catch (error) {
        console.error(`Could not find automated message lock entry with id: ${automatedMessageId}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}