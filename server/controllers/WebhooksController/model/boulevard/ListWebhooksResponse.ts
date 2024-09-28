import { Edge } from "./Edge"
import { PageInfo } from "./PageInfo"

export type ListWebhooksResponse = {
    webhooks: {
        edges: Edge<WebhookResponseItem>[],
        pageInfo: PageInfo
    }
}

export type WebhookResponseItem = {
    createdAt: string,
    updatedAt: string,
    id: string,
    name: string,
    url: string,
    subscriptions: [{
        id?: string,
        enabled: boolean,
        eventType: string
    }]
}