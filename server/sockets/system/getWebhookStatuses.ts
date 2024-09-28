import { getWebhookRegisteredStatus } from "../../controllers/WebhooksController/WebhookStateManager"
import { SocketFunctionEntry } from "../../model/SocketFunctionEntry"
import { ThirdPartyService } from "../../model/ThirdPartyService"
import { WebhookType } from "../../controllers/WebhooksController/model/WebhookType"
import { WebhookStatusReport } from "../../controllers/WebhooksController/model/WebhookStatusReport"

export const requestCallString = 'REQUEST_webhookStatus'
export const responseCallString = 'RESPONSE_webhookStatus'

export const getWebhookStatuses: SocketFunctionEntry = {
    request: requestCallString,
    response: responseCallString,

    socketFunction: async (service: ThirdPartyService) => {
        try {

            const webhookKeys = Object.keys(WebhookType)

            const statuses = await webhookKeys.reduce(

                //@ts-ignore
                async (allWebhookStatuses: Promise<WebhookStatusReport>, currentWebhook: WebhookType): Promise<WebhookStatusReport> => {
                    try {
                        
                        const status = await getWebhookRegisteredStatus(service, currentWebhook)

                        const returnValue = {
                            ...await allWebhookStatuses,
                            [currentWebhook]: status
                        }

                        return new Promise((resolve) => resolve(returnValue))
                        
                    } catch (error) {

                        const returnValue = {
                            ...await allWebhookStatuses,
                            [currentWebhook]: false
                        }

                        return new Promise((resolve) => resolve(returnValue))
                    }
                }, {})

            return new Promise((resolve) => resolve({[service]: statuses}))
        } catch (error) {
            return new Promise((_,reject) => reject(error))
        }
    }
}