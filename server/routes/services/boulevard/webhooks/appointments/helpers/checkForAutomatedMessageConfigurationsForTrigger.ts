import { AutomatedMessageConfigurationEntry } from "../../../../../../controllers/AutomatedMessagesController/model/AutomatedMessageConfigurationEntry";
import { AutomatedMessageTrigger } from "../../../../../../controllers/AutomatedMessagesController/model/AutomatedMessageTrigger";
import { getAllAutomatedMessageConfigurationsForTriggerType } from "../../../../../../controllers/AutomatedMessagesController/tableController/getAllAutomatedMessageConfigurationsForTriggerType";
import { Maybe } from "../../../../../../model/Maybe";

export type CheckForAutomatedMessageConfigurationsForTriggerResult = {
    hasAutomatedMessages: boolean,
    automatedMessages: AutomatedMessageConfigurationEntry[]
}
export const checkForAutomatedMessageConfigurationsForTrigger = async (trigger: AutomatedMessageTrigger): Promise<CheckForAutomatedMessageConfigurationsForTriggerResult> => {
    try {
        const automatedMessages: Maybe<AutomatedMessageConfigurationEntry[]> = await getAllAutomatedMessageConfigurationsForTriggerType(trigger)
            
        const hasAutomatedMessages = (() => {
            if (typeof(automatedMessages) !== 'undefined' && !Object.is(automatedMessages, null)) return automatedMessages.length > 0
            return false
        })()

        return new Promise((resolve) => resolve({
            hasAutomatedMessages,
            automatedMessages: automatedMessages
        }))
    } catch (error) {
        console.error(`Failed to check for automated message configurations for trigger ${trigger}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}