import { Maybe } from "graphql/jsutils/Maybe";
import { checkForEmptyDatabaseResponse } from "../../../db/checkForEmptyDatabaseResponse";
import { WebhookType } from "../../WebhooksController/model/WebhookType";
import { WebhooksQueueTableRow } from "../model/WebhooksQueueTableRow";
import { getRowWithId } from "./queries/getRowWithId";

const db = require('../../../db')

export const getWebhookQueueEntryWithId = async (id: number): Promise<Maybe<WebhooksQueueTableRow>> => {
    try {
        const { rows } = await db.query(getRowWithId(id))

        checkForEmptyDatabaseResponse(rows)
        
        return new Promise((resolve) => resolve(rows[0]))
    } catch (error) {
        console.error(`Could not get webhook queue entry with id ${id}.`)
        console.error(error)

        return new Promise((_, reject) => reject(error))
    }
}