import { Maybe } from "../../../model/Maybe";
import { WebhooksQueueTableRow } from "../model/WebhooksQueueTableRow";
import { updateRowErrorValue } from "./queries/updateRowErrorValue";

const db = require('../../../db')

export const updateWebhooksQueueEntryErrorValue = async (id: number, _error: Error): Promise<Maybe<WebhooksQueueTableRow>> => {

    try {
        const { rows } = await db.query(updateRowErrorValue(id, _error))

        if (typeof(rows) === "undefined" || Object.is(rows, null)) {
            throw new Error(`Query result was undefined or null`)
        }

        if (rows.length <= 0) {
            return new Promise((resolve) => resolve(undefined))
        }

        return new Promise((resolve) => resolve(rows[0]))

    } catch (error) {
        console.error(`Could not update webhooks queue entry error value, id:`, id )
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}