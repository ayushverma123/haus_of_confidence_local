import { SocketFunctionEntry } from '../model/SocketFunctionEntry'
import { loginFrontendUser } from './system/loginFrontendUser'
import { getAuthorizationCodeUrl as getPodiumAuthorizationCodeUrl} from './services/podium/getAuthorizationCodeUrl'
import { getAuthorizationStatus as getPodiumAuthorizationStatus } from './services/podium/getAuthorizationStatus'
import { getWebhookStatuses } from './system/getWebhookStatuses'
import { getAuthorizationStatus as getGHLAuthorizationStatus } from './services/goHighLevel/getAuthorizationStatus'
import { getAuthorizationCodeUrl as getGHLAuthorizationCodeUrl } from './services/goHighLevel/getAuthorizationCodeUrl'
import { getWebhookExclusionsList } from './system/getWebhookExclusionList'
import { getAllAutomatedMessages } from './system/getAllAutomatedMessages'
import { getAllScheduledMessagesForContact } from './system/getAllScheduledMessagesForContact'
import { updateAutomatedMessageActiveValue } from './system/updateAutomatedMessageActiveValue'
import { getAutomatedMessageTriggerTypes } from './system/getAutomatedMessageTriggerTypes'
import { getContactWithContactId } from './system/getContactWithContactId'
import { getAllScheduledMessageDefaults } from './system/getAllScheduledMessageDefaults'
import { modifyScheduledMessageDefaultValue } from './system/modifyScheduledMessageDefaultValue'
import { getServerTimezone } from './system/getServerTimezone'

const _RESPONSE_error = "__ERROR_RESPONSE"

export const SocketResponse = (input: any): string => JSON.stringify(input)

//! Put Default handler compatible socket functions here
const socketFunctionsWithDefaultHandler: SocketFunctionEntry[] = [
    loginFrontendUser,   
    getPodiumAuthorizationCodeUrl,
    getPodiumAuthorizationStatus,
    getWebhookStatuses,
    getGHLAuthorizationStatus,
    getGHLAuthorizationCodeUrl,
    getWebhookExclusionsList,
    getServerTimezone,

    // getAllScheduledMessagesForContact,
    // getAllScheduledMessageDefaults,
    // modifyScheduledMessageDefaultValue,
    getContactWithContactId,
    
    //#region Automated Messages
    getAllAutomatedMessages,
    getAutomatedMessageTriggerTypes,
    updateAutomatedMessageActiveValue,
    //#endregion


]

export const socketServerFunctions = (client) => {
    const defaultErrorResponse = (error) => client.emit(_RESPONSE_error, error)
    const defaultSocketFunctionHandler = (request, response, errorResponse, socketFunction) => {
        client.on(request, async(input: any | undefined) => {
            socketFunction(input).then(
                (result) => client.emit(response, SocketResponse(result)),
                errorResponse ? errorResponse : defaultErrorResponse
            )
        })
    }

    socketFunctionsWithDefaultHandler.forEach((socketFunctionEntry: SocketFunctionEntry) => {
        const { request, response, socketFunction, errorResponse } = socketFunctionEntry
        defaultSocketFunctionHandler(request, response, errorResponse, socketFunction)
    })

    //! Custom socket endpoints go here
    
        
}