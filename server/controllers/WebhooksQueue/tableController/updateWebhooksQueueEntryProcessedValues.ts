import { Maybe } from "../../../model/Maybe";
import { WebhooksQueueTableRow } from "../model/WebhooksQueueTableRow";
import { updateRowProcessedStatus } from "./queries/updateRowProcessedStatus";

const db = require('../../../db')

export const updateWebhooksQueueEntryProcessedValues = async (id: number, processed: boolean): Promise<Maybe<WebhooksQueueTableRow>> => {
    try {
        const { rows } = await db.query(updateRowProcessedStatus(id, processed))

        if (typeof(rows) === "undefined" || Object.is(rows, null)) {
            throw new Error(`Query result was undefined or null`)
        }

        if (rows.length <= 0) {
            return new Promise((resolve) => resolve(undefined))
        }

        return new Promise((resolve) => resolve(rows[0]))

    } catch (error) {
        console.error(`Could not update webhooks queue entry processed values, id:`, id )
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}