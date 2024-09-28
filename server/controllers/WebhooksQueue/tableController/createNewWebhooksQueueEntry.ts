import { Request, Response } from "express"
import { ThirdPartyService } from "../../../model/ThirdPartyService"
import { WebhookType } from "../../WebhooksController/model/WebhookType"
import { WebhooksQueueTableRow } from "../model/WebhooksQueueTableRow"
import { insertRow } from "./queries/insertRow"

const db = require('../../../db')


export const createNewWebhooksQueueEntry = async (    
    type: WebhookType,
    service: ThirdPartyService,
    webhook_data: any,
    received_at: Date
):Promise<WebhooksQueueTableRow> => {
    try {
        const { rows } = await db.query(insertRow(type, service, webhook_data, received_at))

        if (typeof(rows) === "undefined" || Object.is(rows, null)) {
            throw new Error(`Query response was undefined or null`)
        }

        if (rows.length <= 0) {
            throw new Error(`Query response contained no rows`)
        }

        return new Promise((resolve) => resolve(rows[0]))
    } catch (error) {
        console.error(`Could not create new row in webhooks_queue table`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}