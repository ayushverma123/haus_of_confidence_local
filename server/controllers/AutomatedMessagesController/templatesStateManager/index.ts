import systemServiceIdentifier from "../../../constants/systemServiceIdentifier"
import { StateStore } from "../../StateManager"
import { AutomatedMessageTemplateType, AutomatedMessageTemplateTypeMap } from "../model/AutomatedMessageTemplateType"
import { ServiceState } from "./model/ServiceState"
import { StateProperties } from "./model/StateProperties"
import { randomRange } from "../../../helpers/RandomNumberGenerator"
import { Maybe } from "../../../model/Maybe"
import { getRandomArrayValue } from '../../../helpers/getRandomArrayValue'

const stateId = `${systemServiceIdentifier}_AutomatedMessageTemplates`

const _stateStore = StateStore<ServiceState>(stateId)
export const modifyValue = _stateStore.modifyValue
export const getValue = _stateStore.getValue

export const getStateObject = async (): Promise<ServiceState> => {
    try {
        const stateObject = await _stateStore.getObject()

        return new Promise((resolve) => resolve(stateObject))
    }
    catch (error) {
        console.error("ERROR: Could not retrieve state object for AutomatedMessagesController")
        console.error(error)
        return new Promise((_, reject) => reject(error))
    }
}

// TODO - TEST
export const getAllMessageTemplates = async () : Promise<Maybe<AutomatedMessageTemplateTypeMap<string[]>>> => {
    try {
        const templates = await getValue<AutomatedMessageTemplateTypeMap<string[]>>(StateProperties.templates)

        return new Promise((resolve) => resolve(templates))

    } catch (error) {
        console.error("ERROR: Unable to retrieve all message templates")
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

// TODO - TEST
export const getAllMessageTemplatesForMessageType = async (messageType: AutomatedMessageTemplateType): Promise<Maybe<string[]>> => {
    try {
        const allTemplates: AutomatedMessageTemplateTypeMap<string[]> = (await getAllMessageTemplates()) ?? {} as AutomatedMessageTemplateTypeMap<string[]>
        const filteredTemplates = allTemplates[messageType]

        return new Promise((resolve) => resolve(filteredTemplates))
    } catch (error) {
        console.error(`ERROR: Unable to retrieve all message templates for message type ${messageType}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

// TODO - TEST
export const addMessageTemplateForMessageType = async (messageType: AutomatedMessageTemplateType, messageTemplate: string) : Promise<string> => {
    try {
        const oldAllTemplatesValue = (await getAllMessageTemplates()) ?? {} as AutomatedMessageTemplateTypeMap<string[]>
        const oldMessageTypeTemplatesValue = oldAllTemplatesValue[messageType] ?? []
        
        // console.log(oldMessageTypeTemplatesValue)

        if (!oldMessageTypeTemplatesValue.includes(messageTemplate)) {
            const newAllTemplatesValue = {
                ...oldAllTemplatesValue,
                [messageType]: [ ...oldMessageTypeTemplatesValue, messageTemplate ]
            }

            await modifyValue<AutomatedMessageTemplateTypeMap<string[]>>(StateProperties.templates, newAllTemplatesValue)
        }

        return new Promise((resolve) => resolve(messageTemplate))
    } catch (error) {
        console.error(`ERROR: Unable to add message template ${messageTemplate} for message type ${messageType}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

// TODO - TEST
export const removeMessageTemplateForMessageType = async (messageType: AutomatedMessageTemplateType, messageTemplate: string) : Promise<boolean> => {
    try {
        const oldAllTemplatesValue = (await getAllMessageTemplates())?? {} as AutomatedMessageTemplateTypeMap<string[]>
        const oldMessageTypeTemplatesValue = oldAllTemplatesValue[messageType] ?? []

        if (oldMessageTypeTemplatesValue.includes(messageTemplate)) {
            // Contains message template    
            const newAllTemplatesValue = {
              ...oldAllTemplatesValue,
                [messageType]: oldMessageTypeTemplatesValue.filter(template => template !== messageTemplate)
            }

            await modifyValue<AutomatedMessageTemplateTypeMap<string[]>>(StateProperties.templates, newAllTemplatesValue)

            return new Promise((resolve) => resolve(true))
        }

        return new Promise((resolve) => resolve(true))
    } catch (error) {
        console.error(`ERROR: Unable to remove message template ${messageTemplate} for message type ${messageType}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }

}

// TODO - TEST
export const modifyMessageTemplateForMessageType = async (messageType: AutomatedMessageTemplateType, oldMessageTemplate: string, newMessageTemplate: string): Promise<string> => {

    try {
        await removeMessageTemplateForMessageType(messageType, oldMessageTemplate)
    } catch (error) {
        console.error(`ERROR: Unable to remove message template ${oldMessageTemplate} for message type ${messageType}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }

    try {
        await addMessageTemplateForMessageType(messageType, newMessageTemplate)
    } catch (error) {
        console.error(`ERROR: Unable to add message template ${newMessageTemplate} for message type ${messageType}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }

    return new Promise((resolve) => resolve(newMessageTemplate))
}

// TODO - TEST
export const getRandomMessageTemplateForMessageType = async (messageType: AutomatedMessageTemplateType): Promise<Maybe<string>> => {
    try {
        const messagesForTemplateType = (await getAllMessageTemplatesForMessageType(messageType))?? []

        const numberOfTemplates = messagesForTemplateType.length

        if (numberOfTemplates <= 0) {
            return new Promise((resolve) => resolve(undefined))
        }

        // return messagesForTemplateType[randomRange(0, numberOfTemplates)]
        return getRandomArrayValue<string>(messagesForTemplateType)

    } catch (error) {
        console.error(`ERROR: Unable to retrieve a random message template for message type ${messageType}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

