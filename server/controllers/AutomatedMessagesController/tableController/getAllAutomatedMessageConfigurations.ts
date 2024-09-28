import { AutomatedMessageConfigurationEntry } from "../model/AutomatedMessageConfigurationEntry";
import { TableRow } from "../model/AutomatedMessagesTableRow";
import { convertAutomatedMessagesTableRowsToAutomatedMessageConfigurationEntries } from "./helpers/convertAutomatedMessagesTableRowsToAutomatedMessageConfigurationEntries";
import { getAllRows } from "./queries/getAllRows";

const db = require('../../../db')

export const getAllAutomatedMessageConfigurations = async (enabledOnly: boolean = true): Promise<AutomatedMessageConfigurationEntry[]> => {
    try {
        const { rows } = await db.query(getAllRows(enabledOnly))

        if (typeof(rows) === 'undefined' || Object.is(rows, null)) {
            return new Promise(resolve => resolve([]))
        }

        const processedRows: AutomatedMessageConfigurationEntry[] = convertAutomatedMessagesTableRowsToAutomatedMessageConfigurationEntries(rows)

        return new Promise(resolve => resolve(processedRows))

    } catch (error) {
        console.error(`Unable to get all automated message configurations`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}