import { getAutomatedMessageLockEntryWithId } from "./getAutomatedMessageLockEntryWithId"
import { updateRow } from "./queries/updateRow"

const db = require('../../../db')

export const removeIdsFromAutomatedMessageLockEntry = async (automatedMessageEntryId: number, newIds: string[]): Promise<string[]> => {
    try {
        const entry = await getAutomatedMessageLockEntryWithId(automatedMessageEntryId)

        if (typeof(entry) === 'undefined' || Object.is(entry, null)) {
            throw new Error(`Could not find automated message lock entry with id ${automatedMessageEntryId}`)
        }

        const { locks: existingIds } = entry

        const filteredIds: string[] = existingIds.filter((id: string) => !newIds.includes(id))

        await db.query(updateRow(automatedMessageEntryId, filteredIds))

        return new Promise((resolve) => resolve(filteredIds))


    } catch (error) {
        console.error(`Error while removing ${newIds.length} ids message lock entry with id ${automatedMessageEntryId}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }

}