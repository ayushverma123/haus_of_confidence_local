import { Maybe } from "../../../model/Maybe";
import { AutomatedMessageConfigurationEntry } from "../model/AutomatedMessageConfigurationEntry";
import { convertAutomatedMessagesTableRowsToAutomatedMessageConfigurationEntries } from "./helpers/convertAutomatedMessagesTableRowsToAutomatedMessageConfigurationEntries";
import { getRowWithScheduleName } from "./queries/getRowWithScheduleName";

const db = require('../../../db')

//? Will only error out if there was a problem communicating with the database (no connection, bad response, etc.)
//? Otherwise it will return the configuration entry with the given schedule name or undefined if there is no configuration entry with the given schedule name
export const getAutomatedMessageConfigurationWithScheduleName = async (scheduleName: string): Promise<Maybe<AutomatedMessageConfigurationEntry>> => {
    try {
        const { rows } = await db.query(getRowWithScheduleName(scheduleName))

        if (typeof(rows) === 'undefined' || Object.is(rows, null)) {
            return new Promise(resolve => resolve(undefined))
        }

        if (rows.length !== 1) {
            if (rows.length <= 0) return new Promise(resolve => resolve(undefined))

            throw new Error(`Expected 1 row, got ${rows.length}`)
        }

        const processedRows = convertAutomatedMessagesTableRowsToAutomatedMessageConfigurationEntries(rows)

        return new Promise(resolve => resolve(processedRows[0]))

    } catch (error) {
        console.error(`Unable to get automated message configuration with schedule name: ${scheduleName}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}