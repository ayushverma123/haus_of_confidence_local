import { WebhookObject } from "./WebhookObject"

export type WebhookResponse = {
    data: WebhookObject[],
    metadata: {
        url: string
    }
}