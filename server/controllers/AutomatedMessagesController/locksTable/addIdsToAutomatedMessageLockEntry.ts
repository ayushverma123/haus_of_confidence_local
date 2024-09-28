import { convertArrayToSet } from "../../../helpers/ArrayFunctions"
import { getAutomatedMessageLockEntryWithId } from "./getAutomatedMessageLockEntryWithId"
import { updateRow } from "./queries/updateRow"

const db = require('../../../db')

export const addIdsToAutomatedMessageLockEntry = async (automatedMessageLockEntryId: number, newIds: string[]): Promise<string[]> => {
    try {

        const entry = await getAutomatedMessageLockEntryWithId(automatedMessageLockEntryId)

        if (typeof(entry) === 'undefined' || Object.is(entry, null)) {
            throw new Error(`Could not find automated message lock entry with id ${automatedMessageLockEntryId}`)
        }

        const { locks: existingIds } = entry

        if (typeof(existingIds) === 'undefined' || Object.is(existingIds, null)) {
            throw new Error(`Could not find automated message lock entry with id ${automatedMessageLockEntryId}`)
        }

        const newIdsSet: Set<string> = convertArrayToSet<string>([...existingIds, ...newIds]) //[...existingIds, ...newIds].reduce((acc: Set<string>, cv: string): Set<string> => acc.add(cv), new Set<string>())
        const newIdsArrayFromSet: string[] = Array.from(newIdsSet)

        await db.query(updateRow(automatedMessageLockEntryId, newIdsArrayFromSet))

        return new Promise((resolve) => resolve(newIdsArrayFromSet))


    } catch (error) {
        console.error(`Error while updating message lock entry with id ${automatedMessageLockEntryId}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}