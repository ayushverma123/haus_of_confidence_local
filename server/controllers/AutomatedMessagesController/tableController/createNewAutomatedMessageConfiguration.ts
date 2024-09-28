import { GeneralContact } from "../../../model/GeneralContact"
import { CustomContactCriteriaFunction, CustomTriggerFunction } from "../model/AutomatedMessageConfigurationEntry"
import { AutomatedMessageContactCriteria } from "../model/AutomatedMessageContactCriteria"
import { AutomatedMessageLockType } from "../model/AutomatedMessageLockType"
import { AutomatedMessageTemplateType } from "../model/AutomatedMessageTemplateType"
import { AutomatedMessageTrigger } from "../model/AutomatedMessageTrigger"
import { AutomatedMessageCustomContactCriteriaConfiguration } from "../model/CustomContactCriteria/AutomatedMessageCustomContactCriteriaConfiguration"
import { AutomatedMessageTimeTriggerConfiguration } from "../model/AutomatedMessageTimeTriggerConfiguration"
import { insertRow } from "./queries/insertRow"
import { AutomatedMessageCustomTriggerConfiguration } from "../model/AutomatedMessageCustomTriggerConfiguration"
import { AutomatedMessageRestrictToHoursConfigEntry } from "../model/AutomatedMessageRestrictToHoursConfigEntry"


const db = require('../../../db')

export const createNewAutomatedMessageConfiguration = async (
    name: string, 
    enabled: boolean = true,
    triggerType: AutomatedMessageTrigger,
    templateType: AutomatedMessageTemplateType, 
    contactCriteria: AutomatedMessageContactCriteria,
    customContactCriteriaConfig?: AutomatedMessageCustomContactCriteriaConfiguration,
    templateCustom?: string[],
    timeTrigger?: AutomatedMessageTimeTriggerConfiguration,
    customTriggerConfig?: AutomatedMessageCustomTriggerConfiguration,
    lockType: AutomatedMessageLockType = AutomatedMessageLockType.None,
    restrictToHours?: AutomatedMessageRestrictToHoursConfigEntry
) => {
    try {
        // console.log(insertRow(
        //     name,
        //     triggerType,
        //     templateType,
        //     contactCriteria,
        //     customTriggerConfig,
        //     templateCustom,
        //     timeTrigger,
        //     customContactCriteriaConfig,
        //     enabled,
        //     lockType,
        //     restrictToHours
        // ))

        const { rows } = await db.query(insertRow(
            name,
            triggerType,
            templateType,
            contactCriteria,
            customTriggerConfig,
            templateCustom,
            timeTrigger,
            customContactCriteriaConfig,
            enabled,
            lockType,
            restrictToHours
        ))

        if (Object.is(rows, null) || typeof(rows) === 'undefined') {
            throw new Error('Did not receive newly created row as response to query')
        }

        if (rows.length === 0) {
            throw new Error('Response to newly created appointment row query was empty')
        }

        return new Promise(resolve => resolve(rows[0]))
    } catch (error) {
        console.error(`Could not create new automated message configuration`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}