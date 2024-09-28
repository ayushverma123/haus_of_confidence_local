import { SocketResponse } from ".."
import { excludeWebhookEventRegistrationForService } from "../../controllers/WebhooksController/constants/excludeWebhookEventRegistrationForService"
import { SocketFunctionEntry } from "../../model/SocketFunctionEntry"

export const requestCallString = 'REQUEST_getWebhookExclusionsList'
export const responseCallString = 'RESPONSE_getWebhookExclusionsList'

export const getWebhookExclusionsList: SocketFunctionEntry = {
    request: requestCallString,
    response: responseCallString,

    socketFunction: async (_) => {
        try {
            return new Promise((resolve) => resolve(excludeWebhookEventRegistrationForService))
        } catch (error) {
            return new Promise((_, reject) => reject(error))
        }
    }
}