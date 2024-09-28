import { ThirdPartyService } from "../../../model/ThirdPartyService"
import { WebhookType } from "../model/WebhookType"
import { GeneralWebhookObject } from "../model/GeneralWebhookObject"

const table = 'webhooks'
const serviceKey = (service: ThirdPartyService, type: WebhookType): string => `${service}_${type}`

export const createWebhookRow =  (service: ThirdPartyService, type: WebhookType) => ({
    text: `INSERT INTO ${table} (id, service, type) VALUES ($1, $2, $3)`,
    values: [
        serviceKey(service, type),
        service,
        type
    ]
})

export const getWebhookSecret = (service: ThirdPartyService, type: WebhookType): string => 
`SELECT secret FROM ${table} WHERE id = '${serviceKey(service, type)}'`

export const updateWebhookSecret = (service: ThirdPartyService, type: WebhookType, secret: string): string => 
`UPDATE ${table} SET secret = '${secret}' WHERE id = '${serviceKey(service, type)}'`

export const getStoredWebhookObject = (service: ThirdPartyService, type: WebhookType): string => 
`SELECT webhook FROM ${table} WHERE id = '${serviceKey(service, type)}'`

export const updateStoredWebhookObject = (service: ThirdPartyService, type: WebhookType, webhookObject: GeneralWebhookObject): string => 
`UPDATE ${table} SET webhook = '${JSON.stringify(webhookObject)}' WHERE id = '${serviceKey(service, type)}'`

export const getWebhookRegisteredStatus = (service: ThirdPartyService, type: WebhookType): string => 
`SELECT registered FROM ${table} WHERE id = '${serviceKey(service, type)}'`

export const updateWebhookRegisteredStatus = (service: ThirdPartyService, type: WebhookType, registered: boolean): string =>
`UPDATE ${table} SET registered = '${registered}' WHERE id = '${serviceKey(service, type)}'`

export const getAllWebhooksForService = (service: ThirdPartyService): string => 
`SELECT * FROM ${table} WHERE service = '${service}' AND registered = true`
