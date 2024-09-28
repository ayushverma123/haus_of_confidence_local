import tableName from '../../constants/tableName'
import { AutomatedMessageContactCriteria } from '../../model/AutomatedMessageContactCriteria'
import { AutomatedMessageCustomTriggerConfiguration } from '../../model/AutomatedMessageCustomTriggerConfiguration'
import { AutomatedMessageLockType } from '../../model/AutomatedMessageLockType'
import { AutomatedMessageRestrictToHoursConfigEntry } from '../../model/AutomatedMessageRestrictToHoursConfigEntry'
import { AutomatedMessageTemplateType } from '../../model/AutomatedMessageTemplateType'
import { AutomatedMessageTimeTriggerConfiguration } from '../../model/AutomatedMessageTimeTriggerConfiguration'
import { AutomatedMessageTrigger } from '../../model/AutomatedMessageTrigger'
import { AutomatedMessageCustomContactCriteriaConfiguration } from '../../model/CustomContactCriteria/AutomatedMessageCustomContactCriteriaConfiguration'

const JSONfn = require('json-fn')

export const insertRow = (
    name: string, 
    triggerType: AutomatedMessageTrigger,
    templateType: AutomatedMessageTemplateType, 
    contactCriteria: AutomatedMessageContactCriteria,
    customTriggerConfig?: AutomatedMessageCustomTriggerConfiguration,
    // customTriggerFunction?:  CustomTriggerFunction,
    templateCustom?: string[],
    timeTrigger?: AutomatedMessageTimeTriggerConfiguration,
    customContactCriteriaConfig?: AutomatedMessageCustomContactCriteriaConfiguration,
    // contactCriteriaCustomFunction?: CustomContactCriteriaFunction,
    enabled: boolean = true,
    lockType: AutomatedMessageLockType = AutomatedMessageLockType.None,
    restrictToHours?: AutomatedMessageRestrictToHoursConfigEntry
) => {
    const triggerTypeIsTime = triggerType === AutomatedMessageTrigger.TimeRelativeWithtimezone || triggerType === AutomatedMessageTrigger.TimeSpecificWithtimezone || triggerType === AutomatedMessageTrigger.TimeSpecific

    const triggerTypeIsCustom = triggerType === AutomatedMessageTrigger.CustomFunction

    const templateTypeIsCustom = templateType === AutomatedMessageTemplateType.Custom

    const contactCriteriaIsCustom = contactCriteria === AutomatedMessageContactCriteria.Custom || contactCriteria === AutomatedMessageContactCriteria.CurrentActionWithFunction
    
    const hasCustomTriggerConfig = typeof(customTriggerConfig) !== 'undefined'
    const hasContactCriteriaCustomConfig = typeof(customContactCriteriaConfig) !== 'undefined'
    const hasTimeTrigger = typeof(timeTrigger) !== 'undefined'
    const hasTemplateCustom = typeof(templateCustom)!== 'undefined'

    if (triggerTypeIsTime && !hasTimeTrigger) {
        throw new Error("time_trigger is required when using a Timed Event Trigger")
    }

    if (triggerTypeIsCustom && !hasCustomTriggerConfig) {
        throw new Error("custom_trigger_function is required when using a Custom Event Trigger")
    }

    if (templateTypeIsCustom && !hasTemplateCustom) {
        throw new Error("template_custom is required when using a Custom Template")
    }

    if (contactCriteriaIsCustom && !hasContactCriteriaCustomConfig) {
        throw new Error("contact_criteria_custom_function is required when using a Custom Contact Criteria")
    }

    const useCustomTriggerFunction = triggerTypeIsCustom && hasCustomTriggerConfig
    const useContactCriteriaCustomFunction = contactCriteriaIsCustom && hasContactCriteriaCustomConfig
    const useTimeTrigger = triggerTypeIsTime && hasTimeTrigger
    const useTemplateCustom = templateTypeIsCustom && hasTemplateCustom
    const useRestrictToHours = typeof(restrictToHours) !== 'undefined'

    const optionalParametersCheck = [
        useCustomTriggerFunction,
        useTemplateCustom,
        useTimeTrigger, 
        useContactCriteriaCustomFunction,
        useRestrictToHours
    ]

    // console.log(optionalParametersCheck)

    const optionalParametersValues = [
        JSON.stringify(customTriggerConfig),
        templateCustom,
        JSON.stringify(timeTrigger), 
        JSON.stringify(customContactCriteriaConfig),
        JSON.stringify(restrictToHours)
    ]


    // console.log(optionalParametersValues)

    const requiredValues =  [
        name,
        triggerType,
        templateType,
        contactCriteria,
        enabled,
        lockType
    ]

    //@ts-ignore
    const optionsParameters: string[] = optionalParametersCheck.reduce((acc, cv) => cv ? [...acc, acc.length + (requiredValues.length + 1)] : acc, []).map(item => `$${item}`)

    //@ts-ignore
    const optionsValues = optionalParametersCheck.reduce((acc, cv, index) => {
        return cv ? [...acc, optionalParametersValues[index]] : acc
    }, [])
    
    // console.log(optionsCheck)
    // console.log(optionsValues)

    // console.log(customTriggerFunction)

    const query = {
        text: `
            INSERT INTO ${tableName} (
                schedule_name, 
                trigger_type, 
                template_type, 
                contact_criteria,
                enabled,
                lock_type
                ${ useCustomTriggerFunction ? ',custom_trigger_function' : ''}
                ${ useTemplateCustom ? ',template_custom' : '' } 
                ${ useTimeTrigger ? ',time_trigger' : ''}
                ${ useContactCriteriaCustomFunction ? ',contact_criteria_custom_function' : '' }
                ${ useRestrictToHours ? ',restrict_to_hours' : ''}
            ) VALUES (
                $1, 
                $2, 
                $3, 
                $4,
                $5,
                $6,
                ${optionsParameters}
            )
        RETURNING *;`,
        values: [
            name,
            triggerType,
            templateType,
            contactCriteria,
            enabled,
            lockType,
            // @ts-ignore
            ...optionsValues
        ]
    }

    return query
}