import { Maybe } from "../../model/Maybe"
import { ThirdPartyService } from "../../model/ThirdPartyService"
import { WebhookType } from "./model/WebhookType"
import { GeneralWebhookObject } from "./model/GeneralWebhookObject"
import { 
    getWebhookSecret as getWebhookSecretQuery, 
    updateWebhookSecret as updateWebhookSecretQuery, 
    updateStoredWebhookObject as updateStoredWebhookObjectQuery,
    getStoredWebhookObject as getStoredWebhookObjectQuery,
    updateWebhookRegisteredStatus as updateWebhookRegisteredStatusQuery,
    getWebhookRegisteredStatus as getWebhookRegisteredStatusQuery,
    getAllWebhooksForService as getAllWebhooksForServiceQuery,
} from "./db/queries"

const db = require('../../db')

// When successful: 
// For get queries, the value is returned
// For update queries, the input value is returned

// The webhooks table contains one row for each service/webhook combination, and that row contains all the 
// data needed for that specific webhook
// Keys are PodiumWebhookType
export const updateWebhookSecret = async (service: ThirdPartyService, secretType: WebhookType, secretValue: string): Promise<string> => {

    try {
        await db.query(updateWebhookSecretQuery(service, secretType, secretValue))

        return new Promise((resolve) => resolve(secretValue))
    } catch (error) {
        console.error(`ERROR: Could not update Podium webhook secrets value for ${secretType}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getWebhookSecret = async (service: ThirdPartyService, secretType: WebhookType): Promise<Maybe<string>> => {

    try {
        
        const { rows } = await db.query(getWebhookSecretQuery(service, secretType))

        return new Promise((resolve) => resolve(rows[0].secret))

    } catch (error) {
        console.error(`ERROR: Unable to retrieve Podium secret value for ${secretType}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const updateStoredWebhookObject = async (service: ThirdPartyService, event: WebhookType, webhookObject: GeneralWebhookObject): Promise<GeneralWebhookObject> => {

    try {
        await db.query(updateStoredWebhookObjectQuery(service, event, webhookObject))

        return new Promise((resolve) => resolve(webhookObject))
    } catch (error) {
        console.error(`ERROR: Could not update Podium webhook secrets value for ${event}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getStoredWebhookObject = async (service: ThirdPartyService, event: WebhookType): Promise<Maybe<GeneralWebhookObject>> => {
    try {
        
        const { rows } = await db.query(getStoredWebhookObjectQuery(service, event))

        return new Promise((resolve) => resolve(rows[0].webhook))

    } catch (error) {
        console.error(`ERROR: Unable to retrieve Podium secret value for ${event}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}


export const updateWebhookRegisteredStatus = async (service: ThirdPartyService, event: WebhookType, registered: boolean): Promise<boolean> => { 

    try {
        await db.query(updateWebhookRegisteredStatusQuery(service, event, registered))

        return new Promise((resolve) => resolve(registered))
    } catch (error) {
        console.error(`ERROR: Could not update Podium webhook registered status for ${event}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getWebhookRegisteredStatus = async (service: ThirdPartyService, type: WebhookType): Promise<boolean> => {
    try {
        const { rows } = await db.query(getWebhookRegisteredStatusQuery(service, WebhookType[type]))

        return new Promise((resolve) => resolve(rows.length <= 0 ? false : rows[0].registered))

    } catch (error) {
        console.error(`Error getting webhook registration status for ${service}/${type}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}

export const getAllWebhooksForService = async (service: ThirdPartyService): Promise<GeneralWebhookObject[]> => {
    try {
        const { rows }: {rows: GeneralWebhookObject[]} = await db.query(getAllWebhooksForServiceQuery(service))

        return new Promise((resolve) => resolve(rows))
    } catch (error) {
        console.error(`Could not get all webhooks in the database for ${service}`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}
