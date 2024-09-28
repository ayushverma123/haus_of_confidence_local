import tableName from "../../constants/tableName";
import { AutomatedMessageTrigger } from "../../model/AutomatedMessageTrigger";

export const getAllRowsForTriggerType = (triggerType: AutomatedMessageTrigger, enabledOnly: boolean = true) => ({
    text: `SELECT * FROM ${tableName} WHERE trigger_type = $1
        ${enabledOnly ? 'AND enabled = $2' : ''}
    ;`,
    values: enabledOnly ? [ triggerType, enabledOnly ] : [ triggerType ]
})