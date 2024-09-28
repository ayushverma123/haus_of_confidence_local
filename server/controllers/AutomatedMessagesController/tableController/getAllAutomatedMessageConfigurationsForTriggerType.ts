import { AutomatedMessageConfigurationEntry } from "../model/AutomatedMessageConfigurationEntry";
import { AutomatedMessageTrigger } from "../model/AutomatedMessageTrigger";
import { TableRow } from "../model/AutomatedMessagesTableRow";
import { convertAutomatedMessagesTableRowsToAutomatedMessageConfigurationEntries } from "./helpers/convertAutomatedMessagesTableRowsToAutomatedMessageConfigurationEntries";
import { getAllRowsForTriggerType } from "./queries/getAllRowsForTriggerType";

const db = require('../../../db')

export const getAllAutomatedMessageConfigurationsForTriggerType = async (triggerType: AutomatedMessageTrigger, enabledOnly: boolean = true): Promise<AutomatedMessageConfigurationEntry[]> => {
    try {
        const { rows } = await db.query(getAllRowsForTriggerType(triggerType, enabledOnly))
        
        if (typeof(rows) === 'undefined' || Object.is(rows, null)) {
            return new Promise(resolve => resolve([]))
        }
        const processedRows = convertAutomatedMessagesTableRowsToAutomatedMessageConfigurationEntries(rows)

        return new Promise(resolve => resolve(processedRows))

    } catch (error) {
        console.error(`Unable to get all automated message configurations for trigger type: ${triggerType}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}