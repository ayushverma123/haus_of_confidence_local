import { deleteRow } from "./queries/deleteRow"

const db = require('../../../db')

export const removeAutomatedMessageLockEntry = async (automatedMessageLockId: number): Promise<boolean> => {
    try {
        await db.query(deleteRow(automatedMessageLockId))

        return new Promise((resolve) => resolve(true))

    } catch (error) {
        console.error(`Error while deleting message lock entry with id ${automatedMessageLockId}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}   