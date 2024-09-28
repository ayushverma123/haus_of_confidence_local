import { AutomatedMessageContactCriteria } from "./AutomatedMessageContactCriteria";
import { AutomatedMessageLockType } from "./AutomatedMessageLockType";
import { AutomatedMessageTemplateType } from "./AutomatedMessageTemplateType";
import { AutomatedMessageTrigger } from "./AutomatedMessageTrigger";
import { AutomatedMessageCustomContactCriteriaConfiguration } from "./CustomContactCriteria/AutomatedMessageCustomContactCriteriaConfiguration";
import { AutomatedMessageTimeTriggerConfiguration } from "./AutomatedMessageTimeTriggerConfiguration";
import { AutomatedMessageCustomTriggerConfiguration } from "./AutomatedMessageCustomTriggerConfiguration";
import { AutomatedMessageRestrictToHoursConfigEntry } from "./AutomatedMessageRestrictToHoursConfigEntry";

export interface TableRow {
    id: number,
    schedule_name: string,
    trigger_type: AutomatedMessageTrigger,
    time_trigger?: AutomatedMessageTimeTriggerConfiguration,
    // custom_trigger_function?: string, //(currentTime: string, dataObject: any) => Promise<boolean>,
    template_type: AutomatedMessageTemplateType,
    template_custom?: string[],
    contact_criteria: AutomatedMessageContactCriteria,
    // contact_criteria_custom_function?: string, //(dataObject: any) => Promise<GeneralContact[]> 
    // Intention is to create a filter function that returns the array of GeneralContacts needed
    // ALL GeneralContacts with their associated appointment data will be the input
    created_at: string,
    updated_at: string,
    enabled: boolean,
    lock_type: AutomatedMessageLockType,
    custom_trigger_config?: AutomatedMessageCustomTriggerConfiguration,
    contact_criteria_config?: AutomatedMessageCustomContactCriteriaConfiguration,
    restrict_to_hours?: AutomatedMessageRestrictToHoursConfigEntry
}