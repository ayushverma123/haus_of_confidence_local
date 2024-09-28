import { checkForEmptyDatabaseResponse } from "../../../db/checkForEmptyDatabaseResponse";
import { WebhookType } from "../../WebhooksController/model/WebhookType";
import { WebhooksQueueTableRow } from "../model/WebhooksQueueTableRow";
import { getAllRows } from "./queries/getAllRows";

const db = require('../../../db')

export const getAllWebhooksQueueEntries = async (webhookType?: WebhookType): Promise<WebhooksQueueTableRow[]> => {
    try {
        const { rows } = await db.query(getAllRows(webhookType))

        checkForEmptyDatabaseResponse(rows)
        
        return new Promise((resolve) => resolve(rows))
    } catch (error) {
        console.error(`Could not get all webhooks queue entries${typeof(webhookType) !== 'undefined' ? ` for webhook type: ${webhookType}` : ''}.`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}