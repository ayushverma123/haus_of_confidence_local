import { WebhookType } from "../../../WebhooksController/model/WebhookType";
import tableName from "../../constants/tableName";

export const getAllRows = (webhookType?: WebhookType) => {
    const hasWebhookType = typeof(webhookType) !== 'undefined'

    return {
        text: `
            SELECT * FROM ${tableName} ${hasWebhookType ? 'WHERE type = $1' : ''}
        ;`,
        values: hasWebhookType? [webhookType] : []
    }
}