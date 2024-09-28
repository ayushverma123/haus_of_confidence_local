import { AutomatedMessageSortType } from "./automatedMessagesSortType";

//? Mapping that converts the enum to the database column name
export const automatedMessageSortTypeToAutomatedMessagePropertiesMap: {[key in AutomatedMessageSortType]: string} = {
    [AutomatedMessageSortType.ID]: 'id',
    [AutomatedMessageSortType.ScheduleName]: 'scheduleName',
    [AutomatedMessageSortType.Enabled]: 'enabled',
    [AutomatedMessageSortType.TriggerType]: 'triggerType',
    [AutomatedMessageSortType.TimeTrigger]: 'timeTrigger',
    [AutomatedMessageSortType.TemplateType]: 'templateType',
    [AutomatedMessageSortType.TemplateCustom]: 'templateCustom',
    [AutomatedMessageSortType.ContactCriteria]: 'contactCriteria',
    [AutomatedMessageSortType.LockType]: 'lockType',
    [AutomatedMessageSortType.CustomTriggerConfig]: 'customTriggerConfig',
    [AutomatedMessageSortType.ContactCriteriaConfig]: 'contactCriteriaConfig',
    [AutomatedMessageSortType.ActiveHours]: 'restrictToHours',
    [AutomatedMessageSortType.CreatedAt]: 'createdAt',
    [AutomatedMessageSortType.UpdatedAt]: 'updatedAt'
}