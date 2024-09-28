import { Maybe } from "../../../model/Maybe";
import { AutomatedMessageLockEntry } from "../model/AutomatedMessageLockEntry";
import { convertAutomatedMessageLockTableRowsToAutomatedMessageLocksEntries } from "./helpers/convertAutomatedMessageLockTableRowsToAutomatedMessageLocksEntries";
import { getRowWithId } from "./queries/getRowWithId";

const db = require('../../../db')

export const getAutomatedMessageLockEntryWithId = async (id: number): Promise<Maybe<AutomatedMessageLockEntry>> => {

    try {
        const { rows } = await db.query(getRowWithId(id))

        if (typeof(rows) === 'undefined' || Object.is(rows, null)) {
            throw new Error(`There is no automated message lock entry with id: ${id}`)
        }

        if (rows.length === 0) {
            return new Promise((resolve) => resolve(undefined))
        }

        const result = await convertAutomatedMessageLockTableRowsToAutomatedMessageLocksEntries(rows)
        return new Promise((resolve) => resolve(result[0]))

    } catch (error) {
        console.error(`Could not find automated message lock entry with id: ${id}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}