import { Maybe } from "../../../../model/Maybe"
import { AutomatedMessageConfigurationEntry } from "../../model/AutomatedMessageConfigurationEntry"
import { AutomatedMessageLockEntry } from "../../model/AutomatedMessageLockEntry"
import { getAutomatedMessageConfigurationWithId } from "../../tableController/getAutomatedMessageConfigurationWithId"
import { AutomatedMessageLocksTableRow } from "../model/tableRow"

const automatedMessageLocksTableRowToLocksEntryMapping: {[key: string]: string} = {
    id: 'id',
    automated_message_schedule: 'automated_message_id',
    lock_type: 'lockType',
    locks: 'locks',
    lock_date: 'lockDate'
}

export const convertAutomatedMessageLockTableRowsToAutomatedMessageLocksEntries = async (rows: AutomatedMessageLocksTableRow[]): Promise<AutomatedMessageLockEntry[]> => {
    //@ts-ignore
    const entriesWithConfigEntries: AutomatedMessageLockEntry[] = await rows.reduce(async (acc: Promise<AutomatedMessageLockEntry[]>, row: AutomatedMessageLocksTableRow): Promise<AutomatedMessageLockEntry[]> => {
        const existing = await acc

        try {
            const automatedMessageConfig: Maybe<AutomatedMessageConfigurationEntry> = await getAutomatedMessageConfigurationWithId(row.automated_message_schedule)

            if (typeof(automatedMessageConfig) === 'undefined' || Object.is(automatedMessageConfig, null)) {
                throw new Error(`No automated message entry exists with id: ${row.id}`)
            }

            const returnObject = [
                ...existing,
                {
                    //@ts-ignore
                    ...Object.keys(row).reduce((accEntry: AutomatedMessageLockEntry, currentKey: string): AutomatedMessageLockEntry => ({
                        ...accEntry,
                        [automatedMessageLocksTableRowToLocksEntryMapping[currentKey]]: row[currentKey]
                    }), {}),
                    automatedMessageConfiguration: automatedMessageConfig,
                }
            ]
            return new Promise((resolve) => resolve(returnObject))
        } catch (error) {
            console.error(`Could not find automated message configuration with id: ${row.id}`)
            console.error(error)

            return new Promise((_, reject) => reject(error))
        }
    }, [])

    return entriesWithConfigEntries
}