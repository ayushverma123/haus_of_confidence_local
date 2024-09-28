import { AutomatedMessageConfigurationEntry } from "../../model/AutomatedMessageConfigurationEntry";
import { TableRow } from "../../model/AutomatedMessagesTableRow";

const JSONfn = require('json-fn')

const keyNameMapping: {[key: string]: string} = {
    id: 'id',
    schedule_name:'scheduleName',
    trigger_type: 'triggerType',
    time_trigger: 'timeTrigger',
    // custom_trigger_function: 'customTriggerFunction',
    template_type: 'templateType',
    template_custom: 'templateCustom',
    contact_criteria: 'contactCriteria',
    // contact_criteria_custom_function: 'contactCriteriaCustomFunction',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    enabled: 'enabled',
    lock_type: 'lockType',
    custom_trigger_config: 'customTriggerConfig',
    contact_criteria_config: 'contactCriteriaConfig',
    restrict_to_hours: 'restrictToHours',
    send_message_to: 'sendMessageTo',
    staff_message_templates: 'staffMessageTemplates'
}

//@ts-ignore
export const convertAutomatedMessagesTableRowsToAutomatedMessageConfigurationEntries = (rows: TableRow[]): AutomatedMessageConfigurationEntry[] => {

    // Use JSONfn.parse to restore functions
    //@ts-ignore
    // const entryWithExpandedFunctions: TableRow[] = rows.reduce((acc, currentEntry: TableRow) => [
    //     ...acc,
    //     {
    //         ...currentEntry,
    //         custom_trigger_function: (() => {
    //             if (typeof(currentEntry.custom_trigger_function) === 'undefined' || Object.is(currentEntry.custom_trigger_function, null)) return undefined
    //             if (currentEntry.custom_trigger_function.length <= 0) return undefined
    //             return JSONfn.parse(currentEntry.custom_trigger_function)
    //         })(),
    //         contact_criteria_custom_function: (() => {
    //             if(typeof(currentEntry.contact_criteria_custom_function) === 'undefined' || Object.is(currentEntry.contact_criteria_custom_function, null)) return undefined
    //             if (currentEntry.contact_criteria_custom_function.length <= 0) return undefined
    //             return JSONfn.parse(currentEntry.contact_criteria_custom_function)
    //         })
    //     }
    // ], [])

    // Change key names from database column names to the expected property names
    // return entryWithExpandedFunctions.map((entry: TableRow): AutomatedMessageConfigurationEntry => 
    return rows.map((entry: TableRow): AutomatedMessageConfigurationEntry => 
        //@ts-ignore
        Object.keys(entry).reduce((accEntry: AutomatedMessageConfigurationEntry, currentKey: string): AutomatedMessageConfigurationEntry => {
            // Replace the current key with the mapped key
            const newKey: string = keyNameMapping[currentKey]
            const data: any = entry[currentKey]

            return {
                ...accEntry,
                [newKey]: data
            } 
        }, [])
    )
} 
