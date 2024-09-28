import { getAutomatedMessageLockEntryWithId } from "./getAutomatedMessageLockEntryWithId"
import { updateRow } from "./queries/updateRow"

const db = require('../../../db')

export const removeAllIdsFromAutomatedMessageLockEntry = async (automatedMessageEntryId: number): Promise<string[]> => {
    try {
        await db.query(updateRow(automatedMessageEntryId, []))

        return new Promise((resolve) => resolve([]))

    } catch (error) {
        console.error(`Error while clearing all ids from message lock entry with id ${automatedMessageEntryId}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }

}