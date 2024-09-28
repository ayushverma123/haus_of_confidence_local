//? Enumberator for each field in the UI table
export enum AutomatedMessageSortType {
    ID = 'ID',
    ScheduleName = 'Schedule Name',
    Enabled = 'Enabled',
    TriggerType = 'Trigger Type',
    TimeTrigger = 'Time Trigger',
    TemplateType = 'Template Type',
    TemplateCustom = 'Custom Template Text',
    ContactCriteria = 'Contact Criteria',
    LockType = 'Lock Type',
    CustomTriggerConfig = 'Custom Trigger Config',
    ContactCriteriaConfig = 'Contact Criteria Config',
    ActiveHours = 'ActiveHours',
    CreatedAt = 'Created At',
    UpdatedAt = 'Updated At'
}
//? Mapping that converts the UI table header title to the enum
export const headerTitleToAutomatedMessageSortType: {[key in string]: AutomatedMessageSortType} = {
    'ID': AutomatedMessageSortType.ID,
    'Schedule Name': AutomatedMessageSortType.ScheduleName,
    'Enabled': AutomatedMessageSortType.Enabled,
    'Trigger Type': AutomatedMessageSortType.TriggerType,
    'Time Trigger': AutomatedMessageSortType.TimeTrigger,
    'Template Type': AutomatedMessageSortType.TemplateType,
    'Template Custom': AutomatedMessageSortType.TemplateCustom,
    'Contact Criteria': AutomatedMessageSortType.ContactCriteria,
    'Lock Type': AutomatedMessageSortType.LockType,
    'Custom Trigger Config': AutomatedMessageSortType.CustomTriggerConfig,
    'Contact Criteria Config': AutomatedMessageSortType.ContactCriteriaConfig,
    'Created At': AutomatedMessageSortType.CreatedAt,
    'Updated At': AutomatedMessageSortType.UpdatedAt
}